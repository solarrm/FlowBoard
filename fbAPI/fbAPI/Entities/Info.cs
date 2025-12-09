using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace fbAPI.Entities;

public class Info
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int InfoId { get; set; }

    [Required]
    [MaxLength(200)]
    public string ServiceName { get; set; }

    public string? Decription { get; set; }
    public string? Version { get; set; }
    public string? Contacts { get; set; }
    public string? WebsiteUrl { get; set; }
}