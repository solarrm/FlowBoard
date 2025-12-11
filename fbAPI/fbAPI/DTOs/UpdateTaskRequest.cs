namespace fbAPI.DTOs;

public class UpdateTaskRequest
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? Status { get; set; }
    public int? Priority { get; set; }
    public DateTime? DueDate { get; set; }
}