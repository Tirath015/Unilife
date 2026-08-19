using Marketplace_capstone_feature_01.Data;
using Marketplace_capstone_feature_01.Enums;
using Marketplace_capstone_feature_01.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Marketplace_capstone_feature_01.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class MarketplaceTransactionsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public MarketplaceTransactionsController(
            ApplicationDbContext context)
        {
            _context = context;
        }

        private bool TryGetCurrentUserId(out int userId)
        {
            var value = User.FindFirst(
                ClaimTypes.NameIdentifier
            )?.Value;

            return int.TryParse(value, out userId);
        }

        // POST: api/MarketplaceTransactions/listing/5/interested
        [HttpPost("listing/{listingId}/interested")]
        public async Task<IActionResult> ExpressInterest(
            int listingId)
        {
            if (!TryGetCurrentUserId(out int buyerId))
            {
                return Unauthorized("Invalid user token.");
            }

            var listing = await _context.Listings
                .FirstOrDefaultAsync(l =>
                    l.ListingId == listingId);

            if (listing == null)
            {
                return NotFound("Listing not found.");
            }

            if (listing.UserId == buyerId)
            {
                return BadRequest(
                    "You cannot express interest in your own listing."
                );
            }

            if ((int)listing.Status != 1)
            {
                return BadRequest(
                    "This listing is not currently available."
                );
            }

            var existingTransaction =
                await _context.MarketplaceTransactions
                    .FirstOrDefaultAsync(t =>
                        t.ListingId == listingId &&
                        t.BuyerId == buyerId);

            if (existingTransaction != null)
            {
                return BadRequest(
                    "You already expressed interest in this listing."
                );
            }

            var transaction =
                new MarketplaceTransaction
                {
                    ListingId = listingId,
                    BuyerId = buyerId,
                    SellerId = listing.UserId,
                    Status =
                        TransactionStatus.Interested,
                    CreatedAt = DateTime.UtcNow
                };

            _context.MarketplaceTransactions.Add(
                transaction
            );

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message =
                    "Interest submitted successfully.",
                transactionId =
                    transaction.TransactionId,
                status = transaction.Status
            });
        }

        // GET: api/MarketplaceTransactions/listing/5/interested-buyers
        [HttpGet("listing/{listingId}/interested-buyers")]
        public async Task<IActionResult> GetInterestedBuyers(
            int listingId)
        {
            if (!TryGetCurrentUserId(out int sellerId))
            {
                return Unauthorized("Invalid user token.");
            }

            var listing = await _context.Listings
                .AsNoTracking()
                .FirstOrDefaultAsync(l =>
                    l.ListingId == listingId);

            if (listing == null)
            {
                return NotFound("Listing not found.");
            }

            if (listing.UserId != sellerId)
            {
                return Forbid();
            }

            var buyers =
                await _context.MarketplaceTransactions
                    .AsNoTracking()
                    .Where(t =>
                        t.ListingId == listingId)
                    .OrderByDescending(t =>
                        t.CreatedAt)
                    .Select(t => new
                    {
                        transactionId =
                            t.TransactionId,
                        buyerId = t.BuyerId,
                        buyerName =
                            t.Buyer != null
                                ? t.Buyer.FullName
                                : "Marketplace User",
                        buyerEmail =
                            t.Buyer != null
                                ? t.Buyer.Email
                                : null,
                        status = t.Status,
                        createdAt = t.CreatedAt
                    })
                    .ToListAsync();

            return Ok(buyers);
        }

        // PATCH: api/MarketplaceTransactions/7/accept
        [HttpPatch("{transactionId}/accept")]
        public async Task<IActionResult> AcceptBuyer(
            int transactionId)
        {
            if (!TryGetCurrentUserId(out int sellerId))
            {
                return Unauthorized("Invalid user token.");
            }

            var transaction =
                await _context.MarketplaceTransactions
                    .Include(t => t.Listing)
                    .FirstOrDefaultAsync(t =>
                        t.TransactionId ==
                        transactionId);

            if (transaction == null)
            {
                return NotFound(
                    "Transaction request not found."
                );
            }

            if (transaction.SellerId != sellerId)
            {
                return Forbid();
            }

            if (transaction.Status !=
                TransactionStatus.Interested)
            {
                return BadRequest(
                    "This request cannot be accepted."
                );
            }

            if (transaction.Listing == null)
            {
                return NotFound("Listing not found.");
            }

            transaction.Status =
                TransactionStatus.Accepted;

            transaction.AcceptedAt =
                DateTime.UtcNow;

            var otherRequests =
                await _context.MarketplaceTransactions
                    .Where(t =>
                        t.ListingId ==
                            transaction.ListingId &&
                        t.TransactionId !=
                            transaction.TransactionId &&
                        t.Status ==
                            TransactionStatus.Interested)
                    .ToListAsync();

            foreach (var request in otherRequests)
            {
                request.Status =
                    TransactionStatus.Rejected;
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message =
                    "Buyer accepted successfully.",
                transactionId,
                status = transaction.Status
            });
        }

        // PATCH: api/MarketplaceTransactions/7/seller-complete
        [HttpPatch("{transactionId}/seller-complete")]
        public async Task<IActionResult>
            SellerMarksComplete(int transactionId)
        {
            if (!TryGetCurrentUserId(out int sellerId))
            {
                return Unauthorized("Invalid user token.");
            }

            var transaction =
                await _context.MarketplaceTransactions
                    .Include(t => t.Listing)
                    .FirstOrDefaultAsync(t =>
                        t.TransactionId ==
                        transactionId);

            if (transaction == null)
            {
                return NotFound(
                    "Transaction not found."
                );
            }

            if (transaction.SellerId != sellerId)
            {
                return Forbid();
            }

            if (transaction.Status !=
                TransactionStatus.Accepted)
            {
                return BadRequest(
                    "Only accepted transactions can be completed."
                );
            }

            transaction.Status =
                TransactionStatus.SellerCompleted;

            transaction.SellerCompletedAt =
                DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message =
                    "Transaction marked complete by seller.",
                transactionId,
                status = transaction.Status
            });
        }

        // PATCH: api/MarketplaceTransactions/7/buyer-confirm
        [HttpPatch("{transactionId}/buyer-confirm")]
        public async Task<IActionResult>
            BuyerConfirmsTransaction(int transactionId)
        {
            if (!TryGetCurrentUserId(out int buyerId))
            {
                return Unauthorized("Invalid user token.");
            }

            var transaction =
                await _context.MarketplaceTransactions
                    .Include(t => t.Listing)
                    .FirstOrDefaultAsync(t =>
                        t.TransactionId ==
                        transactionId);

            if (transaction == null)
            {
                return NotFound(
                    "Transaction not found."
                );
            }

            if (transaction.BuyerId != buyerId)
            {
                return Forbid();
            }

            if (transaction.Status !=
                TransactionStatus.SellerCompleted)
            {
                return BadRequest(
                    "The seller must mark this transaction complete first."
                );
            }

            transaction.Status =
                TransactionStatus.Completed;

            transaction.BuyerConfirmedAt =
                DateTime.UtcNow;

            if (transaction.Listing != null)
            {
                transaction.Listing.Status =
                    ListingStatus.Sold;
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message =
                    "Transaction completed successfully.",
                transactionId,
                status = transaction.Status
            });
        }

        // PATCH: api/MarketplaceTransactions/7/cancel
        [HttpPatch("{transactionId}/cancel")]
        public async Task<IActionResult> CancelTransaction(
            int transactionId)
        {
            if (!TryGetCurrentUserId(out int currentUserId))
            {
                return Unauthorized("Invalid user token.");
            }

            var transaction =
                await _context.MarketplaceTransactions
                    .FirstOrDefaultAsync(t =>
                        t.TransactionId ==
                        transactionId);

            if (transaction == null)
            {
                return NotFound(
                    "Transaction not found."
                );
            }

            if (
                transaction.BuyerId != currentUserId &&
                transaction.SellerId != currentUserId
            )
            {
                return Forbid();
            }

            if (
                transaction.Status ==
                    TransactionStatus.Completed ||
                transaction.Status ==
                    TransactionStatus.Cancelled
            )
            {
                return BadRequest(
                    "This transaction cannot be cancelled."
                );
            }

            transaction.Status =
                TransactionStatus.Cancelled;

            transaction.CancelledAt =
                DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message =
                    "Transaction cancelled successfully.",
                transactionId,
                status = transaction.Status
            });
        }

        // GET: api/MarketplaceTransactions/my
        [HttpGet("my")]
        public async Task<IActionResult>
            GetMyTransactions()
        {
            if (!TryGetCurrentUserId(out int userId))
            {
                return Unauthorized("Invalid user token.");
            }

            var transactions =
                await _context.MarketplaceTransactions
                    .AsNoTracking()
                    .Where(t =>
                        t.BuyerId == userId ||
                        t.SellerId == userId)
                    .OrderByDescending(t =>
                        t.CreatedAt)
                    .Select(t => new
                    {
                        transactionId =
                            t.TransactionId,
                        listingId = t.ListingId,
                        listingTitle =
                            t.Listing != null
                                ? t.Listing.Title
                                : "Marketplace Listing",
                        buyerId = t.BuyerId,
                        buyerName =
                            t.Buyer != null
                                ? t.Buyer.FullName
                                : "Marketplace Buyer",
                        sellerId = t.SellerId,
                        sellerName =
                            t.Seller != null
                                ? t.Seller.FullName
                                : "Marketplace Seller",
                        status = t.Status,
                        createdAt = t.CreatedAt,
                        acceptedAt = t.AcceptedAt,
                        sellerCompletedAt =
                            t.SellerCompletedAt,
                        buyerConfirmedAt =
                            t.BuyerConfirmedAt,
                        role =
                            t.BuyerId == userId
                                ? "Buyer"
                                : "Seller"
                    })
                    .ToListAsync();

            return Ok(transactions);
        }
    }
}