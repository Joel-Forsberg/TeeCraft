namespace TeeCraft.API.Models;

public class Customer
{
    public int CustomerId { get; set; }

    public int UserId { get; set; }

    public User User { get; set; } = null!;

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = string.Empty;

    public Cart? Cart { get; set; }

    public ICollection<Order> Orders { get; set; } = new List<Order>();
}