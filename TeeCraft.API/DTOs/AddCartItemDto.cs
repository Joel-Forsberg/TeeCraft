namespace TeeCraft.API.DTOs;

public class AddCartItemDto
{
    public int CustomerId { get; set; }

    public int ProductVariantId { get; set; }

    public int Quantity { get; set; }
}