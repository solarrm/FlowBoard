using fbAPI.Data;
using fbAPI.DTOs;
using fbAPI.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace fbAPI.Controllers;

[Route("api/comments")]
[ApiController]
[Authorize]
public class CommentsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CommentsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("note/{noteId}")]
    public async Task<IActionResult> GetNoteComments(int noteId)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var note = await _context.Notes.FirstOrDefaultAsync(n => n.NoteId == noteId);

        if (note == null)
            return NotFound(new { message = "Заметка не найдена" });

        var hasAccess = note.AuthorId == userId ||
                       await _context.NoteShares.AnyAsync(s => s.NoteId == noteId && s.UserId == userId);

        if (!hasAccess)
            return Forbid();

        var comments = await _context.Comments
            .Where(c => c.NoteId == noteId)
            .Include(c => c.Author)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new
            {
                c.CommentId,
                c.NoteId,
                c.Content,
                c.CreatedAt,
                c.UpdatedAt,
                AuthorId = c.AuthorId,
                Author = new { c.Author.UserName, c.Author.Email }
            })
            .ToListAsync();

        return Ok(comments);
    }

    [HttpPost]
    public async Task<IActionResult> CreateComment([FromBody] CreateCommentRequest request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var note = await _context.Notes.FirstOrDefaultAsync(n => n.NoteId == request.NoteId);

        if (note == null)
            return NotFound(new { message = "Заметка не найдена" });

        var hasAccess = note.AuthorId == userId ||
                       await _context.NoteShares.AnyAsync(s =>
                           s.NoteId == request.NoteId && s.UserId == userId && s.CanComment);

        if (!hasAccess)
            return Forbid();

        if (string.IsNullOrEmpty(request.Content))
            return BadRequest(new { message = "Содержание комментария не может быть пустым" });

        var comment = new Comment
        {
            NoteId = request.NoteId,
            AuthorId = userId,
            Content = request.Content,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();

        var user = await _context.Users.FindAsync(userId);

        return CreatedAtAction(nameof(GetNoteComments),
            new { noteId = request.NoteId }, new
            {
                comment.CommentId,
                comment.NoteId,
                comment.Content,
                comment.CreatedAt,
                comment.UpdatedAt,
                AuthorId = comment.AuthorId,
                Author = new { user.UserName, user.Email }
            });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateComment(int id, [FromBody] UpdateCommentRequest request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var comment = await _context.Comments.FirstOrDefaultAsync(c => c.CommentId == id);

        if (comment == null)
            return NotFound(new { message = "Комментарий не найден" });

        if (comment.AuthorId != userId)
            return Forbid();

        if (!string.IsNullOrEmpty(request.Content))
            comment.Content = request.Content;

        comment.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            comment.CommentId,
            comment.NoteId,
            comment.Content,
            comment.CreatedAt,
            comment.UpdatedAt
        });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteComment(int id)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var comment = await _context.Comments.FirstOrDefaultAsync(c => c.CommentId == id);

        if (comment == null)
            return NotFound(new { message = "Комментарий не найден" });

        if (comment.AuthorId != userId)
            return Forbid();

        _context.Comments.Remove(comment);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Комментарий удалён" });
    }
}