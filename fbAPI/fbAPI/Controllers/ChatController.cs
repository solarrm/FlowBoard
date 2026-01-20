using fbAPI.Data;
using fbAPI.DTOs;
using fbAPI.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

namespace fbAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChatController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ChatController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("rooms")]
    public async Task<ActionResult<IEnumerable<object>>> GetChatRooms()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var rooms = await _context.Chats
            .Include(c => c.Members)
            .ThenInclude(cm => cm.User)
            .Where(c => c.Members.Any(m => m.UserId == userId))
            .Select(c => new
            {
                c.ChatId,
                c.Name,
                ProjectId = c.ProjectId,
                MembersCount = c.Members.Count(),
                OnlineCount = c.Members.Count(m => m.IsOnline),
                UnreadCount = c.Messages.Count(m => m.SenderId != userId),
                LastMessage = c.Messages.OrderByDescending(m => m.CreatedAt)
                    .Select(m => m.Content).FirstOrDefault() ?? "",
                LastMessageTime = c.Messages.OrderByDescending(m => m.CreatedAt)
                    .Select(m => m.CreatedAt).FirstOrDefault(),
                LastSenderName = c.Messages.OrderByDescending(m => m.CreatedAt)
                    .Select(m => m.Sender.UserName).FirstOrDefault() ?? "Неизвестно"
            })
            .OrderByDescending(c => c.LastMessageTime)
            .ToListAsync();

        return Ok(rooms);
    }



    [HttpPost("rooms")]
    public async Task<ActionResult<object>> CreateChatRoom([FromBody] CreateChatRoomDto dto)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var chat = new Chat
        {
            Name = dto.Name,
            ProjectId = dto.ProjectId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Chats.Add(chat);
        await _context.SaveChangesAsync();

        var member = new ChatMember
        {
            ChatId = chat.ChatId,
            UserId = userId,
            JoinedAt = DateTime.UtcNow
        };
        _context.ChatMembers.Add(member);

        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetChatRooms), new
        {
            chat.ChatId,
            chat.Name,
            MembersCount = 1
        });
    }

    [HttpGet("{roomId}/messages")]
    public async Task<ActionResult<IEnumerable<MessageDto>>> GetMessages(int roomId)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var messages = await _context.Messages
            .Include(m => m.Sender)
            .Where(m => m.ChatId == roomId)
            .OrderBy(m => m.CreatedAt)
            .Select(m => new MessageDto
            {
                MessageId = m.MessageId,
                ChatId = m.ChatId,
                UserId = m.SenderId,
                UserName = m.Sender.UserName ?? m.Sender.Email ?? "Пользователь",
                Content = m.Content,
                Timestamp = m.CreatedAt
            })
            .Take(100)
            .ToListAsync();

        return Ok(messages);
    }

    [HttpPost("{roomId}/messages")]
    public async Task<ActionResult> SendMessage(int roomId, [FromBody] SendMessageDto dto)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var message = new Message
        {
            ChatId = roomId,
            SenderId = userId,
            Content = dto.Content,
            CreatedAt = DateTime.UtcNow,
            IsRead = false
        };

        _context.Messages.Add(message);
        await _context.SaveChangesAsync();

        return Ok(new { success = true });
    }
}
