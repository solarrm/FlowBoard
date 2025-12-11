namespace fbAPI.DTOs;

public class AddProjectMemberRequest
{
    public string Email { get; set; } = null!;
    public string? ProjectRole { get; set; }
}