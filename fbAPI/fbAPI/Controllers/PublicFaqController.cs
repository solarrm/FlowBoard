using fbAPI.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Route("api/faq")]
[ApiController]
public class PublicFaqController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public PublicFaqController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int? categoryId)
    {
        var query = _context.FAQs
            .Where(f => f.IsActive)
            .Include(f => f.CategoriesLink)
                .ThenInclude(cl => cl.Category)
            .OrderByDescending(f => f.CreatedAt)
            .AsQueryable();

        if (categoryId.HasValue)
        {
            query = query.Where(f =>
                f.CategoriesLink.Any(c => c.CategoryId == categoryId.Value));
        }

        var result = await query.Select(f => new
        {
            f.FaqId,
            f.Question,
            f.Answer,
            Categories = f.CategoriesLink.Select(c => new
            {
                c.Category.CategoryId,
                c.Category.CategoryName
            })
        }).ToListAsync();

        return Ok(result);
    }

    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        return Ok(await _context.FAQCategories
            .OrderBy(c => c.CategoryName)
            .ToListAsync());
    }
}