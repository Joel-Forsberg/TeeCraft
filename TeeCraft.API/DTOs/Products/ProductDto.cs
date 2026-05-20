namespace TeeCraft.API.DTOs.Products;

public class ProductDto
{
    public int ProductId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public decimal BasePrice { get; set; }

    public string? ImageUrl { get; set; }

    public int CategoryId { get; set; }

    public string CategoryName { get; set; } = string.Empty;
    
    public double AverageRating { get; set; }
    
    public int ReviewCount { get; set; }
    
    public List<ProductVariantDto> ProductVariants { get; set; } = new();
}