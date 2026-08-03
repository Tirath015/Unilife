using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace Marketplace_capstone_feature_01.Hubs
{

    // SignalR hub for real-time chat functionality


    [Authorize]
    public class ChatHub : Hub
    {

        // Called when a client connects to the hub
        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"user-{userId}");

                await Clients.All.SendAsync("UserOnline", userId);
            }

            await base.OnConnectedAsync();
        }

        // Method to send a private message to a specific user

        public async Task SendPrivateMessage(string receiverId, string message)
        {
            var senderId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(senderId))
            {
                throw new HubException("User is not authenticated.");
            }

            await Clients.Group($"user-{receiverId}").SendAsync("ReceivePrivateMessage", new
            {
                SenderId = senderId,
                ReceiverId = receiverId,
                Message = message,
                SentAt = DateTime.UtcNow
            });



        }

        // Method to send a typing indicator to a specific user

        public async Task SendTypingIndicator(string receiverId)
        {
            var senderId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(senderId))
            {
                throw new HubException("User is not authenticated.");
            }

            await Clients.Group($"user-{receiverId}").SendAsync("UserTyping", new
            {
                SenderId = senderId,
                ReceiverId = receiverId
            });
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!string.IsNullOrEmpty(userId))
            {
                await Clients.All.SendAsync("UserOffline", userId);
            }

            await base.OnDisconnectedAsync(exception);
        }

        // Method to mark a message as read and notify the sender

        public async Task MarkMessageAsRead(string senderId, int messageId)
        {
            var receiverId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(receiverId))
            {
                throw new HubException("User is not authenticated.");
            }

            await Clients.Group($"user-{senderId}").SendAsync("MessageRead", new
            {
                MessageId = messageId,
                ReadBy = receiverId,
                ReadAt = DateTime.UtcNow
            });
        }
    }
}