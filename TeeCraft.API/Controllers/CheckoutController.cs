using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TeeCraft.API.Data;
using TeeCraft.API.DTOs.Orders;
using TeeCraft.API.Models;

namespace TeeCraft.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CheckoutController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CheckoutController(AppDbContext context)
        {
            _context = context;
        }
        // POST: api/checkout/place-order
        [Authorize]
        [HttpPost("place-order")]
        public async Task<IActionResult> PlaceOrder(
            PlaceOrderDto dto)
        {
            var cart = await _context.Carts
     .Include(c => c.CartItems)
         .ThenInclude(ci => ci.ProductVariant)
             .ThenInclude(pv => pv.Product)
     .FirstOrDefaultAsync(c => c.CustomerId == dto.CustomerId);

            if (cart == null || !cart.CartItems.Any())
            {
                return BadRequest("Cart is empty.");
            }

            var cartItems = cart.CartItems.ToList();

            if (!cartItems.Any())
            {
                return BadRequest("Cart is empty.");
            }

            var totalAmount = cartItems.Sum(c =>
                c.Quantity * c.ProductVariant.Price);

            var order = new Order
            {
                CustomerId = dto.CustomerId,
                OrderDate = DateTime.UtcNow,
                Status = "Processing",
                TotalAmount = totalAmount,
                OrderItems = new List<OrderItem>()
            };

            foreach (var cartItem in cartItems)
            {
                if (cartItem.Quantity >
                    cartItem.ProductVariant.StockQuantity)
                {
                    return BadRequest(
                        $"Not enough stock for product variant {cartItem.ProductVariantId}");
                }

                cartItem.ProductVariant.StockQuantity -= cartItem.Quantity;

                order.OrderItems.Add(new OrderItem
                {
                    ProductVariantId = cartItem.ProductVariantId,
                    Quantity = cartItem.Quantity,
                    UnitPrice = cartItem.ProductVariant.Price
                });
            }

            _context.Orders.Add(order);

            _context.CartItems.RemoveRange(cartItems);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Order placed successfully.",
                orderId = order.OrderId
            });
        }
    }

}