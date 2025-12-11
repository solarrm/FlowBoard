using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace fbAPI.Entities;

public class Comment
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int CommentId { get; set; }

    public int NoteId { get; set; }
    [ForeignKey(nameof(NoteId))]
    public Note Note { get; set; } = null!;

    public int AuthorId { get; set; }
    [ForeignKey(nameof(AuthorId))]
    public User Author { get; set; } = null!;

    [Required]
    public string Content { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }
}