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
    [EmailAddress]
    public string Email { get; set; } = null!;

    [Required]
    public string Login { get; set; } = null!;

    [Required]
    public string UserName { get; set; } = null!;

    [Required]
    public string PasswordHash { get; set; } = null!;

    public DateOnly DateOfBirth { get; set; }

    [Required]
    public string Country { get; set; } = null!;

    public string? ProfilePicture { get; set; }

    [Required]
    public byte[] Salt { get; set; } = SaltGenerator.GenerateSalt();
    [Required]
    public string Role { get; set; } = "user";

    public bool IsActive { get; set; } = true;

    public DateTime DateTimeOfRegistration { get; set; }

    public string? RefreshToken { get; set; }

    public DateTime? RefreshTokenExpiryTime { get; set; }

    [InverseProperty("Author")]
    public ICollection<Project> Projects { get; set; } = new List<Project>();

    public ICollection<ProjectMember> ProjectMemberships { get; set; } = new List<ProjectMember>();

    public ICollection<TaskAssignment> TaskAssignments { get; set; } = new List<TaskAssignment>();

    public ICollection<TimeEntry> TimeEntries { get; set; } = new List<TimeEntry>();

    [InverseProperty("Author")]
    public ICollection<Note> Notes { get; set; } = new List<Note>();

    public ICollection<NoteShare> SharedNotes { get; set; } = new List<NoteShare>();

    [InverseProperty("Author")]
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();

    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();

    public void SetPassword(string password)
    {
        PasswordHash = PasswordHasher.HashPassword(password, Salt);
    }

    public bool VerifyPassword(string password)
    {
        return PasswordHasher.VerifyPassword(password, PasswordHash);
    }
}
