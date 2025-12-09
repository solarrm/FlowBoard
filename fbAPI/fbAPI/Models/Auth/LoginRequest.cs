namespace fbAPI.Models;

public class LoginRequest
{
    public string LoginOrEmail { get; set; } = null!;
    public string Password { get; set; } = null!;
}
