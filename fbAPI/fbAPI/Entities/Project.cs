using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace fbAPI.Entities;

public class Project
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int ProjectId { get; set; }

    [Required]
    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public DateOnly? StartDate { get; set; }

    public DateOnly? EndDate { get; set; }

    [Required]
    public string Status { get; set; } = "planned";

    public int AuthorId { get; set; }
    [ForeignKey(nameof(AuthorId))]
    public User Author { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public ICollection<ProjectMember> Members { get; set; } = new List<ProjectMember>();

    public ICollection<Task> Tasks { get; set; } = new List<Task>();
}
