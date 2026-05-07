using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TeeCraft.API.Data;
using TeeCraft.API.DTOs;
using TeeCraft.API.Models;

namespace TeeCraft.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;

    public UsersController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/users
    [HttpGet]
    public async Task<ActionResult<IEnumerable<User>>> GetUsers()
    {
        return await _context.Users
            .Include(u => u.Role)
            .ToListAsync();
    }

    // GET: api/users/1
    [HttpGet("{id}")]
    public async Task<ActionResult<User>> GetUser(int id)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.UserId == id);

        if (user == null)
        {
            return NotFound();
        }

        return user;
    }

    // POST: api/users
    [HttpPost]
    public async Task<ActionResult<User>> CreateUser(CreateUserDto dto)
    {
        var roleExists = await _context.Roles.AnyAsync(r => r.RoleId == dto.RoleId);

        if (!roleExists)
        {
            return BadRequest("Role does not exist.");
        }

        var user = new User
        {
            Email = dto.Email,
            PasswordHash = dto.PasswordHash,
            RoleId = dto.RoleId
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetUser), new { id = user.UserId }, user);
    }
}