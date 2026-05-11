using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TeeCraft.API.Data;
using TeeCraft.API.DTOs;
using TeeCraft.API.Models;
using Microsoft.AspNetCore.Authorization;

namespace TeeCraft.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ProductVariantsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProductVariantsController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/productvariants
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductVariantDto>>> GetProductVariants()
    {
        return await _context.ProductVariants
            .Include(v => v.Product)
            .Select(v => new ProductVariantDto
            {
                ProductVariantId = v.ProductVariantId,
                ProductId = v.ProductId,
                ProductName = v.Product.Name,
                Color = v.Color,
                Size = v.Size,
                Fit = v.Fit,
                StockQuantity = v.StockQuantity,
                Price = v.Price
            })
            .ToListAsync();
    }
    // GET: api/productvariants/1
    [HttpGet("{id}")]
    public async Task<ActionResult<ProductVariantDto>> GetProductVariant(int id)
    {
        var variant = await _context.ProductVariants
            .Include(v => v.Product)
            .Where(v => v.ProductVariantId == id)
            .Select(v => new ProductVariantDto
            {
                ProductVariantId = v.ProductVariantId,
                ProductId = v.ProductId,
                ProductName = v.Product.Name,
                Color = v.Color,
                Size = v.Size,
                Fit = v.Fit,
                StockQuantity = v.StockQuantity,
                Price = v.Price
            })
            .FirstOrDefaultAsync();

        if (variant == null)
        {
            return NotFound();
        }

        return variant;
    }

    // POST: api/productvariants
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<ProductVariant>> CreateProductVariant(CreateProductVariantDto dto)
    {
        var productExists = await _context.Products.AnyAsync(p => p.ProductId == dto.ProductId);

        if (!productExists)
        {
            return BadRequest("Product does not exist.");
        }

        var variant = new ProductVariant
        {
            ProductId = dto.ProductId,
            Color = dto.Color,
            Size = dto.Size,
            Fit = dto.Fit,
            StockQuantity = dto.StockQuantity,
            Price = dto.Price
        };

        _context.ProductVariants.Add(variant);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetProductVariant), new { id = variant.ProductVariantId }, variant);
    }

    // PUT: api/productvariants/1/stock
    [Authorize(Roles = "Admin")]
    [HttpPut("{id}/stock")]
    public async Task<IActionResult> UpdateStock(int id, UpdateStockDto dto)
    {
        if (dto.StockQuantity < 0)
        {
            return BadRequest("Stock quantity cannot be negative.");
        }

        var variant = await _context.ProductVariants.FindAsync(id);

        if (variant == null)
        {
            return NotFound();
        }

        variant.StockQuantity = dto.StockQuantity;

        await _context.SaveChangesAsync();

        return NoContent();
    }
}