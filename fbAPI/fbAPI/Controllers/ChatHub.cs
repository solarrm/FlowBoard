using fbAPI.Data;
using fbAPI.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

[Authorize]
public class ChatHub : Hub
{
    private readonly ApplicationDbContext _context;

    public ChatHub(ApplicationDbContext context)
    {
        _context = context;
    }

    public async System.Threading.Tasks.Task JoinChat(int chatId)
    {
        var userId = int.Parse(Context.UserIdentifier);

        var member = await _context.ChatMembers
            .FirstOrDefaultAsync(cm => cm.ChatId == chatId && cm.UserId == userId);

        if (member != null)
        {
            member.IsOnline = true;
            member.JoinedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, chatId.ToString());

        await SendOnlineCount(chatId);
        await Clients.Group(chatId.ToString()).SendAsync("UserJoined", userId);
    }

    public async System.Threading.Tasks.Task SendMessage(int chatId, string content)
    {
        var userId = int.Parse(Context.UserIdentifier);

        var message = new Message
        {
            ChatId = chatId,
            SenderId = userId,
            Content = content,
            CreatedAt = DateTime.UtcNow,
            IsRead = false
        };

        _context.Messages.Add(message);
        await _context.SaveChangesAsync();

        var senderName = await _context.Users
            .Where(u => u.UserId == userId)
            .Select(u => u.UserName ?? u.Email ?? "Пользователь")
            .FirstOrDefaultAsync();

        await Clients.Group(chatId.ToString()).SendAsync("ReceiveMessage", new
        {
            MessageId = message.MessageId,
            ChatId = message.ChatId,
            UserId = message.SenderId,
            UserName = senderName,
            Content = message.Content,
            Timestamp = message.CreatedAt
        });
    }

    public override async System.Threading.Tasks.Task OnDisconnectedAsync(Exception? exception)
    {
        if (Context.UserIdentifier != null)
        {
            var userId = int.Parse(Context.UserIdentifier);

            var members = await _context.ChatMembers
                .Where(cm => cm.UserId == userId)
                .ToListAsync();

            foreach (var member in members)
            {
                member.IsOnline = false;
            }
            await _context.SaveChangesAsync();

            foreach (var member in members)
            {
                await SendOnlineCount(member.ChatId);
            }
        }

        await base.OnDisconnectedAsync(exception);
    }

    private async System.Threading.Tasks.Task SendOnlineCount(int chatId)
    {
        var onlineCount = await _context.ChatMembers
            .CountAsync(cm => cm.ChatId == chatId && cm.IsOnline);

        await Clients.Group(chatId.ToString()).SendAsync("OnlineCountUpdated", onlineCount);
    }
}
