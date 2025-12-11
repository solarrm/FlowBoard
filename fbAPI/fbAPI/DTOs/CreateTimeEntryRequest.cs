namespace fbAPI.DTOs;

public class CreateTimeEntryRequest
{
    public int TaskId { get; set; }
    public DateTime? StartTime { get; set; }
}