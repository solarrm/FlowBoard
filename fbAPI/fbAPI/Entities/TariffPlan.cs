using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace fbAPI.Entities;

public class TariffPlan
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int TariffPlanId { get; set; }

    [Required]
    [MaxLength(100)]
    public string SubscriptionStatus { get; set; }

    [Required]
    [MaxLength(100)]
    public string SubscriptionType { get; set; }

    public ICollection<UserAndTariff> UserLinks { get; set; } = new List<UserAndTariff>();
}