namespace TeeCraft.API.DTOs;

public class ProductVariantDto
{
    public int ProductVariantId { get; set; }

    public int ProductId { get; set; }

    public string ProductName { get; set; } = string.Empty;

    public string Color { get; set; } = string.Empty;

    public string Size { get; set; } = string.Empty;

    public string Fit { get; set; } = string.Empty;

    public int StockQuantity { get; set; }

    public decimal Price { get; set; }
}