namespace TeeCraft.API.DTOs.Cart;

public class CheckoutDto
{
    public int CustomerId { get; set; }

    public string PaymentMethod { get; set; } = string.Empty;
}