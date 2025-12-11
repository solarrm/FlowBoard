namespace fbAPI.DTOs;

public class UpdateProjectRequest
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public string? Status { get; set; }
}