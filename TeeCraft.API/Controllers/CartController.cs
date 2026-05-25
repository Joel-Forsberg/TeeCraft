using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TeeCraft.API.Data;
using TeeCraft.API.DTOs;
using TeeCraft.API.DTOs.Cart;
using TeeCraft.API.Models;

namespace TeeCraft.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class CartController : ControllerBase
{
    private readonly AppDbContext _context;

    public CartController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("{customerId}")]
    public async Task<IActionResult> GetCart(int customerId)
    {
        var cart = await _context.Carts
        .Include(c => c.CartItems)
        .ThenInclude(ci => ci.ProductVariant)
            .ThenInclude(pv => pv.Product)
        .FirstOrDefaultAsync(c => c.CustomerId == customerId);

        if (cart == null)
        {
            return NotFound("Cart not found.");
        }

        return Ok(new
        {
            cart.CartId,
            cart.CustomerId,
            Items = cart.CartItems.Select(item => new
            {
                item.CartItemId,
                item.ProductVariantId,
                item.Quantity,
                ProductName = item.ProductVariant.Product.Name,
                Color = item.ProductVariant.Color,
                Size = item.ProductVariant.Size,
                Fit = item.ProductVariant.Fit,
                Price = item.ProductVariant.Price
            })
        });
    }
    
    [Authorize]
    [HttpPost("items")]
    public async Task<ActionResult<CartItem>> AddItemToCart(AddCartItemDto dto)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
        {
            return Unauthorized();
        }

        var userId = int.Parse(userIdClaim);

        var customer = await _context.Customers
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (customer == null)
        {
            return NotFound("Customer profile not found.");
        }
        
        if (dto.Quantity <= 0)
        {
            return BadRequest("Quantity must be greater than 0.");
        }

        var productVariant = await _context.ProductVariants
            .FirstOrDefaultAsync(v => v.ProductVariantId == dto.ProductVariantId);

        if (productVariant == null)
        {
            return BadRequest("Product variant does not exist.");
        }

        var cart = await _context.Carts
            .Include(c => c.CartItems)
            .FirstOrDefaultAsync(c => c.CustomerId == customer.CustomerId);

        if (cart == null)
        {
            cart = new Cart
            {
                CustomerId = customer.CustomerId
            };

            _context.Carts.Add(cart);
            await _context.SaveChangesAsync();
        }

        var existingItem = cart.CartItems
            .FirstOrDefault(i => i.ProductVariantId == dto.ProductVariantId);

        if (existingItem != null)
        {
            existingItem.Quantity += dto.Quantity;
        }
        else
        {
            var cartItem = new CartItem
            {
                CartId = cart.CartId,
                ProductVariantId = dto.ProductVariantId,
                Quantity = dto.Quantity
            };

            _context.CartItems.Add(cartItem);
        }

        await _context.SaveChangesAsync();

        return Ok("Item added to cart.");
    }

    // GET: api/cart/5/summary
    [HttpGet("{customerId}/summary")]
    public async Task<ActionResult<CartSummaryDto>> GetCartSummary(int customerId)
    {
        var cart = await _context.Carts
            .Include(c => c.CartItems)
            .ThenInclude(ci => ci.ProductVariant)
            .ThenInclude(pv => pv.Product)
            .FirstOrDefaultAsync(c => c.CustomerId == customerId);

        if (cart == null)
        {
            return NotFound("Cart not found.");
        }

        var items = cart.CartItems.Select(item => new CartSummaryItemDto
        {
            CartItemId = item.CartItemId,
            ProductVariantId = item.ProductVariantId,
            ProductName = item.ProductVariant.Product.Name,
            Color = item.ProductVariant.Color,
            Size = item.ProductVariant.Size,
            Fit = item.ProductVariant.Fit,
            Quantity = item.Quantity,
            UnitPrice = item.ProductVariant.Price,
            LineTotal = item.Quantity * item.ProductVariant.Price
        }).ToList();

        var summary = new CartSummaryDto
        {
            CustomerId = customerId,
            TotalItems = items.Sum(i => i.Quantity),
            TotalPrice = items.Sum(i => i.LineTotal),
            Items = items
        };

        return Ok(summary);
    }
}