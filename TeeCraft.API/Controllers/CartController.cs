using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TeeCraft.API.Data;
using TeeCraft.API.DTOs;
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
    public async Task<ActionResult<Cart>> GetCart(int customerId)
    {
        var cart = await _context.Carts
            .Include(c => c.CartItems)
            .ThenInclude(ci => ci.ProductVariant)
            .FirstOrDefaultAsync(c => c.CustomerId == customerId);

        if (cart == null)
        {
            return NotFound("Cart not found.");
        }

        return cart;
    }

    [HttpPost("items")]
    public async Task<ActionResult<CartItem>> AddItemToCart(AddCartItemDto dto)
    {
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
            .FirstOrDefaultAsync(c => c.CustomerId == dto.CustomerId);

        if (cart == null)
        {
            cart = new Cart
            {
                CustomerId = dto.CustomerId
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
}