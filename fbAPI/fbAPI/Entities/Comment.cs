using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace fbAPI.Entities;

public class Comment
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int CommentId { get; set; }

    public int AuthorId { get; set; }
    [ForeignKey(nameof(AuthorId))]
    public User Author { get; set; }

    public int? TaskId { get; set; }
    [ForeignKey(nameof(TaskId))]
    public Task? Task { get; set; }

    public int? NoteId { get; set; }
    [ForeignKey(nameof(NoteId))]
    public Note? Note { get; set; }

    [Required]
    public string Content { get; set; }

    public DateTime CreatedAt { get; set; }
}