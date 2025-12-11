namespace fbAPI.DTOs;

public class UpdateProfileRequest
{
    public string? UserName { get; set; }
    public string? Country { get; set; }
    public DateOnly DateOfBirth { get; set; }
    public string? ProfilePicture { get; set; }
}