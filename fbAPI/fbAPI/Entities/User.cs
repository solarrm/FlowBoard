using fbAPI.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace fbAPI.Entities;

public class User
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int UserId { get; set; }

    [Required]
    [MaxLength(100)]
    public string Login { get; set; }

    [Required]
    [EmailAddress]
    [MaxLength(200)]
    public string Email { get; set; }

    [Required]
    [MaxLength(100)]
    public string UserName { get; set; }

    public DateOnly? DateOfBirth { get; set; }

    [MaxLength(100)]
    public string? Country { get; set; }

    public DateTime DateTimeOfRegistration { get; set; }

    public string? ProfilePicture { get; set; }

    public bool IsActive { get; set; } = true;

    [Required]
    [MaxLength(50)]
    public string Role { get; set; }

    [Required]
    public string PasswordHash { get; set; }

    [Required]
    public byte[] Salt { get; set; } = SaltGenerator.GenerateSalt();

    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiryTime { get; set; }

    public ICollection<Project> OwnProjects { get; set; } = new List<Project>();
    public ICollection<ProjectMember> ProjectMemberships { get; set; } = new List<ProjectMember>();
    public ICollection<TimeEntry> TimeEntries { get; set; } = new List<TimeEntry>();
    public ICollection<NoteShare> NoteShares { get; set; } = new List<NoteShare>();
    public ICollection<ChatMember> ChatMembers { get; set; } = new List<ChatMember>();
    public ICollection<Message> SentMessages { get; set; } = new List<Message>();
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    public ICollection<UserAndTariff> UserTariffs { get; set; } = new List<UserAndTariff>();

    public void SetPassword(string password)
    {
        PasswordHash = PasswordHasher.HashPassword(password, Salt);
    }

    public bool VerifyPassword(string password)
    {
        return PasswordHasher.VerifyPassword(password, PasswordHash);
    }
}
