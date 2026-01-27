using fbAPI.Data;
using fbAPI.DTOs;
using fbAPI.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

[Route("api/admin/faq")]
[ApiController]
[Authorize(Roles = "admin")]
public class AdminFaqController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AdminFaqController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var faqs = await _context.FAQs
            .Include(f => f.Author)
            .Include(f => f.CategoriesLink)
                .ThenInclude(cl => cl.Category)
            .OrderByDescending(f => f.CreatedAt)
            .Select(f => new
            {
                f.FaqId,
                f.Question,
                f.Answer,
                f.IsActive,
                f.CreatedAt,
                f.UpdatedAt,
                Author = f.Author.UserName,
                Categories = f.CategoriesLink
                    .Select(c => new
                    {
                        c.Category.CategoryId,
                        c.Category.CategoryName
                    })
            })
            .ToListAsync();

        return Ok(faqs);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] FaqUpsertRequest request)
    {
        var adminId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        if (request.CategoryIds == null || !request.CategoryIds.Any())
        {
            return BadRequest(new { message = "Вопрос должен иметь хотя бы одну категорию" });
        }

        var faq = new FAQ
        {
            Question = request.Question,
            Answer = request.Answer,
            IsActive = request.IsActive,
            CreatedAt = DateTime.UtcNow,
            AuthorId = adminId
        };

        foreach (var categoryId in request.CategoryIds)
        {
            faq.CategoriesLink.Add(new FAQAndCategory
            {
                CategoryId = categoryId
            });
        }

        _context.FAQs.Add(faq);
        await _context.SaveChangesAsync();

        return Ok();
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] FaqUpsertRequest request)
    {
        var faq = await _context.FAQs
            .Include(f => f.CategoriesLink)
            .FirstOrDefaultAsync(f => f.FaqId == id);

        if (faq == null)
            return NotFound();

        if (request.CategoryIds == null || !request.CategoryIds.Any())
        {
            return BadRequest(new { message = "Вопрос должен иметь хотя бы одну категорию" });
        }

        faq.Question = request.Question;
        faq.Answer = request.Answer;
        faq.IsActive = request.IsActive;
        faq.UpdatedAt = DateTime.UtcNow;

        faq.CategoriesLink.Clear();
        foreach (var categoryId in request.CategoryIds)
        {
            faq.CategoriesLink.Add(new FAQAndCategory
            {
                CategoryId = categoryId
            });
        }

        await _context.SaveChangesAsync();
        return Ok();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var isUsed = await _context.FAQAndCategories
            .AnyAsync(x => x.CategoryId == id);

        if (isUsed)
            return BadRequest(new { message = "Категория используется в некоторых вопросах" });

        var category = await _context.FAQCategories.FindAsync(id);
        if (category == null)
            return NotFound();

        _context.FAQCategories.Remove(category);
        await _context.SaveChangesAsync();

        return Ok();
    }

}
