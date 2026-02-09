using fbAPI.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Route("api/news")]
[ApiController]
public class PublicNewsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public PublicNewsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var news = await _context.Newses
            .Where(n => n.IsPublished)
            .Include(n => n.Author)
            .OrderByDescending(n => n.PublishedAt ?? n.CreatedAt)
            .Select(n => new
            {
                n.NewId,
                n.Title,
                n.Content,
                n.Image,
                n.CreatedAt,
                n.PublishedAt,
                Author = n.Author.UserName
            })
            .ToListAsync();

        return Ok(news);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var news = await _context.Newses
            .Where(n => n.NewId == id && n.IsPublished)
            .Include(n => n.Author)
            .Select(n => new
            {
                n.NewId,
                n.Title,
                n.Content,
                n.Image,
                n.CreatedAt,
                n.PublishedAt,
                Author = n.Author.UserName
            })
            .FirstOrDefaultAsync();

        if (news == null)
            return NotFound();

        return Ok(news);
    }
}