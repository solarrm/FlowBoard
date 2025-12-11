namespace fbAPI.DTOs;

public class CreateTaskRequest
{
    public int ProjectId { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public string? Status { get; set; }
    public int? Priority { get; set; }
    public DateTime? DueDate { get; set; }
}