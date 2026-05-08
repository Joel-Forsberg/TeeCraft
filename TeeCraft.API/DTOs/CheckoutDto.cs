namespace TeeCraft.API.DTOs;

public class CheckoutDto
{
    public int CustomerId { get; set; }

    public string PaymentMethod { get; set; } = string.Empty;
}