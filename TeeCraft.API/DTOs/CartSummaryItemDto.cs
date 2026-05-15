namespace TeeCraft.API.DTOs;

public class CartSummaryItemDto
{
    public int CartItemId { get; set; }

    public int ProductVariantId { get; set; }

    public string ProductName { get; set; } = string.Empty;

    public string Color { get; set; } = string.Empty;

    public string Size { get; set; } = string.Empty;

    public string Fit { get; set; } = string.Empty;

    public int Quantity { get; set; }

    public decimal UnitPrice { get; set; }

    public decimal LineTotal { get; set; }
}