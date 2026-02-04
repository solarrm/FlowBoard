using System.ComponentModel.DataAnnotations;

namespace fbAPI.DTOs;

public class NewsUpsertRequest
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; }

    public string? Content { get; set; }
    public string? Image { get; set; }

    public bool IsPublished { get; set; }
}