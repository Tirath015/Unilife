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
    public class SellerDashboardController : Controller
    {
        private readonly ApplicationDbContext _context;

        public SellerDashboardController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/SellerDashboard
        [HttpGet]
        public async Task<IActionResult> GetSellerDashboard()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userIdClaim, out var sellerId))
            {
                return Unauthorized("Invalid authentication token.");
            }

            var sellerExists = await _context.Users
                .AnyAsync(u => u.UserId == sellerId && !u.IsBlocked);

            if (!sellerExists)
            {
                return NotFound("Seller account not found.");
            }

            var sellerListings = _context.Listings
                .Where(l => l.UserId == sellerId);

            var listingIds = sellerListings.Select(l => l.ListingId);

            var reviewData = await _context.Reviews
                .Where(r => r.SellerId == sellerId)
                .GroupBy(r => r.SellerId)
                .Select(group => new
                {
                    AverageRating = group.Average(r => r.Rating),
                    TotalReviews = group.Count()
                })
                .FirstOrDefaultAsync();

            var popularListings = await sellerListings
                .Select(listing => new SellerListingSummaryDto
                {
                    ListingId = listing.ListingId,
                    Title = listing.Title,
                    Price = listing.Price,
                    ViewCount = listing.ViewCount,

                    FavoriteCount = _context.Favorites.Count(
                        favorite => favorite.ListingId == listing.ListingId),

                    Status = listing.Status.ToString(),

                    MainImageUrl = listing.Images
                        .Select(image => image.ImageUrl)
                        .FirstOrDefault()
                })
                .OrderByDescending(listing => listing.ViewCount)
                .ThenByDescending(listing => listing.FavoriteCount)
                .Take(5)
                .ToListAsync();

            var dashboard = new SellerDashboardDto
            {
                TotalListings = await sellerListings.CountAsync(),

                ActiveListings = await sellerListings.CountAsync(
                    l => l.Status == ListingStatus.Available && !l.IsHidden),

                SoldListings = await sellerListings.CountAsync(
                    l => l.Status == ListingStatus.Sold),

                RentedListings = await sellerListings.CountAsync(
                    l => l.Status == ListingStatus.Rented),

                HiddenListings = await sellerListings.CountAsync(
                    l => l.IsHidden),

                TotalViews = await sellerListings.SumAsync(
                    l => l.ViewCount),

                TotalFavorites = await _context.Favorites.CountAsync(
                    f => listingIds.Contains(f.ListingId)),

                PendingRequests = await _context.PurchaseRequests.CountAsync(
                    r => r.SellerId == sellerId &&
                         r.Status == RequestStatus.Pending),

                AcceptedRequests = await _context.PurchaseRequests.CountAsync(
                    r => r.SellerId == sellerId &&
                         r.Status == RequestStatus.Approved),

                RejectedRequests = await _context.PurchaseRequests.CountAsync(
                    r => r.SellerId == sellerId &&
                         r.Status == RequestStatus.Rejected),

                TotalMessages = await _context.ChatMessages.CountAsync(
                    m => m.SenderId == sellerId ||
                         m.ReceiverId == sellerId),

                UnreadMessages = await _context.ChatMessages.CountAsync(
                    m => m.ReceiverId == sellerId && !m.IsRead),

                AverageRating = reviewData == null
                    ? 0
                    : Math.Round(reviewData.AverageRating, 1),

                TotalReviews = reviewData?.TotalReviews ?? 0,

                PopularListings = popularListings
            };

            return Ok(dashboard);
        }

    }
}
