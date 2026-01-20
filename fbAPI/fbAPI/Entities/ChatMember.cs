using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace fbAPI.Entities;

public class ChatMember
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    public int ChatId { get; set; }
    [ForeignKey(nameof(ChatId))]
    public Chat Chat { get; set; }

    public int UserId { get; set; }
    [ForeignKey(nameof(UserId))]
    public User User { get; set; }

    public DateTime JoinedAt { get; set; }
    public bool IsOnline { get; set; } = false;
}