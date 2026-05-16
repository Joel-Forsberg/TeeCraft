namespace TeeCraft.API.DTOs.Admin
{
    public class LowStockDto
    {
        public int ProductVariantId { get; set; }

        public string ProductName { get; set; } = string.Empty;

        public string Color { get; set; } = string.Empty;

        public string Size { get; set; } = string.Empty;

        public int StockQuantity { get; set; }
    }
}