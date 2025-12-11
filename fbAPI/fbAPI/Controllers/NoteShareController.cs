using fbAPI.Data;
using fbAPI.DTOs;
using fbAPI.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace fbAPI.Controllers;

[Route("api/notes")]
[ApiController]
[Authorize]
public class NoteShareController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public NoteShareController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("{id}/shares")]
    public async Task<IActionResult> GetNoteShares(int id)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var note = await _context.Notes.FirstOrDefaultAsync(n => n.NoteId == id);

        if (note == null)
            return NotFound(new { message = "Заметка не найдена" });

        if (note.AuthorId != userId)
            return Forbid();

        var shares = await _context.NoteShares
            .Where(s => s.NoteId == id)
            .Include(s => s.User)
            .Select(s => new
            {
                s.Id,
                s.NoteId,
                s.UserId,
                s.CanEdit,
                s.CanComment,
                s.SharedAt,
                User = new { s.User.UserName, s.User.Email }
            })
            .ToListAsync();

        return Ok(shares);
    }

    [HttpPost("{id}/shares")]
    public async Task<IActionResult> AddNoteShare(int id, [FromBody] AddNoteShareRequest request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var note = await _context.Notes.FirstOrDefaultAsync(n => n.NoteId == id);

        if (note == null)
            return NotFound(new { message = "Заметка не найдена" });

        if (note.AuthorId != userId)
            return Forbid();

        var targetUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.UserEmail);

        if (targetUser == null)
            return NotFound(new { message = "Пользователь с таким email не найден" });

        var existingShare = await _context.NoteShares
            .FirstOrDefaultAsync(s => s.NoteId == id && s.UserId == targetUser.UserId);

        if (existingShare != null)
            return BadRequest(new { message = "Пользователь уже имеет доступ к этой заметке" });

        var share = new NoteShare
        {
            NoteId = id,
            UserId = targetUser.UserId,
            CanEdit = request.CanEdit,
            CanComment = request.CanComment,
            SharedAt = DateTime.UtcNow
        };

        _context.NoteShares.Add(share);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetNoteShares), new { id }, new
        {
            share.Id,
            share.NoteId,
            share.UserId,
            share.CanEdit,
            share.CanComment,
            share.SharedAt,
            User = new { targetUser.UserName, targetUser.Email }
        });
    }

    [HttpPut("{id}/shares/{shareId}")]
    public async Task<IActionResult> UpdateNoteShare(int id, int shareId, [FromBody] UpdateNoteShareRequest request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var note = await _context.Notes.FirstOrDefaultAsync(n => n.NoteId == id);

        if (note == null)
            return NotFound(new { message = "Заметка не найдена" });

        if (note.AuthorId != userId)
            return Forbid();

        var share = await _context.NoteShares
            .FirstOrDefaultAsync(s => s.Id == shareId && s.NoteId == id);

        if (share == null)
            return NotFound(new { message = "Нет доступа" });

        if (request.CanEdit.HasValue)
            share.CanEdit = request.CanEdit.Value;

        if (request.CanComment.HasValue)
            share.CanComment = request.CanComment.Value;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            share.Id,
            share.NoteId,
            share.UserId,
            share.CanEdit,
            share.CanComment,
            share.SharedAt
        });
    }

    [HttpDelete("{id}/shares/{shareId}")]
    public async Task<IActionResult> RemoveNoteShare(int id, int shareId)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var note = await _context.Notes.FirstOrDefaultAsync(n => n.NoteId == id);

        if (note == null)
            return NotFound(new { message = "Заметка не найдена" });

        if (note.AuthorId != userId)
            return Forbid();

        var share = await _context.NoteShares
            .FirstOrDefaultAsync(s => s.Id == shareId && s.NoteId == id);

        if (share == null)
            return NotFound(new { message = "Нет доступа" });

        _context.NoteShares.Remove(share);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Доступ удалён" });
    }
}