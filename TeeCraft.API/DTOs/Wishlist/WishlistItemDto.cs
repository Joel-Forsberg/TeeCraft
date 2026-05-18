namespace TeeCraft.API.DTOs.Wishlist;

public class WishlistItemDto
{
    public int WishlistItemId { get; set; }

    public int ProductId { get; set; }

    public string ProductName { get; set; } = string.Empty;

    public decimal BasePrice { get; set; }

    public DateTime CreatedAt { get; set; }
}