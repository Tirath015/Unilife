using Marketplace_capstone_feature_01.Data;
using Marketplace_capstone_feature_01.DTOs;
using Marketplace_capstone_feature_01.Enums;
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
    public class RequestsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;

        public RequestsController(
            ApplicationDbContext context,
            IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        // GET: api/requests/buyer
        [HttpGet("buyer")]
        public async Task<IActionResult> GetBuyerRequests()
        {
            int buyerId = GetCurrentUserId();

            var requests = await _context.PurchaseRequests
                .Include(r => r.Listing)
                .Include(r => r.Seller)
                .Where(r => r.BuyerId == buyerId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            return Ok(requests);
        }

        // GET: api/requests/seller
        [HttpGet("seller")]
        public async Task<IActionResult> GetSellerRequests()
        {
            int sellerId = GetCurrentUserId();

            var requests = await _context.PurchaseRequests
                .Include(r => r.Listing)
                .Include(r => r.Buyer)
                .Where(r => r.SellerId == sellerId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            return Ok(requests);
        }

        // PUT: api/requests/{id}/accept
        [HttpPut("{id}/accept")]
        public async Task<IActionResult> AcceptRequest(int id)
        {
            int sellerId = GetCurrentUserId();

            var request = await _context.PurchaseRequests
                .Include(r => r.Listing)
                .Include(r => r.Buyer)
                .FirstOrDefaultAsync(r => r.PurchaseRequestId == id);

            if (request == null)
            {
                return NotFound("Request not found.");
            }

            if (request.SellerId != sellerId)
            {
                return Forbid();
            }

            if (request.Status != RequestStatus.Pending)
            {
                return BadRequest("This request has already been processed.");
            }

            request.Status = RequestStatus.Approved;

            if (request.Listing != null)
            {
                request.Listing.Status =
                    request.Listing.ListingType == ListingType.ForRent
                        ? ListingStatus.Rented
                        : ListingStatus.Sold;
            }

            _context.Notifications.Add(new Notification
            {
                UserId = request.BuyerId,
                Message = request.Listing == null
                    ? "Your marketplace request has been approved."
                    : $"Your request for {request.Listing.Title} has been approved.",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();

            // Send approval email to the buyer
            if (request.Buyer != null)
            {
                try
                {
                    string buyerName =
                        WebUtility.HtmlEncode(request.Buyer.FullName);

                    string listingTitle =
                        WebUtility.HtmlEncode(
                            request.Listing?.Title ?? "the listing");

                    await _emailService.SendEmailAsync(
                        request.Buyer.Email,
                        $"Your request for {request.Listing?.Title} was approved",
                        $"""
                        <div style="font-family: Arial, sans-serif;
                                    max-width: 600px;
                                    margin: auto;">

                            <h2>Your request was approved</h2>

                            <p>Hello {buyerName},</p>

                            <p>
                                Good news! Your request for
                                <strong>{listingTitle}</strong>
                                has been approved by the seller.
                            </p>

                            <p>
                                The listing status has now been updated to
                                <strong>{request.Listing?.Status.ToString()}</strong>.
                            </p>

                            <p>
                                You can open the marketplace application
                                to contact the seller and continue the process.
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
                        $"Approval email could not be sent: {ex.Message}");
                }
            }

            return Ok(new
            {
                message = "Request approved successfully."
            });
        }

        // PUT: api/requests/{id}/reject
        [HttpPut("{id}/reject")]
        public async Task<IActionResult> RejectRequest(int id)
        {
            int sellerId = GetCurrentUserId();

            var request = await _context.PurchaseRequests
                .Include(r => r.Listing)
                .Include(r => r.Buyer)
                .FirstOrDefaultAsync(r => r.PurchaseRequestId == id);

            if (request == null)
            {
                return NotFound("Request not found.");
            }

            if (request.SellerId != sellerId)
            {
                return Forbid();
            }

            if (request.Status != RequestStatus.Pending)
            {
                return BadRequest("This request has already been processed.");
            }

            request.Status = RequestStatus.Rejected;

            _context.Notifications.Add(new Notification
            {
                UserId = request.BuyerId,
                Message = request.Listing == null
                    ? "Your marketplace request has been rejected."
                    : $"Your request for {request.Listing.Title} has been rejected.",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();

            // Send rejection email to the buyer
            if (request.Buyer != null)
            {
                try
                {
                    string buyerName =
                        WebUtility.HtmlEncode(request.Buyer.FullName);

                    string listingTitle =
                        WebUtility.HtmlEncode(
                            request.Listing?.Title ?? "the listing");

                    await _emailService.SendEmailAsync(
                        request.Buyer.Email,
                        $"Update about your request for {request.Listing?.Title}",
                        $"""
                        <div style="font-family: Arial, sans-serif;
                                    max-width: 600px;
                                    margin: auto;">

                            <h2>Request update</h2>

                            <p>Hello {buyerName},</p>

                            <p>
                                Your request for
                                <strong>{listingTitle}</strong>
                                was not approved by the seller.
                            </p>

                            <p>
                                You can continue exploring other available
                                listings in the marketplace.
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
                        $"Rejection email could not be sent: {ex.Message}");
                }
            }

            return Ok(new
            {
                message = "Request rejected successfully."
            });
        }

        // POST: api/requests
        [HttpPost]
        public async Task<IActionResult> SendRequest(
            CreatePurchaseRequestDto requestDto)
        {
            int buyerId = GetCurrentUserId();

            var listing = await _context.Listings
                .Include(l => l.User)
                .FirstOrDefaultAsync(
                    l => l.ListingId == requestDto.ListingId);

            if (listing == null)
            {
                return BadRequest("Listing not found.");
            }

            if (listing.UserId == buyerId)
            {
                return BadRequest(
                    "You cannot send a request for your own listing.");
            }

            if (listing.Status != ListingStatus.Available)
            {
                return BadRequest(
                    "This listing is no longer available.");
            }

            var buyer = await _context.Users
                .FirstOrDefaultAsync(u => u.UserId == buyerId);

            if (buyer == null)
            {
                return NotFound("Buyer account not found.");
            }

            var seller = listing.User;

            if (seller == null)
            {
                return NotFound("Seller account not found.");
            }

            bool requestAlreadyExists =
                await _context.PurchaseRequests.AnyAsync(r =>
                    r.ListingId == requestDto.ListingId &&
                    r.BuyerId == buyerId &&
                    r.Status == RequestStatus.Pending);

            if (requestAlreadyExists)
            {
                return BadRequest(
                    "You already have a pending request for this listing.");
            }

            var purchaseRequest = new PurchaseRequest
            {
                ListingId = requestDto.ListingId,
                BuyerId = buyerId,
                SellerId = listing.UserId,
                Message = requestDto.Message,
                Status = RequestStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            _context.PurchaseRequests.Add(purchaseRequest);

            _context.Notifications.Add(new Notification
            {
                UserId = seller.UserId,
                Message =
                    $"{buyer.FullName} sent a request for {listing.Title}.",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();

            // Send new-request email to the seller
            try
            {
                string sellerName =
                    WebUtility.HtmlEncode(seller.FullName);

                string buyerName =
                    WebUtility.HtmlEncode(buyer.FullName);

                string listingTitle =
                    WebUtility.HtmlEncode(listing.Title);

                string buyerMessage =
                    WebUtility.HtmlEncode(
                        requestDto.Message ?? "No message was provided.");

                await _emailService.SendEmailAsync(
                    seller.Email,
                    $"New request for {listing.Title}",
                    $"""
                    <div style="font-family: Arial, sans-serif;
                                max-width: 600px;
                                margin: auto;">

                        <h2>You received a new request</h2>

                        <p>Hello {sellerName},</p>

                        <p>
                            <strong>{buyerName}</strong>
                            sent a request for your listing:
                            <strong>{listingTitle}</strong>.
                        </p>

                        <p>
                            <strong>Listing price:</strong>
                            ${listing.Price:F2}
                        </p>

                        <p>
                            <strong>Buyer message:</strong><br />
                            {buyerMessage}
                        </p>

                        <p>
                            Open your marketplace account to approve
                            or reject this request.
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
                    $"New request email could not be sent: {ex.Message}");
            }

            return Ok(new
            {
                message = "Request sent successfully.",
                requestId = purchaseRequest.PurchaseRequestId,
                status = purchaseRequest.Status
            });
        }

        private int GetCurrentUserId()
        {
            string? userIdValue = User
                .FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userIdValue, out int userId))
            {
                throw new UnauthorizedAccessException(
                    "The user token does not contain a valid user ID.");
            }

            return userId;
        }
    }
}