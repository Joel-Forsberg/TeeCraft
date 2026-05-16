using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TeeCraft.API.Data;
using TeeCraft.API.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using TeeCraft.API.DTOs.Products;


namespace TeeCraft.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProductsController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/products
    [HttpGet]
    public async Task<ActionResult<PagedResultDto<ProductDto>>> GetProducts(
     int page = 1,
     int pageSize = 10,
     string? sortBy = null,
     bool descending = false)
    {
        if (page <= 0)
        {
            return BadRequest("Page must be greater than 0.");
        }

        if (pageSize <= 0 || pageSize > 50)
        {
            return BadRequest("Page size must be between 1 and 50.");
        }

        var query = _context.Products
            .Where(p => !p.IsDeleted)
            .Include(p => p.Category)
            .Include(p => p.ProductVariants)
            .AsQueryable();

        query = sortBy?.ToLower() switch
        {
            "price" => descending
                ? query.OrderByDescending(p => p.BasePrice)
                : query.OrderBy(p => p.BasePrice),

            "name" => descending
                ? query.OrderByDescending(p => p.Name)
                : query.OrderBy(p => p.Name),

            _ => query.OrderBy(p => p.ProductId)
        };

        var totalItems = await query.CountAsync();

        var products = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new ProductDto
            {
                ProductId = p.ProductId,
                Name = p.Name,
                Description = p.Description,
                BasePrice = p.BasePrice,
                CategoryId = p.CategoryId,
                CategoryName = p.Category.Name,

                AverageRating = _context.Reviews
                    .Where(r => r.ProductId == p.ProductId)
                    .Any()
                        ? _context.Reviews
                            .Where(r => r.ProductId == p.ProductId)
                            .Average(r => r.Rating)
                        : 0,

                ReviewCount = _context.Reviews
                    .Count(r => r.ProductId == p.ProductId),

                ProductVariants = p.ProductVariants.Select(v => new ProductVariantDto
                {
                    ProductVariantId = v.ProductVariantId,
                    ProductId = v.ProductId,
                    ProductName = p.Name,
                    Color = v.Color,
                    Size = v.Size,
                    Fit = v.Fit,
                    StockQuantity = v.StockQuantity,
                    Price = v.Price
                }).ToList()
            })
            .ToListAsync();

        var result = new PagedResultDto<ProductDto>
        {
            Page = page,
            PageSize = pageSize,
            TotalItems = totalItems,
            TotalPages = (int)Math.Ceiling(totalItems / (double)pageSize),
            Items = products
        };

        return Ok(result);
    }

    // GET: api/product/1
    [HttpGet("{id}")]
    public async Task<ActionResult<ProductDto>> GetProduct(int id)
    {
        var product = await _context.Products
            .Where(p => p.ProductId == id && !p.IsDeleted)
            .Include(p => p.Category)
            .Include(p => p.ProductVariants)
            .Select(p => new ProductDto
          {
              ProductId = p.ProductId,
              Name = p.Name,
              Description = p.Description,
              BasePrice = p.BasePrice,
              CategoryId = p.CategoryId,
              CategoryName = p.Category.Name,

              AverageRating = _context.Reviews
              .Where(r => r.ProductId == p.ProductId)
              .Any()
            ? _context.Reviews
                .Where(r => r.ProductId == p.ProductId)
                .Average(r => r.Rating)
            : 0,

              ReviewCount = _context.Reviews
              .Count(r => r.ProductId == p.ProductId),

              ProductVariants = p.ProductVariants.Select(v => new ProductVariantDto
              {
                  ProductVariantId = v.ProductVariantId,
                  ProductId = v.ProductId,
                  ProductName = v.Product.Name,
                  Color = v.Color,
                  Size = v.Size,
                  Fit = v.Fit,
                  StockQuantity = v.StockQuantity,
                  Price = v.Price
              }).ToList()
          })
            .FirstOrDefaultAsync();

        if (product == null)
        {
            return NotFound();
        }

        return product;
    }
    // POST: api/products
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<Product>> CreateProduct(CreateProductDto dto)
    {
        var product = new Product
        {
            Name = dto.Name,
            Description = dto.Description,
            BasePrice = dto.BasePrice,
            CategoryId = dto.CategoryId
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetProduct), new { id = product.ProductId }, product);
    }

    // PUT: api/products/1
    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProduct(int id, CreateProductDto dto)
    {
        var product = await _context.Products.FindAsync(id);

        if (product == null)
        {
            return NotFound();
        }

        product.Name = dto.Name;
        product.Description = dto.Description;
        product.BasePrice = dto.BasePrice;
        product.CategoryId = dto.CategoryId;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/products/1
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var product = await _context.Products
            .Include(p => p.ProductVariants)
            .FirstOrDefaultAsync(p => p.ProductId == id);

        if (product == null)
        {
            return NotFound();
        }

        product.IsDeleted = true;
        _context.AuditLogs.Add(new AuditLog
        {
            UserId = null,
            Action = "DELETE",
            EntityName = "Product",
            EntityId = product.ProductId,
            Details = $"Product '{product.Name}' was soft deleted."
        });
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // GET: api/products/search?query=tee&color=Black&size=L&minPrice=100&maxPrice=400
    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<ProductDto>>> SearchProducts(
        string? query,
        int? categoryId,
        string? color,
        string? size,
        decimal? minPrice,
        decimal? maxPrice)
    {
        var productsQuery = _context.Products
            .Where(p => !p.IsDeleted)
            .Include(p => p.Category)
            .Include(p => p.ProductVariants)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(query))
        {
            productsQuery = productsQuery.Where(p =>
                p.Name.Contains(query) ||
                p.Description.Contains(query));
        }

        if (categoryId.HasValue)
        {
            productsQuery = productsQuery.Where(p => p.CategoryId == categoryId.Value);
        }

        if (!string.IsNullOrWhiteSpace(color))
        {
            productsQuery = productsQuery.Where(p =>
                p.ProductVariants.Any(v => v.Color == color));
        }

        if (!string.IsNullOrWhiteSpace(size))
        {
            productsQuery = productsQuery.Where(p =>
                p.ProductVariants.Any(v => v.Size == size));
        }

        if (minPrice.HasValue)
        {
            productsQuery = productsQuery.Where(p =>
                p.ProductVariants.Any(v => v.Price >= minPrice.Value));
        }

        if (maxPrice.HasValue)
        {
            productsQuery = productsQuery.Where(p =>
                p.ProductVariants.Any(v => v.Price <= maxPrice.Value));
        }

        var products = await productsQuery
           .Select(p => new ProductDto
           {
               ProductId = p.ProductId,
               Name = p.Name,
               Description = p.Description,
               BasePrice = p.BasePrice,
               CategoryId = p.CategoryId,
               CategoryName = p.Category.Name,

               AverageRating = _context.Reviews
        .Where(r => r.ProductId == p.ProductId)
        .Any()
            ? _context.Reviews
                .Where(r => r.ProductId == p.ProductId)
                .Average(r => r.Rating)
            : 0,

               ReviewCount = _context.Reviews
        .Count(r => r.ProductId == p.ProductId),

               ProductVariants = p.ProductVariants.Select(v => new ProductVariantDto
               {
                   ProductVariantId = v.ProductVariantId,
                   ProductId = v.ProductId,
                   ProductName = v.Product.Name,
                   Color = v.Color,
                   Size = v.Size,
                   Fit = v.Fit,
                   StockQuantity = v.StockQuantity,
                   Price = v.Price
               }).ToList()
           })
            .ToListAsync();

        return Ok(products);
    }

    // PUT: api/products/1/restore
    [Authorize(Roles = "Admin")]
    [HttpPut("{id}/restore")]
    public async Task<IActionResult> RestoreProduct(int id)
    {
        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.ProductId == id);

        if (product == null)
        {
            return NotFound();
        }

        product.IsDeleted = false;
        _context.AuditLogs.Add(new AuditLog
        {
            UserId = null,
            Action = "RESTORE",
            EntityName = "Product",
            EntityId = product.ProductId,
            Details = $"Product '{product.Name}' was restored."
        });
        await _context.SaveChangesAsync();

        return NoContent();
    }
}