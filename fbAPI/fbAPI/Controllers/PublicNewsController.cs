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
            .Include(n => n.Author)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();

        var result = news.Select(n => new
        {
            n.NewId,
            n.Title,
            n.Content,
            Image = n.Image != null
                ? $"{Request.Scheme}://{Request.Host}{n.Image}"
                : null,
            n.IsPublished,
            n.CreatedAt,
            n.PublishedAt,
            Author = n.Author.UserName
        });

        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var news = await _context.Newses
            .Include(n => n.Author)
            .FirstOrDefaultAsync(n => n.NewId == id && n.IsPublished);

        if (news == null)
            return NotFound();

        return Ok(new
        {
            news.NewId,
            news.Title,
            news.Content,
            Image = news.Image != null
                ? $"{Request.Scheme}://{Request.Host}{news.Image}"
                : null,
            news.CreatedAt,
            news.PublishedAt,
            Author = news.Author.UserName
        });
    }

}