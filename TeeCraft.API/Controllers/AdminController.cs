using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TeeCraft.API.Data;
using TeeCraft.API.DTOs.Admin;

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

    // GET: api/admin/audit-logs
    [HttpGet("audit-logs")]
    public async Task<ActionResult<IEnumerable<AuditLogDto>>> GetAuditLogs()
    {
        var logs = await _context.AuditLogs
            .OrderByDescending(l => l.CreatedAt)
            .Select(l => new AuditLogDto
            {
                AuditLogId = l.AuditLogId,
                UserId = l.UserId,
                Action = l.Action,
                EntityName = l.EntityName,
                EntityId = l.EntityId,
                Details = l.Details,
                CreatedAt = l.CreatedAt
            })
            .ToListAsync();

        return Ok(logs);
    }

    // GET: api/admin/top-products
    [Authorize(Roles = "Admin")]
    [HttpGet("top-products")]
    public async Task<ActionResult<IEnumerable<TopProductDto>>> GetTopProducts()
    {
        var topProducts = await _context.OrderItems
            .Include(oi => oi.ProductVariant)
            .ThenInclude(v => v.Product)
            .GroupBy(oi => new
            {
                oi.ProductVariant.Product.ProductId,
                oi.ProductVariant.Product.Name
            })
            .Select(g => new TopProductDto
            {
                ProductId = g.Key.ProductId,
                ProductName = g.Key.Name,
                TotalSold = g.Sum(x => x.Quantity),
                Revenue = g.Sum(x => x.Quantity * x.UnitPrice)
            })
            .OrderByDescending(x => x.TotalSold)
            .Take(10)
            .ToListAsync();

        return Ok(topProducts);
    }

    // GET: api/admin/low-stock
    [Authorize(Roles = "Admin")]
    [HttpGet("low-stock")]
    public async Task<ActionResult<IEnumerable<LowStockDto>>> GetLowStockProducts()
    {
        var lowStock = await _context.ProductVariants
            .Include(v => v.Product)
            .Where(v => v.StockQuantity <= 5)
            .Select(v => new LowStockDto
            {
                ProductVariantId = v.ProductVariantId,
                ProductName = v.Product.Name,
                Color = v.Color,
                Size = v.Size,
                StockQuantity = v.StockQuantity
            })
            .OrderBy(v => v.StockQuantity)
            .ToListAsync();

        return Ok(lowStock);
    }

    // GET: api/admin/sales-summary
    [Authorize(Roles = "Admin")]
    [HttpGet("sales-summary")]
    public async Task<ActionResult<SalesSummaryDto>> GetSalesSummary()
    {
        var completedOrders = await _context.Orders
            .Where(o => o.Status != "Cancelled")
            .ToListAsync();

        var totalRevenue = completedOrders.Sum(o => o.TotalAmount);

        var totalOrders = completedOrders.Count;

        var averageOrderValue = totalOrders > 0
            ? totalRevenue / totalOrders
            : 0;

        var summary = new SalesSummaryDto
        {
            TotalRevenue = totalRevenue,
            TotalOrders = totalOrders,
            AverageOrderValue = averageOrderValue
        };

        return Ok(summary);
    }
}