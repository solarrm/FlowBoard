using fbAPI.Data;
using fbAPI.DTOs;
using fbAPI.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace fbAPI.Controllers;

[Route("api/user")]
[ApiController]
[Authorize]
public class UserController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public UserController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.UserId == userId);

        if (user == null)
            return NotFound(new { message = "Пользователь не найден" });

        return Ok(new
        {
            user.UserId,
            user.Login,
            user.Email,
            user.UserName,
            user.Country,
            user.DateOfBirth,
            user.DateTimeOfRegistration,
            user.ProfilePicture,
            user.IsActive,
            user.Role
        });
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.UserId == userId);

        if (user == null)
            return NotFound(new { message = "Пользователь не найден" });

        if (!string.IsNullOrEmpty(request.UserName))
            user.UserName = request.UserName;

        if (!string.IsNullOrEmpty(request.Country))
            user.Country = request.Country;

        if (request.DateOfBirth != default)
            user.DateOfBirth = request.DateOfBirth;

        if (!string.IsNullOrEmpty(request.ProfilePicture))
            user.ProfilePicture = request.ProfilePicture;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            user.UserId,
            user.Login,
            user.Email,
            user.UserName,
            user.Country,
            user.DateOfBirth,
            user.DateTimeOfRegistration,
            user.ProfilePicture,
            user.IsActive,
            user.Role
        });
    }

    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.UserId == userId);

        if (user == null)
            return NotFound(new { message = "Пользователь не найден" });

        if (!user.VerifyPassword(request.CurrentPassword))
            return Unauthorized(new { message = "Текущий пароль неверен" });

        if (string.IsNullOrEmpty(request.NewPassword) || request.NewPassword.Length < 6)
            return BadRequest(new { message = "Новый пароль должен быть не менее 6 символов" });

        user.SetPassword(request.NewPassword);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Пароль успешно изменён" });
    }

    [HttpGet("notifications")]
    public async Task<IActionResult> GetNotifications()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var notifications = await _context.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Select(n => new
            {
                n.Id,
                n.Type,
                n.Message,
                n.ScheduledAt,
                n.CreatedAt,
                n.ReadAt,
                IsRead = n.ReadAt.HasValue
            })
            .Take(20)
            .ToListAsync();

        return Ok(notifications);
    }

    [HttpPost("notifications/{id}/read")]
    public async Task<IActionResult> MarkNotificationAsRead(int id)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);

        if (notification == null)
            return NotFound(new { message = "Уведомление не найдено" });

        notification.ReadAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Уведомление отмечено как прочитанное" });
    }
}