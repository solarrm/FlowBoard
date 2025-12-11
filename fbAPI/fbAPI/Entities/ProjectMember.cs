using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace fbAPI.Entities;

public class ProjectMember
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int MemberId { get; set; }

    public int ProjectId { get; set; }
    [ForeignKey(nameof(ProjectId))]
    public Project Project { get; set; } = null!;

    public int UserId { get; set; }
    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;

    [Required]
    public string ProjectRole { get; set; } = "member";

    public DateTime JoinedAt { get; set; }
}