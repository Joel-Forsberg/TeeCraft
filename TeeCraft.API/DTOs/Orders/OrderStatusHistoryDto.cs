namespace TeeCraft.API.DTOs.Orders;

public class OrderStatusHistoryDto
{
    public int OrderStatusHistoryId { get; set; }

    public int OrderId { get; set; }

    public string OldStatus { get; set; } = string.Empty;

    public string NewStatus { get; set; } = string.Empty;

    public DateTime ChangedAt { get; set; }
}