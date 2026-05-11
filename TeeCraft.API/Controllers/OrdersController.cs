using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TeeCraft.API.Data;
using TeeCraft.API.DTOs;
using TeeCraft.API.Models;

namespace TeeCraft.API.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _context;

    public OrdersController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/orders
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Order>>> GetOrders()
    {
        return await _context.Orders
            .Include(o => o.OrderItems)
            .Include(o => o.Payment)
            .ToListAsync();
    }

    // GET: api/orders/customer/1
    [HttpGet("customer/{customerId}")]
    public async Task<ActionResult<IEnumerable<Order>>> GetOrdersByCustomer(int customerId)
    {
        return await _context.Orders
            .Where(o => o.CustomerId == customerId)
            .Include(o => o.OrderItems)
            .Include(o => o.Payment)
            .ToListAsync();
    }

    // POST: api/orders/checkout
    [HttpPost("checkout")]
    public async Task<ActionResult<OrderDto>> Checkout(CheckoutDto dto)
    {
        var cart = await _context.Carts
            .Include(c => c.CartItems)
            .ThenInclude(ci => ci.ProductVariant)
            .FirstOrDefaultAsync(c => c.CustomerId == dto.CustomerId);

        if (cart == null || !cart.CartItems.Any())
        {
            return BadRequest("Cart is empty or does not exist.");
        }

        foreach (var item in cart.CartItems)
        {
            if (item.ProductVariant.StockQuantity < item.Quantity)
            {
                return BadRequest($"Not enough stock for product variant {item.ProductVariantId}.");
            }
        }

        var totalAmount = cart.CartItems
            .Sum(item => item.Quantity * item.ProductVariant.Price);

        var order = new Order
        {
            CustomerId = dto.CustomerId,
            OrderDate = DateTime.UtcNow,
            TotalAmount = totalAmount,
            Status = "Created",
            OrderItems = cart.CartItems.Select(item => new OrderItem
            {
                ProductVariantId = item.ProductVariantId,
                Quantity = item.Quantity,
                UnitPrice = item.ProductVariant.Price
            }).ToList(),
            Payment = new Payment
            {
                PaymentMethod = dto.PaymentMethod,
                PaymentStatus = "Paid",
                Amount = totalAmount,
                PaymentDate = DateTime.UtcNow
            }
        };

        foreach (var item in cart.CartItems)
        {
            item.ProductVariant.StockQuantity -= item.Quantity;
        }

        _context.Orders.Add(order);
        _context.CartItems.RemoveRange(cart.CartItems);

        await _context.SaveChangesAsync();

        var response = new OrderDto
        {
            OrderId = order.OrderId,
            CustomerId = order.CustomerId,
            OrderDate = order.OrderDate,
            TotalAmount = order.TotalAmount,
            Status = order.Status,
            PaymentStatus = order.Payment?.PaymentStatus ?? string.Empty,
            PaymentMethod = order.Payment?.PaymentMethod ?? string.Empty,
            Items = order.OrderItems.Select(i => new OrderItemDto
            {
                OrderItemId = i.OrderItemId,
                ProductVariantId = i.ProductVariantId,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice
            }).ToList()
        };

        return CreatedAtAction(nameof(GetOrdersByCustomer), new { customerId = dto.CustomerId }, response);
    }

    // GET: api/orders/my-orders
    [Authorize]
    [HttpGet("my-orders")]
    public async Task<ActionResult<IEnumerable<OrderDto>>> GetMyOrders()
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

        var orders = await _context.Orders
            .Where(o => o.CustomerId == customer.CustomerId)
            .Include(o => o.OrderItems)
            .Include(o => o.Payment)
            .Select(o => new OrderDto
            {
                OrderId = o.OrderId,
                CustomerId = o.CustomerId,
                OrderDate = o.OrderDate,
                TotalAmount = o.TotalAmount,
                Status = o.Status,
                PaymentStatus = o.Payment != null ? o.Payment.PaymentStatus : string.Empty,
                PaymentMethod = o.Payment != null ? o.Payment.PaymentMethod : string.Empty,
                Items = o.OrderItems.Select(i => new OrderItemDto
                {
                    OrderItemId = i.OrderItemId,
                    ProductVariantId = i.ProductVariantId,
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice
                }).ToList()
            })
            .ToListAsync();

        return Ok(orders);
    }
}