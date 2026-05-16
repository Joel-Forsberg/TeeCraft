namespace TeeCraft.API.DTOs.Admin;

public class AdminDashboardDto
{
    public int TotalProducts { get; set; }

    public int TotalCustomers { get; set; }

    public int TotalOrders { get; set; }

    public int TotalReviews { get; set; }

    public decimal TotalSales { get; set; }

    public int LowStockVariants { get; set; }
}