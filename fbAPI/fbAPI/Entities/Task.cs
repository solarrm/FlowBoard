using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace fbAPI.Entities;

public class Task
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int TaskId { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; }

    public string? Description { get; set; }

    [Required]
    [MaxLength(50)]
    public string Status { get; set; }

    public int Priority { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? DueDate { get; set; }

    public int ProjectId { get; set; }
    [ForeignKey(nameof(ProjectId))]
    public Project Project { get; set; }

    public ICollection<TimeEntry> TimeEntries { get; set; } = new List<TimeEntry>();
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
}
