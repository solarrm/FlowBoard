namespace fbAPI.DTOs;

public class CreateProjectRequest
{
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public string? Status { get; set; }
}