namespace TeeCraft.API.Models;

public class Cart
{
    public int CartId { get; set; }

    public int CustomerId { get; set; }

    public Customer Customer { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
}