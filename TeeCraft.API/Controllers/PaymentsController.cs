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
        var processedAt = DateTime.UtcNow;

        if (order.Payment == null)
        {
            order.Payment = new Payment
            {
                OrderId = order.OrderId,
                PaymentMethod = dto.PaymentMethod,
                PaymentStatus = status,
                Amount = order.TotalAmount,
                PaymentDate = processedAt
            };
        }
        else
        {
            order.Payment.PaymentMethod = dto.PaymentMethod;
            order.Payment.PaymentStatus = status;
            order.Payment.Amount = order.TotalAmount;
            order.Payment.PaymentDate = processedAt;
        }

        // If payment succeeds, move the order forward
        if (dto.ShouldSucceed && order.Status != "Processing")
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

        var result = new PaymentResultDto
        {
            OrderId = order.OrderId,
            PaymentStatus = status,
            Amount = order.TotalAmount,
            ProcessedAt = processedAt,
            Message = dto.ShouldSucceed
                ? "Payment completed successfully."
                : "Payment failed."
        };

        return Ok(result);
    }
}