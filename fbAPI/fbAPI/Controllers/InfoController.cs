using fbAPI.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Route("api/info")]
[ApiController]
public class InfoController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public InfoController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var info = await _context.Infos.FirstOrDefaultAsync();

        if (info == null)
            return NotFound();

        return Ok(info);
    }
}