using Marketplace_capstone_feature_01.Data;
using Marketplace_capstone_feature_01.DTOs;
using Marketplace_capstone_feature_01.Interfaces;
using Marketplace_capstone_feature_01.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Net;
using System.Security.Claims;

namespace Marketplace_capstone_feature_01.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class MessagesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;

        public MessagesController(
            ApplicationDbContext context,
            IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        // POST: api/Messages
        [HttpPost]
        public async Task<IActionResult> SendMessage(CreateMessageDto request)
        {
            var senderIdValue = User
                .FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(senderIdValue, out int senderId))
            {
                return Unauthorized("Invalid user token.");
            }

            if (senderId == request.ReceiverId)
            {
                return BadRequest(
                    "You cannot send a message to yourself.");
            }

            if (string.IsNullOrWhiteSpace(request.MessageText))
            {
                return BadRequest(
                    "Message text is required.");
            }

            var sender = await _context.Users
                .FirstOrDefaultAsync(u => u.UserId == senderId);

            if (sender == null)
            {
                return BadRequest("Sender not found.");
            }

            var receiver = await _context.Users
                .FirstOrDefaultAsync(
                    u => u.UserId == request.ReceiverId);

            if (receiver == null)
            {
                return BadRequest("Receiver not found.");
            }

            var listing = await _context.Listings
                .FirstOrDefaultAsync(
                    l => l.ListingId == request.ListingId);

            if (listing == null)
            {
                return BadRequest("Listing not found.");
            }

            /*
             * Only users connected to the listing should be able to message.
             *
             * The sender or receiver should be the listing owner.
             */
            if (listing.UserId != senderId &&
                listing.UserId != request.ReceiverId)
            {
                return BadRequest(
                    "This conversation is not connected to the listing owner.");
            }

            var message = new ChatMessage
            {
                SenderId = senderId,
                ReceiverId = request.ReceiverId,
                ListingId = request.ListingId,
                MessageText = request.MessageText.Trim(),
                SentAt = DateTime.UtcNow,
                IsRead = false
            };

            _context.ChatMessages.Add(message);

            _context.Notifications.Add(new Notification
            {
                UserId = receiver.UserId,
                Message =
                    $"{sender.FullName} sent you a message about {listing.Title}.",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();

            // Send an email notification to the receiver
            try
            {
                string receiverName =
                    WebUtility.HtmlEncode(receiver.FullName);

                string senderName =
                    WebUtility.HtmlEncode(sender.FullName);

                string listingTitle =
                    WebUtility.HtmlEncode(listing.Title);

                await _emailService.SendEmailAsync(
                    receiver.Email,
                    $"New message about {listing.Title}",
                    $"""
                    <div style="font-family: Arial, sans-serif;
                                max-width: 600px;
                                margin: auto;">

                        <h2>You received a new message</h2>

                        <p>Hello {receiverName},</p>

                        <p>
                            <strong>{senderName}</strong>
                            sent you a new message about:
                            <strong>{listingTitle}</strong>.
                        </p>

                        <p>
                            Open your Marketplace account to read
                            the message and reply.
                        </p>

                        <p>
                            Regards,<br />
                            Marketplace Support
                        </p>
                    </div>
                    """);
            }
            catch (Exception ex)
            {
                Console.WriteLine(
                    $"Message email could not be sent: {ex.Message}");
            }

            return Ok(new
            {
                message = "Message sent successfully.",
                messageId = message.ChatMessageId,
                senderId = message.SenderId,
                receiverId = message.ReceiverId,
                listingId = message.ListingId,
                messageText = message.MessageText,
                sentAt = message.SentAt,
                isRead = message.IsRead
            });
        }

        // GET:
        // api/Messages/conversation?otherUserId=2&listingId=3
        [HttpGet("conversation")]
        public async Task<IActionResult> GetConversation(
            int otherUserId,
            int listingId)
        {
            var currentUserIdValue = User
                .FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(
                currentUserIdValue,
                out int currentUserId))
            {
                return Unauthorized("Invalid user token.");
            }

            var listing = await _context.Listings
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    l => l.ListingId == listingId);

            if (listing == null)
            {
                return NotFound("Listing not found.");
            }

            var otherUser = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    u => u.UserId == otherUserId);

            if (otherUser == null)
            {
                return NotFound("User not found.");
            }

            var userIsConnectedToListing =
                listing.UserId == currentUserId ||
                listing.UserId == otherUserId;

            if (!userIsConnectedToListing)
            {
                return BadRequest(
                    "This conversation is not connected to the listing owner.");
            }

            var messages = await _context.ChatMessages
                .AsNoTracking()
                .Where(m =>
                    m.ListingId == listingId &&
                    (
                        (
                            m.SenderId == currentUserId &&
                            m.ReceiverId == otherUserId
                        )
                        ||
                        (
                            m.SenderId == otherUserId &&
                            m.ReceiverId == currentUserId
                        )
                    ))
                .OrderBy(m => m.SentAt)
                .Select(m => new
                {
                    messageId = m.ChatMessageId,
                    senderId = m.SenderId,
                    receiverId = m.ReceiverId,
                    listingId = m.ListingId,
                    messageText = m.MessageText,
                    sentAt = m.SentAt,
                    isRead = m.IsRead,
                    readAt = m.ReadAt
                })
                .ToListAsync();

            return Ok(new
            {
                currentUserId,
                otherUser = new
                {
                    userId = otherUser.UserId,
                    fullName = otherUser.FullName
                },
                listing = new
                {
                    listingId = listing.ListingId,
                    title = listing.Title
                },
                messages
            });
        }


        // GET: api/Messages/inbox
        [HttpGet("inbox")]
        public async Task<IActionResult> GetInbox()
        {
            var currentUserIdValue = User
                .FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(
                currentUserIdValue,
                out int currentUserId))
            {
                return Unauthorized("Invalid user token.");
            }

            var messages = await _context.ChatMessages
                .AsNoTracking()
                .Where(m =>
                    m.SenderId == currentUserId ||
                    m.ReceiverId == currentUserId)
                .Select(m => new
                {
                    messageId = m.ChatMessageId,
                    senderId = m.SenderId,
                    receiverId = m.ReceiverId,
                    listingId = m.ListingId,
                    messageText = m.MessageText,
                    sentAt = m.SentAt,
                    isRead = m.IsRead,

                    otherUserId =
                        m.SenderId == currentUserId
                            ? m.ReceiverId
                            : m.SenderId
                })
                .OrderByDescending(m => m.sentAt)
                .ToListAsync();

            var groupedMessages = messages
                .GroupBy(m => new
                {
                    m.otherUserId,
                    m.listingId
                })
                .Select(group => group.First())
                .ToList();

            var otherUserIds = groupedMessages
                .Select(m => m.otherUserId)
                .Distinct()
                .ToList();

            var listingIds = groupedMessages
                .Select(m => m.listingId)
                .Distinct()
                .ToList();

            var users = await _context.Users
                .AsNoTracking()
                .Where(u => otherUserIds.Contains(u.UserId))
                .ToDictionaryAsync(
                    u => u.UserId,
                    u => u.FullName);

            var listings = await _context.Listings
                .AsNoTracking()
                .Where(l => listingIds.Contains(l.ListingId))
                .ToDictionaryAsync(
                    l => l.ListingId,
                    l => l.Title);

            var inbox = groupedMessages.Select(message => new
            {
                message.messageId,
                message.otherUserId,

                otherUserName = users.TryGetValue(
                    message.otherUserId,
                    out var userName)
                        ? userName
                        : "Unknown User",

                message.listingId,

                listingTitle = listings.TryGetValue(
                    message.listingId,
                    out var listingTitle)
                        ? listingTitle
                        : "Unknown Listing",

                lastMessage = message.messageText,
                message.sentAt,

                hasUnreadMessage =
                    message.receiverId == currentUserId &&
                    !message.isRead
            });

            return Ok(inbox);
        }

        // PUT: api/Messages/{messageId}/read
        [HttpPut("{messageId}/read")]
        public async Task<IActionResult> MarkMessageAsRead(
            int messageId)
        {
            var userIdValue = User
                .FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userIdValue, out int userId))
            {
                return Unauthorized("Invalid user token.");
            }

            var message = await _context.ChatMessages
                .FindAsync(messageId);

            if (message == null)
            {
                return NotFound("Message not found.");
            }

            if (message.ReceiverId != userId)
            {
                return Forbid();
            }

            if (message.IsRead)
            {
                return Ok("Message is already marked as read.");
            }

            message.IsRead = true;
            message.ReadAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok("Message marked as read.");
        }
    }
}