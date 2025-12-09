using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using fbAPI.Data;
using fbAPI.Entities;
using fbAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace fbAPI.Controllers;

[Route("api/auth")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _config;

    public AuthController(ApplicationDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (await _context.Users.AnyAsync(u => u.Email == request.Email || u.Login == request.Login))
        {
            return BadRequest(new { message = "Такой email или логин уже существует" });
        }

        var user = new User
        {
            Email = request.Email,
            Login = request.Login,
            UserName = request.UserName,
            Country = request.Country,
            DateOfBirth = request.DateOfBirth,
            DateTimeOfRegistration = DateTime.UtcNow,
            IsActive = true,
            Role = "Участник"
        };

        user.SetPassword(request.Password);

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var accessToken = GenerateJwtToken(user);
        var refreshToken = GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            token = accessToken,
            refreshToken,
            user = new
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
            }
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u =>
            u.Email == request.LoginOrEmail || u.Login == request.LoginOrEmail);

        if (user == null || !user.VerifyPassword(request.Password))
        {
            return Unauthorized(new { message = "Неверный логин/email или пароль" });
        }

        if (!user.IsActive)
        {
            return Unauthorized(new { message = "Пользователь деактивирован" });
        }

        var accessToken = GenerateJwtToken(user);
        var refreshToken = GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            token = accessToken,
            refreshToken,
            user = new
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
            }
        });
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout([FromBody] RefreshRequest request)
    {
        if (request == null || string.IsNullOrEmpty(request.RefreshToken))
            return BadRequest(new { message = "Refresh token обязателен" });

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.RefreshToken == request.RefreshToken);

        if (user == null)
            return Unauthorized(new { message = "Пользователь не найден" });

        user.RefreshToken = null;
        user.RefreshTokenExpiryTime = null;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Выход выполнен" });
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshRequest request)
    {
        if (request is null || string.IsNullOrEmpty(request.RefreshToken))
            return BadRequest(new { message = "Refresh token обязателен" });

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.RefreshToken == request.RefreshToken);

        if (user == null || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
            return Unauthorized(new { message = "Недействительный или истёкший refresh token" });

        var newAccessToken = GenerateJwtToken(user);
        var newRefreshToken = GenerateRefreshToken();

        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            token = newAccessToken,
            refreshToken = newRefreshToken,
            user = new
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
            }
        });
    }

    private string GenerateJwtToken(User user)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.UserName),
            new Claim(ClaimTypes.Role, user.Role)
        };

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(1),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static string GenerateRefreshToken()
    {
        var randomBytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes);
    }
}