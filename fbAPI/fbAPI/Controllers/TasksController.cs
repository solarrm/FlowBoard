using fbAPI.Data;
using fbAPI.DTOs;
using fbAPI.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace fbAPI.Controllers;

[Route("api/tasks")]
[ApiController]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public TasksController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetTasks([FromQuery] int? projectId, [FromQuery] string? status)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var query = _context.Tasks
            .Include(t => t.Assignments)
            .Include(t => t.Project)
            .AsQueryable();

        // фильтр по проекту
        if (projectId.HasValue)
        {
            query = query.Where(t => t.ProjectId == projectId);
        }

        // фильтр по статусу
        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(t => t.Status == status);
        }

        // только задачи, на которые назначен текущий пользователь
        var tasks = await query
            .Where(t => t.Assignments.Any(a => a.UserId == userId) ||
                       t.Project.Members.Any(m => m.UserId == userId) ||
                       t.Project.AuthorId == userId)
            .Select(t => new
            {
                t.TaskId,
                t.Title,
                t.Description,
                t.Status,
                t.Priority,
                t.DueDate,
                t.CreatedAt,
                t.UpdatedAt,
                ProjectId = t.ProjectId,
                Project = new { t.Project.ProjectId, t.Project.Name },
                Assignments = t.Assignments.Select(a => new
                {
                    a.AssignmentId,
                    a.UserId,
                    a.AssignedAt,
                    User = new { a.User.UserName, a.User.Email }
                })
            })
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        return Ok(tasks);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetTaskById(int id)
    {
        var task = await _context.Tasks
            .Include(t => t.Assignments)
            .Include(t => t.Project)
            .FirstOrDefaultAsync(t => t.TaskId == id);

        if (task == null)
            return NotFound(new { message = "Задача не найдена" });

        return Ok(new
        {
            task.TaskId,
            task.Title,
            task.Description,
            task.Status,
            task.Priority,
            task.DueDate,
            task.CreatedAt,
            task.UpdatedAt,
            ProjectId = task.ProjectId,
            Project = new { task.Project.ProjectId, task.Project.Name },
            Assignments = task.Assignments.Select(a => new
            {
                a.AssignmentId,
                a.UserId,
                a.AssignedAt,
                User = new { a.User.UserName, a.User.Email }
            })
        });
    }

    [HttpPost]
    public async Task<IActionResult> CreateTask([FromBody] CreateTaskRequest request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var project = await _context.Projects.FindAsync(request.ProjectId);

        if (project == null)
            return NotFound(new { message = "Проект не найден" });

        var isMember = await _context.ProjectMembers
            .AnyAsync(pm => pm.ProjectId == request.ProjectId && pm.UserId == userId);

        if (project.AuthorId != userId && !isMember)
            return Forbid();

        var task = new Entities.Task
        {
            ProjectId = request.ProjectId,
            Title = request.Title,
            Description = request.Description,
            Status = request.Status ?? "todo",
            Priority = request.Priority ?? 2,
            DueDate = request.DueDate,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTaskById), new { id = task.TaskId }, new
        {
            task.TaskId,
            task.Title,
            task.Description,
            task.Status,
            task.Priority,
            task.DueDate,
            task.CreatedAt,
            task.UpdatedAt
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTask(int id, [FromBody] UpdateTaskRequest request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var task = await _context.Tasks
            .Include(t => t.Project)
            .FirstOrDefaultAsync(t => t.TaskId == id);

        if (task == null)
            return NotFound(new { message = "Задача не найдена" });

        var isMember = await _context.ProjectMembers
            .AnyAsync(pm => pm.ProjectId == task.ProjectId && pm.UserId == userId);

        var isAssigned = await _context.TaskAssignments
            .AnyAsync(ta => ta.TaskId == id && ta.UserId == userId);

        if (task.Project.AuthorId != userId && !isMember && !isAssigned)
            return Forbid();

        if (!string.IsNullOrEmpty(request.Title))
            task.Title = request.Title;

        if (!string.IsNullOrEmpty(request.Description))
            task.Description = request.Description;

        if (!string.IsNullOrEmpty(request.Status))
            task.Status = request.Status;

        if (request.Priority.HasValue)
            task.Priority = request.Priority.Value;

        if (request.DueDate.HasValue)
            task.DueDate = request.DueDate;

        task.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            task.TaskId,
            task.Title,
            task.Description,
            task.Status,
            task.Priority,
            task.DueDate,
            task.CreatedAt,
            task.UpdatedAt
        });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTask(int id)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var task = await _context.Tasks
            .Include(t => t.Project)
            .FirstOrDefaultAsync(t => t.TaskId == id);

        if (task == null)
            return NotFound(new { message = "Задача не найдена" });

        var isMember = await _context.ProjectMembers
            .AnyAsync(pm => pm.ProjectId == task.ProjectId && pm.UserId == userId);

        if (task.Project.AuthorId != userId && !isMember)
            return Forbid();

        _context.Tasks.Remove(task);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Задача удалена" });
    }

    [HttpGet("project/{projectId}")]
    public async Task<IActionResult> GetProjectTasks(int projectId)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var project = await _context.Projects.FindAsync(projectId);

        if (project == null)
            return NotFound(new { message = "Проект не найден" });

        var isMember = await _context.ProjectMembers
            .AnyAsync(pm => pm.ProjectId == projectId && pm.UserId == userId);

        if (project.AuthorId != userId && !isMember)
            return Forbid();

        var tasks = await _context.Tasks
            .Where(t => t.ProjectId == projectId)
            .Include(t => t.Assignments)
            .Select(t => new
            {
                t.TaskId,
                t.Title,
                t.Description,
                t.Status,
                t.Priority,
                t.DueDate,
                t.CreatedAt,
                t.UpdatedAt,
                Assignments = t.Assignments.Select(a => new
                {
                    a.AssignmentId,
                    a.UserId,
                    User = new { a.User.UserName, a.User.Email }
                })
            })
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        return Ok(tasks);
    }

    [HttpPost("{id}/assign")]
    public async Task<IActionResult> AssignTask(int id, [FromBody] AssignTaskRequest request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var task = await _context.Tasks
            .Include(t => t.Project)
            .FirstOrDefaultAsync(t => t.TaskId == id);

        if (task == null)
            return NotFound(new { message = "Задача не найдена" });

        var isMember = await _context.ProjectMembers
            .AnyAsync(pm => pm.ProjectId == task.ProjectId && pm.UserId == userId);

        if (task.Project.AuthorId != userId && !isMember)
            return Forbid();

        var targetUser = await _context.Users.FindAsync(request.UserId);

        if (targetUser == null)
            return NotFound(new { message = "Пользователь не найден" });

        var existingAssignment = await _context.TaskAssignments
            .FirstOrDefaultAsync(ta => ta.TaskId == id && ta.UserId == request.UserId);

        if (existingAssignment != null)
            return BadRequest(new { message = "Пользователь уже назначен на эту задачу" });

        var assignment = new TaskAssignment
        {
            TaskId = id,
            UserId = request.UserId,
            AssignedAt = DateTime.UtcNow
        };

        _context.TaskAssignments.Add(assignment);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTaskById), new { id }, new
        {
            assignment.AssignmentId,
            assignment.TaskId,
            assignment.UserId,
            assignment.AssignedAt,
            User = new { targetUser.UserName, targetUser.Email }
        });
    }

    [HttpDelete("{id}/assign/{userId}")]
    public async Task<IActionResult> UnassignTask(int id, int userId)
    {
        var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var task = await _context.Tasks
            .Include(t => t.Project)
            .FirstOrDefaultAsync(t => t.TaskId == id);

        if (task == null)
            return NotFound(new { message = "Задача не найдена" });

        var isMember = await _context.ProjectMembers
            .AnyAsync(pm => pm.ProjectId == task.ProjectId && pm.UserId == currentUserId);

        if (task.Project.AuthorId != currentUserId && !isMember)
            return Forbid();

        var assignment = await _context.TaskAssignments
            .FirstOrDefaultAsync(ta => ta.TaskId == id && ta.UserId == userId);

        if (assignment == null)
            return NotFound(new { message = "Назначение не найдено" });

        _context.TaskAssignments.Remove(assignment);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Назначение удалено" });
    }
}