using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace fbAPI.Entities;

public class NoteShare
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    public int NoteId { get; set; }
    [ForeignKey(nameof(NoteId))]
    public Note Note { get; set; } = null!;

    public int UserId { get; set; }
    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;

    public bool CanEdit { get; set; } = false;

    public bool CanComment { get; set; } = true;

    public DateTime SharedAt { get; set; }
}