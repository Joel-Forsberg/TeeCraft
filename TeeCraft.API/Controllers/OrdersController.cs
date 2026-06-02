using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TeeCraft.API.Data;
using TeeCraft.API.DTOs.Cart;
using TeeCraft.API.DTOs.Orders;
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
    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<OrderDto>>> GetOrders()
    {
        var orders = await _context.Orders
            .Include(o => o.Customer)
            .ThenInclude(c => c.User)
            .Include(o => o.OrderItems)
            .ThenInclude(i => i.ProductVariant)
            .ThenInclude(pv => pv.Product)
            .Select(o => new OrderDto
            {
                OrderId = o.OrderId,
                CustomerId = o.CustomerId,
                CustomerName = o.Customer.FirstName + " " + o.Customer.LastName,
                CustomerEmail = o.Customer.User.Email,
                CustomerAddress = o.Customer.Address,
                OrderDate = o.OrderDate,
                TotalAmount = o.TotalAmount,
                Status = o.Status,
                PaymentStatus = o.Payment != null ? o.Payment.PaymentStatus : string.Empty,
                PaymentMethod = o.Payment != null ? o.Payment.PaymentMethod : string.Empty,
                Items = o.OrderItems.Select(i => new OrderItemDto
                {
                    OrderItemId = i.OrderItemId,
                    ProductVariantId = i.ProductVariantId,
                    ProductName = i.ProductVariant.Product.Name,
                    Size = i.ProductVariant.Size,
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice
                }).ToList()
            })
            .ToListAsync();

        return Ok(orders);
    }

    // POST: api/orders/checkout
    [Authorize]
    [HttpPost("checkout")]
    public async Task<ActionResult<OrderDto>> Checkout(CheckoutDto dto)
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
        var cart = await _context.Carts
            .Include(c => c.CartItems)
            .ThenInclude(ci => ci.ProductVariant)
            .FirstOrDefaultAsync(c => c.CustomerId == customer.CustomerId);

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
            CustomerId = customer.CustomerId,
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
                Size = i.ProductVariant.Size,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice
            }).ToList()
        };

        return Ok(response);
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
                    Size = i.ProductVariant.Size,
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice
                }).ToList()
            })
            .ToListAsync();

        return Ok(orders);
    }

    // PUT: api/orders/1/status
    [Authorize(Roles = "Admin")]
    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateOrderStatus(int id, UpdateOrderStatusDto dto)
    {
        var allowedStatuses = new[] { "Created", "Processing", "Shipped", "Completed", "Cancelled" };

        if (!allowedStatuses.Contains(dto.Status))
        {
            return BadRequest("Invalid order status.");
        }

        var order = await _context.Orders.FindAsync(id);

        if (order == null)
        {
            return NotFound();
        }

        var oldStatus = order.Status;

        order.Status = dto.Status;

        _context.OrderStatusHistories.Add(new OrderStatusHistory
        {
            OrderId = order.OrderId,
            OldStatus = oldStatus,
            NewStatus = dto.Status
        });

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // GET: api/orders/4/history
    [Authorize(Roles = "Admin")]
    [HttpGet("{id}/history")]
    public async Task<ActionResult<IEnumerable<OrderStatusHistoryDto>>> GetOrderHistory(int id)
    {
        var history = await _context.OrderStatusHistories
            .Where(h => h.OrderId == id)
            .OrderByDescending(h => h.ChangedAt)
            .Select(h => new OrderStatusHistoryDto
            {
                OrderStatusHistoryId = h.OrderStatusHistoryId,
                OrderId = h.OrderId,
                OldStatus = h.OldStatus,
                NewStatus = h.NewStatus,
                ChangedAt = h.ChangedAt
            })
            .ToListAsync();

        return Ok(history);
    }

    // GET: api/orders/1/receipt
    [Authorize]
    [HttpGet("{id}/receipt")]
    public async Task<ActionResult<OrderReceiptDto>> GetReceipt(int id)
    {
        var order = await _context.Orders
            .Include(o => o.Customer)
            .Include(o => o.OrderItems)
            .ThenInclude(i => i.ProductVariant)
            .ThenInclude(pv => pv.Product)
            .FirstOrDefaultAsync(o => o.OrderId == id);

        if (order == null)
        {
            return NotFound();
        }

        var receipt = new OrderReceiptDto
        {
            OrderId = order.OrderId,
            CustomerName = order.Customer.FirstName + " " + order.Customer.LastName,
            OrderDate = order.OrderDate,
            Status = order.Status,
            TotalAmount = order.TotalAmount,

            Items = order.OrderItems.Select(oi => new OrderItemDto
            {
                ProductVariantId = oi.ProductVariantId,
                ProductName = oi.ProductVariant.Product.Name,
                Size = oi.ProductVariant.Size,
                Quantity = oi.Quantity,
                UnitPrice = oi.UnitPrice
            }).ToList()
        };

        return Ok(receipt);
    }
}