namespace TeeCraft.API.DTOs.Payments;

public class PaymentResultDto
{
    public int OrderId { get; set; }

    public string PaymentStatus { get; set; } = string.Empty;

    public string Message { get; set; } = string.Empty;

    public decimal Amount { get; set; }

    public DateTime ProcessedAt { get; set; }
}