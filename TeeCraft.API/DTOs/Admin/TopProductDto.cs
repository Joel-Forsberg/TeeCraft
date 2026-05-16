namespace TeeCraft.API.DTOs.Admin
{
    public class TopProductDto
    {
        public int ProductId { get; set; }

        public string ProductName { get; set; } = string.Empty;

        public int TotalSold { get; set; }

        public decimal Revenue { get; set; }
    }
}