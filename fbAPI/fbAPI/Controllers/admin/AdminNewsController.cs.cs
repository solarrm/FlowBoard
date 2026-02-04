using fbAPI.Data;
using fbAPI.DTOs;
using fbAPI.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

[Route("api/admin/news")]
[ApiController]
[Authorize(Roles = "admin")]
public class AdminNewsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AdminNewsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var news = await _context.Newses
            .Include(n => n.Author)
            .OrderByDescending(n => n.CreatedAt)
            .Select(n => new
            {
                n.NewId,
                n.Title,
                n.Content,
                n.Image,
                n.IsPublished,
                n.CreatedAt,
                n.PublishedAt,
                Author = n.Author.UserName
            })
            .ToListAsync();

        return Ok(news);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] NewsUpsertRequest request)
    {
        var adminId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var news = new News
        {
            Title = request.Title,
            Content = request.Content,
            Image = request.Image,
            IsPublished = request.IsPublished,
            CreatedAt = DateTime.UtcNow,
            PublishedAt = request.IsPublished ? DateTime.UtcNow : null,
            AuthorId = adminId
        };

        _context.Newses.Add(news);
        await _context.SaveChangesAsync();

        return Ok();
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] NewsUpsertRequest request)
    {
        var news = await _context.Newses.FindAsync(id);
        if (news == null)
            return NotFound();

        news.Title = request.Title;
        news.Content = request.Content;
        news.Image = request.Image;

        if (news.IsPublished != request.IsPublished)
        {
            news.IsPublished = request.IsPublished;
            news.PublishedAt = request.IsPublished ? DateTime.UtcNow : null;
        }

        await _context.SaveChangesAsync();
        return Ok();
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> ToggleStatus(int id, [FromBody] bool isPublished)
    {
        var news = await _context.Newses.FindAsync(id);
        if (news == null)
            return NotFound();

        news.IsPublished = isPublished;
        news.PublishedAt = isPublished ? DateTime.UtcNow : null;

        await _context.SaveChangesAsync();
        return Ok();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Remove(int id)
    {
        var news = await _context.Newses.FindAsync(id);
        if (news == null)
            return NotFound();

        _context.Newses.Remove(news);
        await _context.SaveChangesAsync();

        return Ok();
    }
}