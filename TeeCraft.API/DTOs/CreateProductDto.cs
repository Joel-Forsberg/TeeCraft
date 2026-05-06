namespace TeeCraft.API.DTOs;

public class CreateProductDto
{
    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public decimal BasePrice { get; set; }

    public int CategoryId { get; set; }
}