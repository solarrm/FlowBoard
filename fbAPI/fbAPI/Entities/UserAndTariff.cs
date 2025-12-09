using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace fbAPI.Entities;

public class UserAndTariff
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    public int UserId { get; set; }
    [ForeignKey(nameof(UserId))]
    public User User { get; set; }

    public int TariffPlanId { get; set; }
    [ForeignKey(nameof(TariffPlanId))]
    public TariffPlan TariffPlan { get; set; }

    public DateTime SubscriptionStart { get; set; }
    public DateTime? SubscriptionEnd { get; set; }
}
