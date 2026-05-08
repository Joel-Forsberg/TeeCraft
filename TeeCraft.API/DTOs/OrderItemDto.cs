namespace TeeCraft.API.DTOs;

public class OrderItemDto
{
    public int OrderItemId { get; set; }

    public int ProductVariantId { get; set; }

    public int Quantity { get; set; }

    public decimal UnitPrice { get; set; }
}