using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace fbAPI.Entities;

public class Message
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int MessageId { get; set; }

    public int ChatId { get; set; }
    [ForeignKey(nameof(ChatId))]
    public Chat Chat { get; set; }

    public int SenderId { get; set; }
    [ForeignKey(nameof(SenderId))]
    public User Sender { get; set; }

    [Required]
    public string Content { get; set; }

    public DateTime CreatedAt { get; set; }
    public bool IsRead { get; set; }
}
