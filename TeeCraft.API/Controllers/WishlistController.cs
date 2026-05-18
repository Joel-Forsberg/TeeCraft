using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TeeCraft.API.Data;
using TeeCraft.API.DTOs.Wishlist;
using TeeCraft.API.Models;

namespace TeeCraft.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WishlistController : ControllerBase
{
    private readonly AppDbContext _context;

    public WishlistController(AppDbContext context)
    {
        _context = context;
    }

    // POST: api/wishlist
    [HttpPost]
    public async Task<ActionResult> AddToWishlist(CreateWishlistItemDto dto)
    {
        var exists = await _context.WishlistItems.AnyAsync(w =>
            w.CustomerId == dto.CustomerId &&
            w.ProductId == dto.ProductId);

        if (exists)
        {
            return BadRequest("Product already exists in wishlist.");
        }

        var wishlistItem = new WishlistItem
        {
            CustomerId = dto.CustomerId,
            ProductId = dto.ProductId
        };

        _context.WishlistItems.Add(wishlistItem);

        await _context.SaveChangesAsync();

        return Ok("Product added to wishlist.");
    }

    // GET: api/wishlist/customer/1
    [HttpGet("customer/{customerId}")]
    public async Task<ActionResult<IEnumerable<WishlistItemDto>>> GetWishlist(int customerId)
    {
        var wishlist = await _context.WishlistItems
            .Include(w => w.Product)
            .Where(w => w.CustomerId == customerId)
            .Select(w => new WishlistItemDto
            {
                WishlistItemId = w.WishlistItemId,
                ProductId = w.ProductId,
                ProductName = w.Product.Name,
                BasePrice = w.Product.BasePrice,
                CreatedAt = w.CreatedAt
            })
            .ToListAsync();

        return Ok(wishlist);
    }

    // DELETE: api/wishlist/1
    [HttpDelete("{id}")]
    public async Task<ActionResult> RemoveFromWishlist(int id)
    {
        var item = await _context.WishlistItems.FindAsync(id);

        if (item == null)
        {
            return NotFound();
        }

        _context.WishlistItems.Remove(item);

        await _context.SaveChangesAsync();

        return NoContent();
    }
}