using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TeeCraft.API.Data;
using TeeCraft.API.DTOs.Reviews;
using TeeCraft.API.Models;

namespace TeeCraft.API.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class ReviewsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ReviewsController(AppDbContext context)
    {
        _context = context;
    }

    // POST: api/reviews
    [HttpPost]
    public async Task<ActionResult<ReviewDto>> CreateReview(CreateReviewDto dto)
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

        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.ProductId == dto.ProductId);

        if (product == null)
        {
            return NotFound("Product not found.");
        }

        if (dto.Rating < 1 || dto.Rating > 5)
        {
            return BadRequest("Rating must be between 1 and 5.");
        }

        var review = new Review
        {
            ProductId = dto.ProductId,
            CustomerId = customer.CustomerId,
            Rating = dto.Rating,
            Comment = dto.Comment,
            CreatedAt = DateTime.UtcNow
        };

        _context.Reviews.Add(review);

        await _context.SaveChangesAsync();

        var response = new ReviewDto
        {
            ReviewId = review.ReviewId,
            ProductId = product.ProductId,
            ProductName = product.Name,
            CustomerId = customer.CustomerId,
            CustomerName = $"{customer.FirstName} {customer.LastName}",
            Rating = review.Rating,
            Comment = review.Comment,
            CreatedAt = review.CreatedAt
        };

        return Ok(response);
    }

    // GET: api/reviews/product/1
    [AllowAnonymous]
    [HttpGet("product/{productId}")]
    public async Task<ActionResult<IEnumerable<ReviewDto>>> GetProductReviews(int productId)
    {
        var reviews = await _context.Reviews
            .Where(r => r.ProductId == productId)
            .Include(r => r.Product)
            .Include(r => r.Customer)
            .Select(r => new ReviewDto
            {
                ReviewId = r.ReviewId,
                ProductId = r.ProductId,
                ProductName = r.Product.Name,
                CustomerId = r.CustomerId,
                CustomerName = r.Customer.FirstName + " " + r.Customer.LastName,
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync();

        return Ok(reviews);
    }
}