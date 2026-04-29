namespace TeeCraft.API.Models;

public class ProductVariant
{
    public int ProductVariantId { get; set; }

    public int ProductId { get; set; }

    public Product Product { get; set; } = null!;

    public string Color { get; set; } = string.Empty;

    public string Size { get; set; } = string.Empty;

    public string Fit { get; set; } = string.Empty;

    public int StockQuantity { get; set; }

    public decimal Price { get; set; }

    public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();

    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}