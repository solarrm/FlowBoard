using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace fbAPI.Entities;

public class Notification
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    public int UserId { get; set; }
    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;

    [Required]
    public string Type { get; set; } = null!;

    [Required]
    public string Message { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public DateTime? ScheduledAt { get; set; }

    public DateTime? ReadAt { get; set; }
}