namespace TeeCraft.API.DTOs;

public class CreateProductVariantDto
{
    public int ProductId { get; set; }

    public string Color { get; set; } = string.Empty;

    public string Size { get; set; } = string.Empty;

    public string Fit { get; set; } = string.Empty;

    public int StockQuantity { get; set; }

    public decimal Price { get; set; }
}