namespace TeeCraft.API.DTOs;

public class CartSummaryDto
{
    public int CustomerId { get; set; }

    public int TotalItems { get; set; }

    public decimal TotalPrice { get; set; }

    public List<CartSummaryItemDto> Items { get; set; } = new();
}