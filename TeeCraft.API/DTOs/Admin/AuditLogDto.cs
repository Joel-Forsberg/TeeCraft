namespace TeeCraft.API.DTOs.Admin;

public class AuditLogDto
{
    public int AuditLogId { get; set; }

    public int? UserId { get; set; }

    public string Action { get; set; } = string.Empty;

    public string EntityName { get; set; } = string.Empty;

    public int? EntityId { get; set; }

    public string Details { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
}