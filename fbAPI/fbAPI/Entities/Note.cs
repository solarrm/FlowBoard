using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace fbAPI.Entities;

public class Note
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int NoteId { get; set; }

    [Required]
    public string Title { get; set; } = null!;

    public string Content { get; set; } = string.Empty;

    public int AuthorId { get; set; }
    [ForeignKey(nameof(AuthorId))]
    public User Author { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public ICollection<NoteShare> Shares { get; set; } = new List<NoteShare>();

    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
}
