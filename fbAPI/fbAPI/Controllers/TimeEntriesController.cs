using fbAPI.Data;
using fbAPI.DTOs;
using fbAPI.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace fbAPI.Controllers;

[Route("api/time-entries")]
[ApiController]
[Authorize]
public class TimeEntriesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public TimeEntriesController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("task/{taskId}")]
    public async Task<IActionResult> GetTimeEntriesByTask(int taskId)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var task = await _context.Tasks.FindAsync(taskId);

        if (task == null)
            return NotFound(new { message = "Задача не найдена" });

        var isMember = await _context.ProjectMembers
            .AnyAsync(pm => pm.ProjectId == task.ProjectId && pm.UserId == userId);

        var isAssigned = await _context.TaskAssignments
            .AnyAsync(ta => ta.TaskId == taskId && ta.UserId == userId);

        if (!isMember && !isAssigned)
            return Forbid();

        var timeEntries = await _context.TimeEntries
            .Where(te => te.TaskId == taskId)
            .OrderByDescending(te => te.StartTime)
            .Select(te => new
            {
                te.Id,
                te.TaskId,
                te.UserId,
                te.StartTime,
                te.EndTime,
                te.DurationMinutes,
                User = new { te.User.UserName, te.User.Email }
            })
            .ToListAsync();

        return Ok(timeEntries);
    }

    [HttpPost]
    public async Task<IActionResult> CreateTimeEntry([FromBody] CreateTimeEntryRequest request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var task = await _context.Tasks.FindAsync(request.TaskId);

        if (task == null)
            return NotFound(new { message = "Задача не найдена" });

        var isAssigned = await _context.TaskAssignments
            .AnyAsync(ta => ta.TaskId == request.TaskId && ta.UserId == userId);

        var isMember = await _context.ProjectMembers
            .AnyAsync(pm => pm.ProjectId == task.ProjectId && pm.UserId == userId);

        if (!isAssigned && !isMember)
            return Forbid();

        var timeEntry = new TimeEntry
        {
            TaskId = request.TaskId,
            UserId = userId,
            StartTime = request.StartTime ?? DateTime.UtcNow,
            EndTime = null,
            DurationMinutes = 0
        };

        _context.TimeEntries.Add(timeEntry);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTimeEntriesByTask),
            new { taskId = request.TaskId }, new
            {
                timeEntry.Id,
                timeEntry.TaskId,
                timeEntry.UserId,
                timeEntry.StartTime,
                timeEntry.EndTime,
                timeEntry.DurationMinutes
            });
    }

    [HttpPost("{id}/stop")]
    public async Task<IActionResult> StopTimeEntry(int id, [FromBody] StopTimeEntryRequest request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var timeEntry = await _context.TimeEntries.FindAsync(id);

        if (timeEntry == null)
            return NotFound(new { message = "Данные о времени не найдены" });

        if (timeEntry.UserId != userId)
            return Forbid();

        timeEntry.EndTime = request.EndTime ?? DateTime.UtcNow;
        timeEntry.DurationMinutes = request.DurationMinutes ??
            (int)Math.Round((timeEntry.EndTime.Value - timeEntry.StartTime).TotalMinutes);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            timeEntry.Id,
            timeEntry.TaskId,
            timeEntry.UserId,
            timeEntry.StartTime,
            timeEntry.EndTime,
            timeEntry.DurationMinutes
        });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTimeEntry(int id)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var timeEntry = await _context.TimeEntries.FindAsync(id);

        if (timeEntry == null)
            return NotFound(new { message = "Данные о времени не найдены" });

        if (timeEntry.UserId != userId)
            return Forbid();

        _context.TimeEntries.Remove(timeEntry);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Данные о времени удалены" });
    }

    [HttpGet("stats/{taskId}")]
    public async Task<IActionResult> GetTaskTimeStats(int taskId)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var task = await _context.Tasks.FindAsync(taskId);

        if (task == null)
            return NotFound(new { message = "Задача не найдена" });

        var isMember = await _context.ProjectMembers
            .AnyAsync(pm => pm.ProjectId == task.ProjectId && pm.UserId == userId);

        if (!isMember)
            return Forbid();

        var stats = await _context.TimeEntries
            .Where(te => te.TaskId == taskId)
            .GroupBy(te => te.UserId)
            .Select(g => new
            {
                UserId = g.Key,
                User = g.First().User,
                TotalMinutes = g.Sum(te => te.DurationMinutes ?? 0),
                EntriesCount = g.Count()
            })
            .ToListAsync();

        var totalMinutes = stats.Sum(s => s.TotalMinutes);

        return Ok(new
        {
            TotalMinutes = totalMinutes,
            TotalHours = Math.Round(totalMinutes / 60.0, 2),
            ByUser = stats.Select(s => new
            {
                s.UserId,
                s.User,
                s.TotalMinutes,
                s.EntriesCount,
                Hours = Math.Round(s.TotalMinutes / 60.0, 2)
            })
        });
    }
}