namespace TeeCraft.API.DTOs.Payments;

public class SimulatePaymentDto
{
    public int OrderId { get; set; }

    public string PaymentMethod { get; set; } = "Card";

    public bool ShouldSucceed { get; set; } = true;
}