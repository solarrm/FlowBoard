using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace fbAPI.Entities;

public class FAQ
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int FaqId { get; set; }

    [Required]
    public string Question { get; set; }

    [Required]
    public string Answer { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public bool IsActive { get; set; }

    public int AuthorId { get; set; }
    [ForeignKey(nameof(AuthorId))]
    public User Author { get; set; }

    public ICollection<FAQAndCategory> CategoriesLink { get; set; } = new List<FAQAndCategory>();
}