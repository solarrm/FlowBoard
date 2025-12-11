namespace fbAPI.DTOs;

public class StopTimeEntryRequest
{
    public DateTime? EndTime { get; set; }
    public int? DurationMinutes { get; set; }
}