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
    public User User { get; set; }

    public int? TaskId { get; set; }
    [ForeignKey(nameof(TaskId))]
    public Task? Task { get; set; }

    public int? NoteId { get; set; }
    [ForeignKey(nameof(NoteId))]
    public Note? Note { get; set; }

    [Required]
    [MaxLength(50)]
    public string Type { get; set; }

    [Required]
    public string Message { get; set; }

    public DateTime? ScheduledAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ReadAt { get; set; }

    public bool IsRead => ReadAt.HasValue;
}