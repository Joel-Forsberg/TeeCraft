using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TeeCraft.API.Data;
using TeeCraft.API.Models;
using Microsoft.AspNetCore.Authorization;
using TeeCraft.API.DTOs.Auth;

namespace TeeCraft.API.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/[controller]")]
public class RolesController : ControllerBase
{
    private readonly AppDbContext _context;

    public RolesController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/roles
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Role>>> GetRoles()
    {
        return await _context.Roles.ToListAsync();
    }

    // GET: api/roles/1
    [HttpGet("{id}")]
    public async Task<ActionResult<Role>> GetRole(int id)
    {
        var role = await _context.Roles.FindAsync(id);

        if (role == null)
        {
            return NotFound();
        }

        return role;
    }

    // POST: api/roles
    [HttpPost]
    public async Task<ActionResult<Role>> CreateRole(CreateRoleDto dto)
    {
        var role = new Role
        {
            Name = dto.Name
        };

        _context.Roles.Add(role);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetRole), new { id = role.RoleId }, role);
    }
}