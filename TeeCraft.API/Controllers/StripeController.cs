using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stripe.Checkout;
using System.Security.Claims;
using TeeCraft.API.Data;
using TeeCraft.API.DTOs.Stripe;

namespace TeeCraft.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class StripeController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public StripeController(
        AppDbContext context,
        IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    [HttpPost("create-checkout-session")]
    public async Task<ActionResult> CreateCheckoutSession(
        CreateStripeCheckoutDto dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (!int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var customer = await _context.Customers
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (customer == null)
        {
            return BadRequest("Customer not found.");
        }

        var order = await _context.Orders
            .FirstOrDefaultAsync(o =>
                o.OrderId == dto.OrderId &&
                o.CustomerId == customer.CustomerId);

        if (order == null)
        {
            return NotFound("Order not found.");
        }

        var stripeSecretKey = _configuration["Stripe:SecretKey"];

        if (string.IsNullOrWhiteSpace(stripeSecretKey))
        {
            return StatusCode(
                500,
                "Stripe configuration is missing.");
        }

        Stripe.StripeConfiguration.ApiKey = stripeSecretKey;

        var options = new SessionCreateOptions
        {
            Mode = "payment",

            SuccessUrl =
                $"https://teecraft-shop.netlify.app/?stripe=success&orderId={order.OrderId}&session_id={{CHECKOUT_SESSION_ID}}",

            CancelUrl =
                $"https://teecraft-shop.netlify.app/?stripe=cancel&orderId={order.OrderId}",

            LineItems = new List<SessionLineItemOptions>
            {
                new SessionLineItemOptions
                {
                    Quantity = 1,

                    PriceData = new SessionLineItemPriceDataOptions
                    {
                        Currency = "sek",

                        UnitAmount = (long)(order.TotalAmount * 100),

                        ProductData =
                            new SessionLineItemPriceDataProductDataOptions
                            {
                                Name = $"TeeCraft Order #{order.OrderId}"
                            }
                    }
                }
            }
        };

        var service = new SessionService();
        var session = await service.CreateAsync(options);

        return Ok(new
        {
            sessionId = session.Id,
            url = session.Url
        });
    }
}