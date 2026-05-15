using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TeeCraft.API.Data;
using TeeCraft.API.DTOs;

namespace TeeCraft.API.Controllers;

[Authorize(Roles = "Admin")]
[Route("api/[controller]")]
[ApiController]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _context;

    public AdminController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/admin/dashboard
    [HttpGet("dashboard")]
    public async Task<ActionResult<AdminDashboardDto>> GetDashboard()
    {
        var dashboard = new AdminDashboardDto
        {
            TotalProducts = await _context.Products.CountAsync(),

            TotalCustomers = await _context.Customers.CountAsync(),

            TotalOrders = await _context.Orders.CountAsync(),

            TotalReviews = await _context.Reviews.CountAsync(),

            TotalSales = await _context.Orders
                .Where(o => o.Status != "Cancelled")
                .SumAsync(o => o.TotalAmount),

            LowStockVariants = await _context.ProductVariants
                .CountAsync(v => v.StockQuantity <= 5)
        };

        return Ok(dashboard);
    }
}