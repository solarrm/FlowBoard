using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace fbAPI.Entities;

public class TaskAssignment
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int AssignmentId { get; set; }

    public int TaskId { get; set; }
    [ForeignKey(nameof(TaskId))]
    public Task Task { get; set; } = null!;

    public int UserId { get; set; }
    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;

    public DateTime AssignedAt { get; set; }
}