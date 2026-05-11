using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TeeCraft.API.Data;
using TeeCraft.API.DTOs;
using TeeCraft.API.Models;

namespace TeeCraft.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthController(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    // POST: api/auth/register
    [HttpPost("register")]
    public async Task<ActionResult> Register(RegisterDto dto)
    {
        var userExists = await _context.Users
            .AnyAsync(u => u.Email == dto.Email);

        if (userExists)
        {
            return BadRequest("User already exists.");
        }

        var customerRole = await _context.Roles
            .FirstOrDefaultAsync(r => r.Name == "Customer");

        if (customerRole == null)
        {
            return BadRequest("Customer role does not exist.");
        }

        var user = new User
        {
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            RoleId = customerRole.RoleId
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var customer = new Customer
        {
            UserId = user.UserId,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            PhoneNumber = dto.PhoneNumber
        };

        _context.Customers.Add(customer);
        await _context.SaveChangesAsync();

        return Ok("User registered successfully.");
    }

    // POST: api/auth/register-admin
    [HttpPost("register-admin")]
    public async Task<ActionResult> RegisterAdmin(RegisterAdminDto dto)
    {
        var userExists = await _context.Users
            .AnyAsync(u => u.Email == dto.Email);

        if (userExists)
        {
            return BadRequest("User already exists.");
        }

        var adminRole = await _context.Roles
            .FirstOrDefaultAsync(r => r.Name == "Admin");

        if (adminRole == null)
        {
            return BadRequest("Admin role does not exist.");
        }

        var user = new User
        {
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            RoleId = adminRole.RoleId
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok("Admin registered successfully.");
    }

    // POST: api/auth/login
    [HttpPost("login")]
    public async Task<ActionResult> Login(LoginDto dto)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Email == dto.Email);

        if (user == null)
        {
            return Unauthorized("Invalid email or password.");
        }

        bool passwordValid = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);

        if (!passwordValid)
        {
            return Unauthorized("Invalid email or password.");
        }

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.Name)
        };

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(2),
            signingCredentials: creds
        );

        var jwt = new JwtSecurityTokenHandler().WriteToken(token);

        return Ok(new
        {
            token = jwt
        });
    }
}