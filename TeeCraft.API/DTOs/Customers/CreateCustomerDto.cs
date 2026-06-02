namespace TeeCraft.API.DTOs.Customers;

public class CreateCustomerDto
{
    public int UserId { get; set; }

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string Address { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = string.Empty;

}
