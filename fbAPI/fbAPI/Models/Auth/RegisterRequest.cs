namespace fbAPI.Models;

public class RegisterRequest
{
    public string Email { get; set; } = null!;
    public string Login { get; set; } = null!;
    public string UserName { get; set; } = null!;
    public string Password { get; set; } = null!;
    public DateOnly DateOfBirth { get; set; }
    public string Country { get; set; } = null!;
}
