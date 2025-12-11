namespace fbAPI.DTOs;

public class AddNoteShareRequest
{
    public string UserEmail { get; set; } = null!;
    public bool CanEdit { get; set; } = false;
    public bool CanComment { get; set; } = true;
}