namespace TeeCraft.API.DTOs.Admin
{
    public class SalesSummaryDto
    {
        public decimal TotalRevenue { get; set; }

        public int TotalOrders { get; set; }

        public decimal AverageOrderValue { get; set; }
    }
}