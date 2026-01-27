namespace fbAPI.DTOs;

public class FaqUpsertRequest
{
    public string Question { get; set; }
    public string Answer { get; set; }
    public bool IsActive { get; set; }
    public List<int> CategoryIds { get; set; } = new();
}
