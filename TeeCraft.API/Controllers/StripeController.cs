using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stripe.Checkout;
using System.Security.Claims;
using TeeCraft.API.Data;
using TeeCraft.API.DTOs.Stripe;
using Stripe;
using TeeCraft.API.Models;

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

            Metadata = new Dictionary<string, string>
            {
                { "orderId", order.OrderId.ToString() }
            },

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

    [AllowAnonymous]
    [HttpPost("webhook")]
    public async Task<IActionResult> Webhook()
    {
        var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();

        var webhookSecret = _configuration["Stripe:WebhookSecret"];

        if (string.IsNullOrWhiteSpace(webhookSecret))
        {
            return StatusCode(500, "Stripe webhook configuration is missing.");
        }

        Event stripeEvent;

        try
        {
            stripeEvent = EventUtility.ConstructEvent(
                json,
                Request.Headers["Stripe-Signature"],
                webhookSecret
            );
        }
        catch (StripeException)
        {
            return BadRequest("Invalid Stripe signature.");
        }

        if (stripeEvent.Type == EventTypes.CheckoutSessionCompleted)
        {
            var session = stripeEvent.Data.Object as Session;

            if (session != null &&
                session.PaymentStatus == "paid" &&
                session.Metadata.TryGetValue("orderId", out var orderIdValue) &&
                int.TryParse(orderIdValue, out var orderId))
            {
                var order = await _context.Orders
                    .Include(o => o.Payment)
                    .FirstOrDefaultAsync(o => o.OrderId == orderId);

                if (order != null)
                {
                    var processedAt = DateTime.UtcNow;

                    if (order.Payment == null)
                    {
                        order.Payment = new Payment
                        {
                            OrderId = order.OrderId,
                            PaymentMethod = "Stripe",
                            PaymentStatus = "Paid",
                            Amount = order.TotalAmount,
                            PaymentDate = processedAt
                        };
                    }
                    else if (order.Payment.PaymentStatus != "Paid")
                    {
                        order.Payment.PaymentMethod = "Stripe";
                        order.Payment.PaymentStatus = "Paid";
                        order.Payment.Amount = order.TotalAmount;
                        order.Payment.PaymentDate = processedAt;
                    }

                    if (order.Status != "Processing")
                    {
                        var oldStatus = order.Status;

                        order.Status = "Processing";

                        _context.OrderStatusHistories.Add(new OrderStatusHistory
                        {
                            OrderId = order.OrderId,
                            OldStatus = oldStatus,
                            NewStatus = "Processing",
                            ChangedAt = processedAt
                        });
                    }

                    await _context.SaveChangesAsync();
                }
            }
        }

        return Ok();
    }
}