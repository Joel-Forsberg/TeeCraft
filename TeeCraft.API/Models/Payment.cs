namespace TeeCraft.API.Models;

public class Payment
{
    public int PaymentId { get; set; }

    public int OrderId { get; set; }

    public Order Order { get; set; } = null!;

    public string PaymentMethod { get; set; } = string.Empty;

    public string PaymentStatus { get; set; } = "Pending";

    public decimal Amount { get; set; }

    public DateTime PaymentDate { get; set; } = DateTime.UtcNow;
}