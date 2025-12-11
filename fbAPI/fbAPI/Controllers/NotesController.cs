using fbAPI.Entities;
using fbAPI.Data;
using fbAPI.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace fbAPI.Controllers;

[Route("api/notes")]
[ApiController]
[Authorize]
public class NotesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public NotesController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetNotes()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var notes = await _context.Notes
            .Where(n => n.AuthorId == userId || n.Shares.Any(s => s.UserId == userId))
            .Select(n => new
            {
                n.NoteId,
                n.Title,
                n.Content,
                n.CreatedAt,
                n.UpdatedAt,
                AuthorId = n.AuthorId,
                Author = new { n.Author.UserName, n.Author.Email }
            })
            .OrderByDescending(n => n.UpdatedAt)
            .ToListAsync();

        return Ok(notes);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetNoteById(int id)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var note = await _context.Notes
            .Include(n => n.Author)
            .FirstOrDefaultAsync(n => n.NoteId == id);

        if (note == null)
            return NotFound(new { message = "Заметка не найдена" });

        var hasAccess = note.AuthorId == userId ||
                       await _context.NoteShares.AnyAsync(s => s.NoteId == id && s.UserId == userId);

        if (!hasAccess)
            return Forbid();

        return Ok(new
        {
            note.NoteId,
            note.Title,
            note.Content,
            note.CreatedAt,
            note.UpdatedAt,
            AuthorId = note.AuthorId,
            Author = new { note.Author.UserName, note.Author.Email }
        });
    }

    [HttpPost]
    public async Task<IActionResult> CreateNote([FromBody] CreateNoteRequest request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var note = new Note
        {
            Title = request.Title ?? "Новая заметка",
            Content = request.Content ?? "",
            AuthorId = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Notes.Add(note);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetNoteById), new { id = note.NoteId }, new
        {
            note.NoteId,
            note.Title,
            note.Content,
            note.CreatedAt,
            note.UpdatedAt
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateNote(int id, [FromBody] UpdateNoteRequest request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var note = await _context.Notes.FirstOrDefaultAsync(n => n.NoteId == id);

        if (note == null)
            return NotFound(new { message = "Заметка не найдена" });

        var canEdit = note.AuthorId == userId ||
                     await _context.NoteShares.AnyAsync(s =>
                        s.NoteId == id && s.UserId == userId && s.CanEdit);

        if (!canEdit)
            return Forbid();

        if (!string.IsNullOrEmpty(request.Title))
            note.Title = request.Title;

        if (request.Content != null)
            note.Content = request.Content;

        note.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            note.NoteId,
            note.Title,
            note.Content,
            note.CreatedAt,
            note.UpdatedAt
        });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteNote(int id)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var note = await _context.Notes.FirstOrDefaultAsync(n => n.NoteId == id);

        if (note == null)
            return NotFound(new { message = "Заметка не найдена" });

        if (note.AuthorId != userId)
            return Forbid();

        _context.Notes.Remove(note);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Заметка удалена" });
    }
}