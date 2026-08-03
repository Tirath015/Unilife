using Marketplace_capstone_feature_01.Data;
using Marketplace_capstone_feature_01.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Marketplace_capstone_feature_01.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UserController : Controller
    {

        // object of the context class 

        private readonly ApplicationDbContext _context;

        public UserController(ApplicationDbContext context)
        {
            _context = context;

        }


        // GET: api/user/profile


        [HttpGet("profile")]
        public async Task<IActionResult> GetMyProfile()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var user = await _context.Users.FindAsync(userId);

            if (user == null)
                return NotFound("User not found.");

            return Ok(user);
        }


        // PUT: api/user/profile

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateMyProfile(UpdateProfileDto request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var user = await _context.Users.FindAsync(userId);

            if (user == null)
                return NotFound("User not found.");

            user.FullName = request.FullName;
            user.PhoneNumber = request.PhoneNumber;
            user.Bio = request.Bio;
            user.City = request.City;
            user.Province = request.Province;
            user.Country = request.Country;
            user.PreferredContactMethod = request.PreferredContactMethod;

            await _context.SaveChangesAsync();

            return Ok(user);
        }


        // Seller Ratings 



        [HttpGet("{sellerId}/rating-summary")]
        public async Task<IActionResult> GetSellerRatingSummary(int sellerId)
        {
            var sellerExists = await _context.Users.AnyAsync(u => u.UserId == sellerId);

            if (!sellerExists)
                return NotFound("Seller not found.");

            var reviews = await _context.Reviews
                .Where(r => r.SellerId == sellerId)
                .ToListAsync();

            var averageRating = reviews.Any()
                ? reviews.Average(r => r.Rating)
                : 0;

            return Ok(new
            {
                SellerId = sellerId,
                AverageRating = Math.Round(averageRating, 1),
                TotalReviews = reviews.Count
            });
        }

        // GET: api/Users/{sellerId}/marketplace-profile
        [AllowAnonymous]
        [HttpGet("{sellerId}/marketplace-profile")]
        public async Task<IActionResult> GetMarketplaceSellerProfile(int sellerId)
        {
            var seller = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserId == sellerId);

            if (seller == null)
            {
                return NotFound("Seller not found.");
            }

            var listings = await _context.Listings
                .AsNoTracking()
                .Include(l => l.Category)
                .Include(l => l.Images)
                .Where(l => l.UserId == sellerId)
                .OrderByDescending(l => l.CreatedAt)
                .Select(l => new
                {
                    listingId = l.ListingId,
                    title = l.Title,
                    description = l.Description,
                    price = l.Price,
                    location = l.Location,
                    status = l.Status,
                    createdAt = l.CreatedAt,
                    viewCount = l.ViewCount,
                    categoryId = l.CategoryId,
                    categoryName = l.Category != null
                        ? l.Category.Name
                        : "Marketplace",
                    imageUrl = l.Images
                        .OrderBy(i => i.ListingImageId)
                        .Select(i => i.ImageUrl)
                        .FirstOrDefault()
                        ?? l.ImageUrl
                })
                .ToListAsync();

            var reviewQuery = _context.Reviews
                .AsNoTracking()
                .Where(r => r.SellerId == sellerId);

            var totalReviews = await reviewQuery.CountAsync();

            var averageRating = totalReviews == 0
                ? 0
                : await reviewQuery.AverageAsync(r => (double)r.Rating);

            var reviews = await reviewQuery
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new
                {
                    reviewId = r.ReviewId,
                    rating = r.Rating,
                    comment = r.Comment,
                    createdAt = r.CreatedAt,
                    buyerId = r.BuyerId,
                    buyerName = r.Buyer != null
                        ? r.Buyer.FullName
                        : "Marketplace User",
                    listingId = r.ListingId,
                    listingTitle = r.Listing != null
                        ? r.Listing.Title
                        : "Marketplace Listing"
                })
                .ToListAsync();

            return Ok(new
            {
                seller = new
                {
                    userId = seller.UserId,
                    fullName = seller.FullName,
                    email = seller.Email,
                    bio = seller.Bio,
                    city = seller.City,
                    province = seller.Province,
                    country = seller.Country,
                    profileImageUrl = seller.ProfileImageUrl,
                    preferredContactMethod = seller.PreferredContactMethod,
                    createdAt = seller.CreatedAt
                },

                rating = new
                {
                    averageRating = Math.Round(averageRating, 1),
                    totalReviews
                },

                statistics = new
                {
                    totalListings = listings.Count,
                    activeListings = listings.Count(l => (int)l.status == 1),
                    soldListings = listings.Count(l => (int)l.status == 2),
                    rentedListings = listings.Count(l => (int)l.status == 3)
                },
                listings,
                reviews
            });
        }

        // Seller profile 
        [HttpGet("{sellerId}/public-profile")]
        public async Task<IActionResult> GetSellerPublicProfile(int sellerId)
        {
            var seller = await _context.Users
                .FirstOrDefaultAsync(u => u.UserId == sellerId);

            if (seller == null)
                return NotFound("Seller not found.");

            var reviews = await _context.Reviews
                .Where(r => r.SellerId == sellerId)
                .ToListAsync();

            var averageRating = reviews.Any()
                ? reviews.Average(r => r.Rating)
                : 0;

            var activeListings = await _context.Listings
                .Include(l => l.Images)
                .Include(l => l.Category)
                .Where(l => l.UserId == sellerId && !l.IsHidden)
                .OrderByDescending(l => l.CreatedAt)
                .ToListAsync();

            return Ok(new
            {
                seller.UserId,
                seller.FullName,
                seller.Bio,
                seller.City,
                seller.Province,
                seller.Country,
                seller.ProfileImageUrl,
                seller.PreferredContactMethod,
                seller.CreatedAt,
                AverageRating = Math.Round(averageRating, 1),
                TotalReviews = reviews.Count,
                ActiveListings = activeListings
            });
        }

        // POST: api/user/profile-image



        [HttpPost("profile-image")]
        public async Task<IActionResult> UploadProfileImage(IFormFile image)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var user = await _context.Users.FindAsync(userId);

            if (user == null)
                return NotFound("User not found.");

            if (image == null || image.Length == 0)
                return BadRequest("No image file provided.");

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            var extension = Path.GetExtension(image.FileName).ToLower();

            if (!allowedExtensions.Contains(extension))
                return BadRequest("Only .jpg, .jpeg, .png, and .webp files are allowed.");

            if (image.Length > 5 * 1024 * 1024)
                return BadRequest("Image must be less than 5 MB.");

            var uploadsFolder = Path.Combine(
                Directory.GetCurrentDirectory(),
                "wwwroot",
                "profile-images"
            );

            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var uniqueFileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await image.CopyToAsync(stream);
            }

            user.ProfileImageUrl = $"/profile-images/{uniqueFileName}";

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Profile image uploaded successfully.",
                profileImageUrl = user.ProfileImageUrl
            });
        }


    }
}
