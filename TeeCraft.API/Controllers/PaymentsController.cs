using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TeeCraft.API.Data;
using TeeCraft.API.DTOs.Payments;
using TeeCraft.API.Models;

namespace TeeCraft.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly AppDbContext _context;

    public PaymentsController(AppDbContext context)
    {
        _context = context;
    }

    // POST: api/payments/simulate
    [HttpPost("simulate")]
    public async Task<ActionResult<PaymentResultDto>> SimulatePayment(SimulatePaymentDto dto)
    {
        var order = await _context.Orders
            .Include(o => o.Payment)
            .FirstOrDefaultAsync(o => o.OrderId == dto.OrderId);

        if (order == null)
        {
            return NotFound("Order not found.");
        }

        var status = dto.ShouldSucceed ? "Paid" : "Failed";

        if (order.Payment == null)
        {
            order.Payment = new Payment
            {
                OrderId = order.OrderId,
                PaymentMethod = dto.PaymentMethod,
                PaymentStatus = status,
                Amount = order.TotalAmount,
                PaymentDate = DateTime.UtcNow
            };
        }
        else
        {
            order.Payment.PaymentMethod = dto.PaymentMethod;
            order.Payment.PaymentStatus = status;
            order.Payment.Amount = order.TotalAmount;
            order.Payment.PaymentDate = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        var result = new PaymentResultDto
        {
            OrderId = order.OrderId,
            PaymentStatus = status,
            Amount = order.TotalAmount,
            ProcessedAt = DateTime.UtcNow,
            Message = dto.ShouldSucceed
                ? "Payment completed successfully."
                : "Payment failed."
        };

        return Ok(result);
    }
}