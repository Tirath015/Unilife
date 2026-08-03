using Marketplace_capstone_feature_01.Data;
using Marketplace_capstone_feature_01.DTOs;
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
    public class ReviewsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ReviewsController(
            ApplicationDbContext context)
        {
            _context = context;
        }

        // POST: api/Reviews
        [HttpPost]
        public async Task<IActionResult> CreateReview(
            [FromBody] CreateReviewDto request)
        {
            var buyerIdValue = User
                .FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(
                buyerIdValue,
                out int buyerId))
            {
                return Unauthorized(
                    "Invalid user token."
                );
            }

            if (buyerId == request.SellerId)
            {
                return BadRequest(
                    "You cannot review yourself."
                );
            }

            if (request.Rating < 1 ||
                request.Rating > 5)
            {
                return BadRequest(
                    "Rating must be between 1 and 5."
                );
            }

            var sellerExists = await _context.Users
                .AnyAsync(u =>
                    u.UserId == request.SellerId);

            if (!sellerExists)
            {
                return NotFound(
                    "Seller not found."
                );
            }

            var listing = await _context.Listings
                .AsNoTracking()
                .FirstOrDefaultAsync(l =>
                    l.ListingId == request.ListingId);

            if (listing == null)
            {
                return NotFound(
                    "Listing not found."
                );
            }

            if (listing.UserId != request.SellerId)
            {
                return BadRequest(
                    "The selected seller does not own this listing."
                );
            }

            var duplicateReview =
                await _context.Reviews.AnyAsync(r =>
                    r.BuyerId == buyerId &&
                    r.ListingId == request.ListingId);

            if (duplicateReview)
            {
                return BadRequest(
                    "You already reviewed this listing."
                );
            }

            var review = new Review
            {
                BuyerId = buyerId,
                SellerId = request.SellerId,
                ListingId = request.ListingId,
                Rating = request.Rating,
                Comment = string.IsNullOrWhiteSpace(
                    request.Comment)
                    ? null
                    : request.Comment.Trim(),
                CreatedAt = DateTime.UtcNow
            };

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message =
                    "Review submitted successfully.",

                reviewId = review.ReviewId,
                buyerId = review.BuyerId,
                sellerId = review.SellerId,
                listingId = review.ListingId,
                rating = review.Rating,
                comment = review.Comment,
                createdAt = review.CreatedAt
            });
        }

        // GET: api/Reviews/seller/5
        [AllowAnonymous]
        [HttpGet("seller/{sellerId}")]
        public async Task<IActionResult> GetSellerReviews(
            int sellerId)
        {
            var sellerExists = await _context.Users
                .AnyAsync(u => u.UserId == sellerId);

            if (!sellerExists)
            {
                return NotFound(
                    "Seller not found."
                );
            }

            var reviews = await _context.Reviews
                .AsNoTracking()
                .Where(r => r.SellerId == sellerId)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new
                {
                    reviewId = r.ReviewId,
                    buyerId = r.BuyerId,

                    buyerName = r.Buyer != null
                        ? r.Buyer.FullName
                        : "Marketplace User",

                    listingId = r.ListingId,

                    listingTitle = r.Listing != null
                        ? r.Listing.Title
                        : "Marketplace Listing",

                    rating = r.Rating,
                    comment = r.Comment,
                    createdAt = r.CreatedAt
                })
                .ToListAsync();

            return Ok(reviews);
        }

        // GET: api/Reviews/seller/5/summary
        [AllowAnonymous]
        [HttpGet("seller/{sellerId}/summary")]
        public async Task<IActionResult>
            GetSellerReviewSummary(int sellerId)
        {
            var seller = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u =>
                    u.UserId == sellerId);

            if (seller == null)
            {
                return NotFound(
                    "Seller not found."
                );
            }

            var reviewQuery = _context.Reviews
                .AsNoTracking()
                .Where(r =>
                    r.SellerId == sellerId);

            var totalReviews =
                await reviewQuery.CountAsync();

            var averageRating =
                totalReviews == 0
                    ? 0
                    : await reviewQuery.AverageAsync(
                        r => (double)r.Rating
                    );

            var ratingBreakdown = await reviewQuery
                .GroupBy(r => r.Rating)
                .Select(group => new
                {
                    rating = group.Key,
                    count = group.Count()
                })
                .OrderByDescending(item =>
                    item.rating)
                .ToListAsync();

            return Ok(new
            {
                sellerId = seller.UserId,
                sellerName = seller.FullName,

                averageRating =
                    Math.Round(averageRating, 1),

                totalReviews,
                ratingBreakdown
            });
        }

        // GET: api/Reviews/my
        [HttpGet("my")]
        public async Task<IActionResult> GetMyReviews()
        {
            var buyerIdValue = User
                .FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(
                buyerIdValue,
                out int buyerId))
            {
                return Unauthorized(
                    "Invalid user token."
                );
            }

            var reviews = await _context.Reviews
                .AsNoTracking()
                .Where(r => r.BuyerId == buyerId)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new
                {
                    reviewId = r.ReviewId,
                    sellerId = r.SellerId,

                    sellerName = r.Seller != null
                        ? r.Seller.FullName
                        : "Marketplace Seller",

                    listingId = r.ListingId,

                    listingTitle = r.Listing != null
                        ? r.Listing.Title
                        : "Marketplace Listing",

                    rating = r.Rating,
                    comment = r.Comment,
                    createdAt = r.CreatedAt
                })
                .ToListAsync();

            return Ok(reviews);
        }

        // PUT: api/Reviews/5
        [HttpPut("{reviewId}")]
        public async Task<IActionResult> UpdateReview(
            int reviewId,
            [FromBody] UpdateReviewDto request)
        {
            var buyerIdValue = User
                .FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(
                buyerIdValue,
                out int buyerId))
            {
                return Unauthorized(
                    "Invalid user token."
                );
            }

            if (request.Rating < 1 ||
                request.Rating > 5)
            {
                return BadRequest(
                    "Rating must be between 1 and 5."
                );
            }

            var review = await _context.Reviews
                .FirstOrDefaultAsync(r =>
                    r.ReviewId == reviewId);

            if (review == null)
            {
                return NotFound(
                    "Review not found."
                );
            }

            if (review.BuyerId != buyerId)
            {
                return Forbid();
            }

            review.Rating = request.Rating;
            review.Comment =
                string.IsNullOrWhiteSpace(
                    request.Comment)
                    ? null
                    : request.Comment.Trim();

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message =
                    "Review updated successfully.",

                reviewId = review.ReviewId,
                rating = review.Rating,
                comment = review.Comment
            });
        }

        // DELETE: api/Reviews/5
        [HttpDelete("{reviewId}")]
        public async Task<IActionResult> DeleteReview(
            int reviewId)
        {
            var buyerIdValue = User
                .FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(
                buyerIdValue,
                out int buyerId))
            {
                return Unauthorized(
                    "Invalid user token."
                );
            }

            var review = await _context.Reviews
                .FirstOrDefaultAsync(r =>
                    r.ReviewId == reviewId);

            if (review == null)
            {
                return NotFound(
                    "Review not found."
                );
            }

            if (review.BuyerId != buyerId)
            {
                return Forbid();
            }

            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message =
                    "Review deleted successfully.",
                reviewId
            });
        }
    }
}