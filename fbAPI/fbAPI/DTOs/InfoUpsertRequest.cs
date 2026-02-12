using System.ComponentModel.DataAnnotations;

namespace fbAPI.DTOs;

public class InfoUpsertRequest
{
    [Required]
    [MaxLength(200)]
    public string ServiceName { get; set; }

    public string? Decription { get; set; }
    public string? Version { get; set; }
    public string? Contacts { get; set; }
    public string? WebsiteUrl { get; set; }
}
