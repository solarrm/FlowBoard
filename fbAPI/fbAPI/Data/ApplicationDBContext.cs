using Microsoft.EntityFrameworkCore;
using fbAPI.Entities;

namespace fbAPI.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<TariffPlan> TariffPlans { get; set; }
    public DbSet<UserAndTariff> UserAndTariffs { get; set; }

    public DbSet<Project> Projects { get; set; }
    public DbSet<ProjectMember> ProjectMembers { get; set; }

    public DbSet<Entities.Task> Tasks { get; set; }
    public DbSet<TimeEntry> TimeEntries { get; set; }

    public DbSet<Note> Notes { get; set; }
    public DbSet<NoteShare> NoteShares { get; set; }
    public DbSet<Chat> Chats { get; set; }
    public DbSet<ChatMember> ChatMembers { get; set; }
    public DbSet<Message> Messages { get; set; }

    public DbSet<Comment> Comments { get; set; }
    public DbSet<Notification> Notifications { get; set; }

    public DbSet<Info> Infos { get; set; }
    public DbSet<News> Newses { get; set; }

    public DbSet<FAQ> FAQs { get; set; }
    public DbSet<FAQCategory> FAQCategories { get; set; }
    public DbSet<FAQAndCategory> FAQAndCategories { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured)
        {
            optionsBuilder.UseNpgsql("Host=127.0.0.1;Port=5432;Database=fbDB;Username=postgres;Password=7777;SSL Mode=Prefer");
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // при удалении проекта удаляются все участники
        modelBuilder.Entity<ProjectMember>()
            .HasOne(pm => pm.Project)
            .WithMany(p => p.Members)
            .HasForeignKey(pm => pm.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        // при удалении проекта удаляются все задачи
        modelBuilder.Entity<Entities.Task>()
            .HasOne(t => t.Project)
            .WithMany(p => p.Tasks)
            .HasForeignKey(t => t.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        // при удалении задачи удаляются записи времени
        modelBuilder.Entity<TimeEntry>()
            .HasOne(te => te.Task)
            .WithMany(t => t.TimeEntries)
            .HasForeignKey(te => te.TaskId)
            .OnDelete(DeleteBehavior.Cascade);

        // при удалении чата удаляются связи участников
        modelBuilder.Entity<ChatMember>()
            .HasOne(cm => cm.Chat)
            .WithMany(c => c.Members)
            .HasForeignKey(cm => cm.ChatId)
            .OnDelete(DeleteBehavior.Cascade);

        // при удалении чата удаляются сообщения
        modelBuilder.Entity<Message>()
            .HasOne(m => m.Chat)
            .WithMany(c => c.Messages)
            .HasForeignKey(m => m.ChatId)
            .OnDelete(DeleteBehavior.Cascade);

        // при удалении заметки удаляются доступы
        modelBuilder.Entity<NoteShare>()
            .HasOne(ns => ns.Note)
            .WithMany(n => n.Shares)
            .HasForeignKey(ns => ns.NoteId)
            .OnDelete(DeleteBehavior.Cascade);

        // при удалении FAQ удаляются категории
        modelBuilder.Entity<FAQAndCategory>()
            .HasOne(fc => fc.Faq)
            .WithMany(f => f.CategoriesLink)
            .HasForeignKey(fc => fc.FaqId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Login)
            .IsUnique();

        modelBuilder.Entity<ProjectMember>()
            .HasIndex(pm => new { pm.UserId, pm.ProjectId })
            .IsUnique();

        modelBuilder.Entity<ChatMember>()
            .HasIndex(cm => new { cm.UserId, cm.ChatId })
            .IsUnique();

        modelBuilder.Entity<NoteShare>()
            .HasIndex(ns => new { ns.UserId, ns.NoteId })
            .IsUnique();
    }
}