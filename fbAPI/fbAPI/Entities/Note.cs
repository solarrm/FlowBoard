using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace fbAPI.Entities;

public class Note
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int NoteId { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; }

    public string? Content { get; set; }

    // Навигация
    public ICollection<NoteShare> Shares { get; set; } = new List<NoteShare>();
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
}