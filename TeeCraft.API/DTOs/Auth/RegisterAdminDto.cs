namespace TeeCraft.API.DTOs.Auth;

public class RegisterAdminDto
{
    public string Email { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;
}