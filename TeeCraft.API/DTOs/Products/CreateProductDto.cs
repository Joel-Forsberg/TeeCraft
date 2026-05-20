namespace TeeCraft.API.DTOs.Products;

public class CreateProductDto
{
    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public decimal BasePrice { get; set; }

    public string? ImageUrl { get; set; }

    public int CategoryId { get; set; }
}