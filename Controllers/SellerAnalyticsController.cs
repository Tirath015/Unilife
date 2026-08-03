using Marketplace_capstone_feature_01.Data;
using Marketplace_capstone_feature_01.DTOs;
using Marketplace_capstone_feature_01.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using System.Security.Claims;

namespace Marketplace_capstone_feature_01.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SellerAnalyticsController : Controller
    {

        private readonly ApplicationDbContext _context;

        public SellerAnalyticsController(ApplicationDbContext context)
        {
            _context = context;
        }

        private bool TryGetSellerId(out int sellerId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            return int.TryParse(userIdClaim, out sellerId);
        }

        // GET: api/SellerAnalytics/overview
        [HttpGet("overview")]
        public async Task<IActionResult> GetOverview()
        {
            if (!TryGetSellerId(out var sellerId))
            {
                return Unauthorized("Invalid authentication token.");
            }

            var listingIds = _context.Listings
                .Where(l => l.UserId == sellerId)
                .Select(l => l.ListingId);

            var totalListings = await listingIds.CountAsync();

            var totalViews = await _context.Listings
                .Where(l => l.UserId == sellerId)
                .SumAsync(l => l.ViewCount);

            var totalFavorites = await _context.Favorites
                .CountAsync(f => listingIds.Contains(f.ListingId));

            var totalMessages = await _context.ChatMessages
                .CountAsync(m =>
                    listingIds.Contains(m.ListingId) &&
                    (m.SenderId == sellerId || m.ReceiverId == sellerId));

            var totalRequests = await _context.PurchaseRequests
                .CountAsync(r => r.SellerId == sellerId);

            var pendingRequests = await _context.PurchaseRequests
                .CountAsync(r =>
                    r.SellerId == sellerId &&
                    r.Status == RequestStatus.Pending);

            var approvedRequests = await _context.PurchaseRequests
                .CountAsync(r =>
                    r.SellerId == sellerId &&
                    r.Status == RequestStatus.Approved);

            var rejectedRequests = await _context.PurchaseRequests
                .CountAsync(r =>
                    r.SellerId == sellerId &&
                    r.Status == RequestStatus.Rejected);

            var reviewData = await _context.Reviews
                .Where(r => r.SellerId == sellerId)
                .GroupBy(r => r.SellerId)
                .Select(group => new
                {
                    AverageRating = group.Average(r => r.Rating),
                    TotalReviews = group.Count()
                })
                .FirstOrDefaultAsync();

            var conversionRate = totalViews == 0
                ? 0
                : approvedRequests * 100.0 / totalViews;

            var analytics = new SellerAnalyticsOverviewDto
            {
                TotalListings = totalListings,
                TotalViews = totalViews,
                TotalFavorites = totalFavorites,
                TotalMessages = totalMessages,
                TotalRequests = totalRequests,
                PendingRequests = pendingRequests,
                ApprovedRequests = approvedRequests,
                RejectedRequests = rejectedRequests,
                AverageRating = reviewData == null
                    ? 0
                    : Math.Round(reviewData.AverageRating, 1),
                TotalReviews = reviewData?.TotalReviews ?? 0,
                OverallConversionRate = Math.Round(conversionRate, 2)
            };

            return Ok(analytics);
        }

        // GET: api/SellerAnalytics/listings
        [HttpGet("listings")]
        public async Task<IActionResult> GetListingAnalytics()
        {
            if (!TryGetSellerId(out var sellerId))
            {
                return Unauthorized("Invalid authentication token.");
            }

            var listings = await _context.Listings
                .Where(l => l.UserId == sellerId)
                .Select(l => new ListingAnalyticsDto
                {
                    ListingId = l.ListingId,
                    Title = l.Title,
                    Price = l.Price,
                    Status = l.Status.ToString(),
                    Views = l.ViewCount,

                    Favorites = _context.Favorites.Count(
                        f => f.ListingId == l.ListingId),

                    Messages = _context.ChatMessages.Count(
                        m => m.ListingId == l.ListingId),

                    Requests = _context.PurchaseRequests.Count(
                        r => r.ListingId == l.ListingId),

                    ApprovedRequests = _context.PurchaseRequests.Count(
                        r =>
                            r.ListingId == l.ListingId &&
                            r.Status == RequestStatus.Approved),

                    MainImageUrl = l.Images
                        .Select(i => i.ImageUrl)
                        .FirstOrDefault()
                })
                .OrderByDescending(l => l.Views)
                .ToListAsync();

            foreach (var listing in listings)
            {
                listing.ConversionRate = listing.Views == 0
                    ? 0
                    : Math.Round(
                        listing.ApprovedRequests * 100.0 / listing.Views,
                        2);
            }

            return Ok(listings);
        }

        // GET: api/SellerAnalytics/best-performing
        [HttpGet("best-performing")]
        public async Task<IActionResult> GetBestPerformingListing()
        {
            if (!TryGetSellerId(out var sellerId))
            {
                return Unauthorized("Invalid authentication token.");
            }

            var listing = await _context.Listings
                .Where(l => l.UserId == sellerId)
                .Select(l => new ListingAnalyticsDto
                {
                    ListingId = l.ListingId,
                    Title = l.Title,
                    Price = l.Price,
                    Status = l.Status.ToString(),
                    Views = l.ViewCount,

                    Favorites = _context.Favorites.Count(
                        f => f.ListingId == l.ListingId),

                    Messages = _context.ChatMessages.Count(
                        m => m.ListingId == l.ListingId),

                    Requests = _context.PurchaseRequests.Count(
                        r => r.ListingId == l.ListingId),

                    ApprovedRequests = _context.PurchaseRequests.Count(
                        r =>
                            r.ListingId == l.ListingId &&
                            r.Status == RequestStatus.Approved),

                    MainImageUrl = l.Images
                        .Select(i => i.ImageUrl)
                        .FirstOrDefault()
                })
                .OrderByDescending(l => l.Views)
                .ThenByDescending(l => l.Favorites)
                .ThenByDescending(l => l.Requests)
                .FirstOrDefaultAsync();

            if (listing == null)
            {
                return NotFound("You do not have any listings.");
            }

            listing.ConversionRate = listing.Views == 0
                ? 0
                : Math.Round(
                    listing.ApprovedRequests * 100.0 / listing.Views,
                    2);

            return Ok(listing);
        }

        // GET: api/SellerAnalytics/monthly-summary
        [HttpGet("monthly-summary")]
        public async Task<IActionResult> GetMonthlySummary()
        {
            if (!TryGetSellerId(out var sellerId))
            {
                return Unauthorized("Invalid authentication token.");
            }

            var startOfMonth = new DateTime(
                DateTime.UtcNow.Year,
                DateTime.UtcNow.Month,
                1,
                0,
                0,
                0,
                DateTimeKind.Utc);

            var sellerListingIds = _context.Listings
                .Where(l => l.UserId == sellerId)
                .Select(l => l.ListingId);

            var summary = new MonthlySellerSummaryDto
            {
                ListingsCreatedThisMonth =
                    await _context.Listings.CountAsync(l =>
                        l.UserId == sellerId &&
                        l.CreatedAt >= startOfMonth),

                SoldThisMonth =
                    await _context.Listings.CountAsync(l =>
                        l.UserId == sellerId &&
                        l.Status == ListingStatus.Sold &&
                        l.CreatedAt >= startOfMonth),

                RentedThisMonth =
                    await _context.Listings.CountAsync(l =>
                        l.UserId == sellerId &&
                        l.Status == ListingStatus.Rented &&
                        l.CreatedAt >= startOfMonth),

                RequestsThisMonth =
                    await _context.PurchaseRequests.CountAsync(r =>
                        r.SellerId == sellerId &&
                        r.CreatedAt >= startOfMonth),

                ReviewsThisMonth =
                    await _context.Reviews.CountAsync(r =>
                        r.SellerId == sellerId &&
                        r.CreatedAt >= startOfMonth),

                MessagesThisMonth =
                    await _context.ChatMessages.CountAsync(m =>
                        sellerListingIds.Contains(m.ListingId) &&
                        m.SentAt >= startOfMonth)
            };

            return Ok(summary);
        }

    }
}
