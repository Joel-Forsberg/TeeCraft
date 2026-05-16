using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TeeCraft.API.Data;
using TeeCraft.API.DTOs.Customers;
using TeeCraft.API.Models;

namespace TeeCraft.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class CustomersController : ControllerBase
{
    private readonly AppDbContext _context;

    public CustomersController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/customers
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CustomerDto>>> GetCustomers()
    {
        return await _context.Customers
            .Include(c => c.User)
            .Select(c => new CustomerDto
            {
                CustomerId = c.CustomerId,
                UserId = c.UserId,
                Email = c.User.Email,
                FirstName = c.FirstName,
                LastName = c.LastName,
                PhoneNumber = c.PhoneNumber
            })
            .ToListAsync();
    }

    // GET: api/customers/1
    [HttpGet("{id}")]
    public async Task<ActionResult<CustomerDto>> GetCustomer(int id)
    {
        var customer = await _context.Customers
            .Include(c => c.User)
            .Where(c => c.CustomerId == id)
            .Select(c => new CustomerDto
            {
                CustomerId = c.CustomerId,
                UserId = c.UserId,
                Email = c.User.Email,
                FirstName = c.FirstName,
                LastName = c.LastName,
                PhoneNumber = c.PhoneNumber
            })
            .FirstOrDefaultAsync();

        if (customer == null)
        {
            return NotFound();
        }

        return customer;
    }

    // POST: api/customers
    [HttpPost]
    public async Task<ActionResult<Customer>> CreateCustomer(CreateCustomerDto dto)
    {
        var userExists = await _context.Users.AnyAsync(u => u.UserId == dto.UserId);

        if (!userExists)
        {
            var customerAlreadyExists = await _context.Customers
    .AnyAsync(c => c.UserId == dto.UserId);

            if (customerAlreadyExists)
            {
                return BadRequest("Customer already exists for this user.");
            }
            return BadRequest("User does not exist.");
        }

        var customer = new Customer
        {
            UserId = dto.UserId,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            PhoneNumber = dto.PhoneNumber
        };

        _context.Customers.Add(customer);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCustomer), new { id = customer.CustomerId }, customer);
    }
}