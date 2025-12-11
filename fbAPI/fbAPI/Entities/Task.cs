using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace fbAPI.Entities;

public class Task
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int TaskId { get; set; }

    public int ProjectId { get; set; }
    [ForeignKey(nameof(ProjectId))]
    public Project Project { get; set; } = null!;

    [Required]
    public string Title { get; set; } = null!;

    public string? Description { get; set; }

    [Required]
    public string Status { get; set; } = "todo";

    public int Priority { get; set; } = 2;

    public DateTime? DueDate { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public ICollection<TaskAssignment> Assignments { get; set; } = new List<TaskAssignment>();

    public ICollection<TimeEntry> TimeEntries { get; set; } = new List<TimeEntry>();
}