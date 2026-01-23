using fbAPI.Data;
using fbAPI.DTOs;
using fbAPI.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace fbAPI.Controllers;

[Route("api/admin")]
[ApiController]
[Authorize(Roles = "admin")]
public class AdminController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AdminController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _context.Users
            .Select(u => new
            {
                u.UserId,
                u.Email,
                u.Login,
                u.UserName,
                u.Role,
                u.IsActive,
                u.DateTimeOfRegistration
            })
            .ToListAsync();

        return Ok(users);
    }

    [HttpPut("users/{id}/role")]
    public async Task<IActionResult> UpdateUserRole(int id, [FromBody] UpdateUserRoleRequest request)
    {
        var currentAdminId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        if (currentAdminId == id)
            return BadRequest(new { message = "Нельзя изменить роль самому себе" });

        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == id);
        if (user == null)
            return NotFound(new { message = "Пользователь не найден" });

        var allowedRoles = new[] { "admin", "manager", "user" };
        if (!allowedRoles.Contains(request.Role))
            return BadRequest(new { message = "Недопустимая роль" });

        user.Role = request.Role;
        await _context.SaveChangesAsync();

        return Ok(new
        {
            user.UserId,
            user.Email,
            user.Login,
            user.UserName,
            user.Role,
            user.IsActive
        });
    }

    [HttpPut("users/{id}/status")]
    public async Task<IActionResult> UpdateUserStatus(
    int id,
    [FromBody] UpdateUserStatusRequest request)
    {
        var currentAdminId = int.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier)!.Value
        );

        if (currentAdminId == id)
            return BadRequest(new { message = "Нельзя изменить статус своего аккаунта" });

        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound(new { message = "Пользователь не найден" });

        user.IsActive = request.IsActive;

        if (!request.IsActive)
        {
            user.RefreshToken = null;
            user.RefreshTokenExpiryTime = null;
        }

        await _context.SaveChangesAsync();

        return Ok(new
        {
            user.UserId,
            user.Email,
            user.Login,
            user.UserName,
            user.Role,
            user.IsActive
        });
    }

}