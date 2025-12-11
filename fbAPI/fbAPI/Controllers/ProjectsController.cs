using fbAPI.Data;
using fbAPI.DTOs;
using fbAPI.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace fbAPI.Controllers;

[Route("api/projects")]
[ApiController]
[Authorize]
public class ProjectsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ProjectsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetProjects()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var projects = await _context.Projects
            .Where(p => p.Members.Any(m => m.UserId == userId) || p.AuthorId == userId)
            .Select(p => new
            {
                p.ProjectId,
                p.Name,
                p.Description,
                p.StartDate,
                p.EndDate,
                p.Status,
                p.CreatedAt,
                AuthorId = p.AuthorId,
                Author = new { p.Author.UserName, p.Author.Email }
            })
            .ToListAsync();

        return Ok(projects);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetProjectById(int id)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var project = await _context.Projects
            .Include(p => p.Author)
            .FirstOrDefaultAsync(p => p.ProjectId == id);

        if (project == null)
            return NotFound(new { message = "Проект не найден" });

        var isMember = await _context.ProjectMembers
            .AnyAsync(pm => pm.ProjectId == id && pm.UserId == userId);

        if (project.AuthorId != userId && !isMember)
            return Forbid();

        return Ok(new
        {
            project.ProjectId,
            project.Name,
            project.Description,
            project.StartDate,
            project.EndDate,
            project.Status,
            project.CreatedAt,
            AuthorId = project.AuthorId,
            Author = new { project.Author.UserName, project.Author.Email }
        });
    }

    [HttpPost]
    public async Task<IActionResult> CreateProject([FromBody] CreateProjectRequest request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var user = await _context.Users.FindAsync(userId);

        if (user == null)
            return Unauthorized();

        if (user.Role != "admin" && user.Role != "manager")
            return Forbid();

        var project = new Project
        {
            Name = request.Name,
            Description = request.Description,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            Status = request.Status ?? "planned",
            AuthorId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Projects.Add(project);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetProjectById), new { id = project.ProjectId }, new
        {
            project.ProjectId,
            project.Name,
            project.Description,
            project.StartDate,
            project.EndDate,
            project.Status,
            project.CreatedAt
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProject(int id, [FromBody] UpdateProjectRequest request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var user = await _context.Users.FindAsync(userId);

        var project = await _context.Projects.FirstOrDefaultAsync(p => p.ProjectId == id);

        if (project == null)
            return NotFound(new { message = "Проект не найден" });

        if (project.AuthorId != userId && user?.Role != "admin")
            return Forbid();

        if (!string.IsNullOrEmpty(request.Name))
            project.Name = request.Name;

        if (!string.IsNullOrEmpty(request.Description))
            project.Description = request.Description;

        if (request.StartDate.HasValue)
            project.StartDate = request.StartDate;

        if (request.EndDate.HasValue)
            project.EndDate = request.EndDate;

        if (!string.IsNullOrEmpty(request.Status))
            project.Status = request.Status;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            project.ProjectId,
            project.Name,
            project.Description,
            project.StartDate,
            project.EndDate,
            project.Status,
            project.CreatedAt
        });
    }

    [HttpPut("{id}/members/{memberId}/role")]
    public async Task<IActionResult> UpdateProjectMemberRole(int id, int memberId, [FromBody] UpdateProjectMemberRoleRequest request)
    {
        var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var project = await _context.Projects.FirstOrDefaultAsync(p => p.ProjectId == id);
        if (project == null)
            return NotFound(new { message = "Проект не найден" });

        var currentUser = await _context.Users.FindAsync(currentUserId);
        var isAdmin = currentUser?.Role == "admin";
        if (project.AuthorId != currentUserId && !isAdmin)
            return Forbid();

        var member = await _context.ProjectMembers
            .Include(pm => pm.User)
            .FirstOrDefaultAsync(pm => pm.MemberId == memberId && pm.ProjectId == id);

        if (member == null)
            return NotFound(new { message = "Участник проекта не найден" });

        if (member.UserId == project.AuthorId)
            return BadRequest(new { message = "Нельзя изменить роль автора проекта" });

        var allowedRoles = new[] { "manager", "member", "observer" };
        if (!allowedRoles.Contains(request.ProjectRole))
            return BadRequest(new { message = "Недопустимая роль в проекте" });

        member.ProjectRole = request.ProjectRole;
        await _context.SaveChangesAsync();

        return Ok(new
        {
            member.MemberId,
            member.ProjectId,
            member.UserId,
            member.ProjectRole,
            member.JoinedAt,
            User = new { member.User.UserName, member.User.Email }
        });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProject(int id)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var user = await _context.Users.FindAsync(userId);

        var project = await _context.Projects.FirstOrDefaultAsync(p => p.ProjectId == id);

        if (project == null)
            return NotFound(new { message = "Проект не найден" });

        if (project.AuthorId != userId && user?.Role != "admin")
            return Forbid();

        _context.Projects.Remove(project);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Проект удалён" });
    }

    [HttpGet("{id}/members")]
    public async Task<IActionResult> GetProjectMembers(int id)
    {
        var project = await _context.Projects.FindAsync(id);

        if (project == null)
            return NotFound(new { message = "Проект не найден" });

        var members = await _context.ProjectMembers
            .Where(pm => pm.ProjectId == id)
            .Include(pm => pm.User)
            .Select(pm => new
            {
                pm.MemberId,
                pm.ProjectId,
                pm.UserId,
                pm.ProjectRole,
                pm.JoinedAt,
                User = new { pm.User.UserName, pm.User.Email }
            })
            .ToListAsync();

        return Ok(members);
    }

    [HttpPost("{id}/members")]
    public async Task<IActionResult> AddProjectMember(int id, [FromBody] AddProjectMemberRequest request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var project = await _context.Projects.FirstOrDefaultAsync(p => p.ProjectId == id);

        if (project == null)
            return NotFound(new { message = "Проект не найден" });

        if (project.AuthorId != userId)
            return Forbid();

        var targetUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (targetUser == null)
            return NotFound(new { message = "Пользователь с таким email не найден" });

        var existingMember = await _context.ProjectMembers
            .FirstOrDefaultAsync(pm => pm.ProjectId == id && pm.UserId == targetUser.UserId);

        if (existingMember != null)
            return BadRequest(new { message = "Пользователь уже является участником проекта" });

        var member = new ProjectMember
        {
            ProjectId = id,
            UserId = targetUser.UserId,
            ProjectRole = request.ProjectRole ?? "member",
            JoinedAt = DateTime.UtcNow
        };

        _context.ProjectMembers.Add(member);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetProjectMembers), new { id }, new
        {
            member.MemberId,
            member.ProjectId,
            member.UserId,
            member.ProjectRole,
            member.JoinedAt,
            User = new { targetUser.UserName, targetUser.Email }
        });
    }

    [HttpDelete("{id}/members/{memberId}")]
    public async Task<IActionResult> RemoveProjectMember(int id, int memberId)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var project = await _context.Projects.FirstOrDefaultAsync(p => p.ProjectId == id);

        if (project == null)
            return NotFound(new { message = "Проект не найден" });

        if (project.AuthorId != userId)
            return Forbid();

        var member = await _context.ProjectMembers
            .FirstOrDefaultAsync(pm => pm.MemberId == memberId && pm.ProjectId == id);

        if (member == null)
            return NotFound(new { message = "Участник не найден" });

        _context.ProjectMembers.Remove(member);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Участник удалён из проекта" });
    }
}