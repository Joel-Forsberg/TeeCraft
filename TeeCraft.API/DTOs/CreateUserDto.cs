namespace TeeCraft.API.DTOs;

public class CreateUserDto
{
    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public int RoleId { get; set; }
}