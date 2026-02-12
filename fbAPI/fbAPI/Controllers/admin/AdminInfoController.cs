using fbAPI.Data;
using fbAPI.DTOs;
using fbAPI.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Route("api/admin/info")]
[ApiController]
[Authorize(Roles = "admin")]
public class AdminInfoController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AdminInfoController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var info = await _context.Infos.FirstOrDefaultAsync();

        return Ok(info);
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] InfoUpsertRequest request)
    {
        var info = await _context.Infos.FirstOrDefaultAsync();

        if (info == null)
        {
            info = new Info();
            _context.Infos.Add(info);
        }

        info.ServiceName = request.ServiceName;
        info.Decription = request.Decription;
        info.Version = request.Version;
        info.Contacts = request.Contacts;
        info.WebsiteUrl = request.WebsiteUrl;

        await _context.SaveChangesAsync();

        return Ok();
    }
}