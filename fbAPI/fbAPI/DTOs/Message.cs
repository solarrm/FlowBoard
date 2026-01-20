namespace fbAPI.DTOs;

public class MessageDto
{
    public int MessageId { get; set; }
    public int ChatId { get; set; }
    public int UserId { get; set; }
    public string UserName { get; set; }
    public string Content { get; set; }
    public DateTime Timestamp { get; set; }
}