using fbAPI.Data;
using fbAPI.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Route("api/admin/faq/categories")]
[ApiController]
[Authorize(Roles = "admin")]
public class AdminFaqCategoriesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AdminFaqCategoriesController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _context.FAQCategories.ToListAsync());
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] string categoryName)
    {
        _context.FAQCategories.Add(new FAQCategory
        {
            CategoryName = categoryName
        });

        await _context.SaveChangesAsync();
        return Ok();
    }
}