namespace fbAPI.DTOs;

public class CreateCommentRequest
{
    public int NoteId { get; set; }
    public string Content { get; set; } = null!;
}