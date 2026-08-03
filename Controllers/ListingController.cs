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
    public class ListingController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;

        public ListingController(
            ApplicationDbContext context,
            IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        // GET: api/Listing
        [HttpGet]
        public async Task<IActionResult> GetListings()
        {
            var listings = await _context.Listings
                .Include(l => l.Category)
                .Include(l => l.User)
                .Include(l => l.Images)
                .Where(l => !l.IsHidden)
                .ToListAsync();

            return Ok(listings);
        }

        // GET: api/Listing/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetListing(int id)
        {
            var listing = await _context.Listings
                .Include(l => l.Category)
                .Include(l => l.User)
                .Include(l => l.Images)
                .FirstOrDefaultAsync(l => l.ListingId == id);

            if (listing == null)
            {
                return NotFound("Listing not found.");
            }

            listing.ViewCount++;

            if (User.Identity != null &&
                User.Identity.IsAuthenticated)
            {
                var userIdValue = User
                    .FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (int.TryParse(userIdValue, out int userId))
                {
                    var existingView =
                        await _context.RecentlyViewedListings
                            .FirstOrDefaultAsync(r =>
                                r.UserId == userId &&
                                r.ListingId == id);

                    if (existingView == null)
                    {
                        var recentlyViewed =
                            new RecentlyViewedListing
                            {
                                UserId = userId,
                                ListingId = id,
                                ViewedAt = DateTime.UtcNow
                            };

                        _context.RecentlyViewedListings.Add(
                            recentlyViewed);
                    }
                    else
                    {
                        existingView.ViewedAt = DateTime.UtcNow;
                    }
                }
            }

            await _context.SaveChangesAsync();

            return Ok(listing);
        }

        // GET: api/Listing/recently-viewed
        [HttpGet("recently-viewed")]
        public async Task<IActionResult> GetRecentlyViewed()
        {
            if (User.Identity == null ||
                !User.Identity.IsAuthenticated)
            {
                return Unauthorized(
                    "Please login to view recently viewed listings.");
            }

            var userIdValue = User
                .FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userIdValue, out int userId))
            {
                return Unauthorized("Invalid user token.");
            }

            var recentListings =
                await _context.RecentlyViewedListings
                    .Include(r => r.Listing)
                    .ThenInclude(l => l!.Category)
                    .Include(r => r.Listing)
                    .ThenInclude(l => l!.Images)
                    .Where(r => r.UserId == userId)
                    .OrderByDescending(r => r.ViewedAt)
                    .Take(20)
                    .ToListAsync();

            return Ok(recentListings);
        }

        // GET: api/Listing/search
        [HttpGet("search")]
        public async Task<IActionResult> SearchListings(
            string? keyword,
            int? categoryId,
            decimal? minPrice,
            decimal? maxPrice,
            ListingType? listingType,
            string? location,
            int pageNumber = 1,
            int pageSize = 10)
        {
            if (pageNumber < 1)
            {
                pageNumber = 1;
            }

            if (pageSize < 1)
            {
                pageSize = 10;
            }

            var query = _context.Listings
                .Include(l => l.Category)
                .Include(l => l.User)
                .Include(l => l.Images)
                .Where(l => !l.IsHidden)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(location))
            {
                var normalizedLocation =
                    location.Trim().ToLower();

                query = query.Where(l =>
                    l.Location.ToLower()
                        .Contains(normalizedLocation));
            }

            if (!string.IsNullOrWhiteSpace(keyword))
            {
                var normalizedKeyword =
                    keyword.Trim().ToLower();

                query = query.Where(l =>
                    l.Title.ToLower()
                        .Contains(normalizedKeyword) ||
                    l.Description.ToLower()
                        .Contains(normalizedKeyword));
            }

            if (categoryId.HasValue)
            {
                query = query.Where(l =>
                    l.CategoryId == categoryId.Value);
            }

            if (minPrice.HasValue)
            {
                query = query.Where(l =>
                    l.Price >= minPrice.Value);
            }

            if (maxPrice.HasValue)
            {
                query = query.Where(l =>
                    l.Price <= maxPrice.Value);
            }

            if (listingType.HasValue)
            {
                query = query.Where(l =>
                    l.ListingType == listingType.Value);
            }

            var totalItems = await query.CountAsync();

            var listings = await query
                .OrderByDescending(l => l.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new
            {
                totalItems,
                pageNumber,
                pageSize,
                totalPages = (int)Math.Ceiling(
                    totalItems / (double)pageSize),
                data = listings
            });
        }

        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> CreateListing(
     [FromForm] CreateListingDto request)
        {
            var userExists = await _context.Users
                .AnyAsync(u => u.UserId == request.UserId);

            if (!userExists)
            {
                return BadRequest("User not found.");
            }

            var categoryExists = await _context.Categories
                .AnyAsync(c => c.CategoryId == request.CategoryId);

            if (!categoryExists)
            {
                return BadRequest("Category not found.");
            }

            if (request.Price < 0)
            {
                return BadRequest("Price cannot be negative.");
            }

            var listing = new Listing
            {
                Title = request.Title,
                Description = request.Description,
                Price = request.Price,
                Location = request.Location,
                ListingType = request.ListingType,
                CategoryId = request.CategoryId,
                UserId = request.UserId,
                Status = ListingStatus.Available,
                Latitude = request.Latitude,
                Longitude = request.Longitude,
                CreatedAt = DateTime.UtcNow
            };

            _context.Listings.Add(listing);

            // Save first so ListingId is generated
            await _context.SaveChangesAsync();

            if (request.Image != null && request.Image.Length > 0)
            {
                var allowedExtensions = new[]
                {
            ".jpg",
            ".jpeg",
            ".png",
            ".webp"
        };

                var extension = Path
                    .GetExtension(request.Image.FileName)
                    .ToLowerInvariant();

                if (!allowedExtensions.Contains(extension))
                {
                    return BadRequest(
                        "Only JPG, JPEG, PNG and WEBP images are allowed.");
                }

                const long maxFileSize = 5 * 1024 * 1024;

                if (request.Image.Length > maxFileSize)
                {
                    return BadRequest(
                        "Image size cannot be greater than 5 MB.");
                }

                var uploadFolder = Path.Combine(
                    Directory.GetCurrentDirectory(),
                    "wwwroot",
                    "uploads",
                    "listings"
                );

                Directory.CreateDirectory(uploadFolder);

                var fileName = $"{Guid.NewGuid()}{extension}";

                var fullFilePath = Path.Combine(
                    uploadFolder,
                    fileName
                );

                await using var stream = new FileStream(
                    fullFilePath,
                    FileMode.Create
                );

                await request.Image.CopyToAsync(stream);

                var imageUrl =
                    $"/uploads/listings/{fileName}";

                var listingImage = new ListingImage
                {
                    ListingId = listing.ListingId,
                    ImageUrl = imageUrl
                };

                _context.ListingImages.Add(listingImage);

                await _context.SaveChangesAsync();
            }

            // Keep your saved-search notification section here
            var matchingSearches =
                await _context.SavedSearches
                    .Where(s =>
                        (
                            string.IsNullOrEmpty(s.Keyword) ||
                            listing.Title.ToLower().Contains(
                                s.Keyword.ToLower()) ||
                            listing.Description.ToLower().Contains(
                                s.Keyword.ToLower())
                        ) &&
                        (
                            !s.CategoryId.HasValue ||
                            s.CategoryId == listing.CategoryId
                        ) &&
                        (
                            !s.MinPrice.HasValue ||
                            listing.Price >= s.MinPrice.Value
                        ) &&
                        (
                            !s.MaxPrice.HasValue ||
                            listing.Price <= s.MaxPrice.Value
                        ) &&
                        (
                            string.IsNullOrEmpty(s.Location) ||
                            listing.Location.ToLower().Contains(
                                s.Location.ToLower())
                        ) &&
                        s.UserId != listing.UserId)
                    .ToListAsync();

            foreach (var savedSearch in matchingSearches)
            {
                _context.Notifications.Add(
                    new Notification
                    {
                        UserId = savedSearch.UserId,
                        Message =
                            $"New listing matches your saved search: " +
                            $"{listing.Title}",
                        IsRead = false,
                        CreatedAt = DateTime.UtcNow
                    });
            }

            await _context.SaveChangesAsync();

            var createdListing = await _context.Listings
                .Include(l => l.Category)
                .Include(l => l.User)
                .Include(l => l.Images)
                .FirstAsync(l =>
                    l.ListingId == listing.ListingId);

            return Ok(createdListing);



        }


        // to update the listing like sold available 
        [Authorize]
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateListingStatus(
        int id,
    [FromBody] UpdateListingStatusDto dto)
        {
            var userIdClaim = User.FindFirst(
                System.Security.Claims.ClaimTypes.NameIdentifier
            );

            if (userIdClaim == null)
            {
                return Unauthorized(new
                {
                    message = "User ID was not found."
                });
            }

            if (!int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized(new
                {
                    message = "Invalid user ID."
                });
            }

            var listing = await _context.Listings
                .FirstOrDefaultAsync(l => l.ListingId == id);

            if (listing == null)
            {
                return NotFound(new
                {
                    message = "Listing not found."
                });
            }

            if (listing.UserId != userId)
            {
                return Forbid();
            }

            if (!Enum.IsDefined(typeof(ListingStatus), dto.Status))
            {
                return BadRequest(new
                {
                    message = "Invalid listing status."
                });
            }

            listing.Status = dto.Status;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Listing status updated successfully.",
                listingId = listing.ListingId,
                status = listing.Status,
                statusName = listing.Status.ToString()
            });
        }
        // PUT: api/Listing/{id}
        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateListing(
            int id,
            [FromBody] UpdateListingDto request)
        {
            var userIdValue = User
                .FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userIdValue, out int userId))
            {
                return Unauthorized("Invalid user token.");
            }

            var listing = await _context.Listings
                .FirstOrDefaultAsync(l => l.ListingId == id);

            if (listing == null)
            {
                return NotFound("Listing not found.");
            }

            // Only the listing owner can edit it
            if (listing.UserId != userId)
            {
                return Forbid();
            }

            var categoryExists = await _context.Categories
                .AnyAsync(c => c.CategoryId == request.CategoryId);

            if (!categoryExists)
            {
                return BadRequest("Category not found.");
            }

            if (request.Price <= 0)
            {
                return BadRequest(
                    "Listing price must be greater than zero."
                );
            }

            decimal oldPrice = listing.Price;

            listing.Title = request.Title.Trim();
            listing.Description = request.Description.Trim();
            listing.Price = request.Price;
            listing.Location = request.Location.Trim();
            listing.ListingType = request.ListingType;
            listing.CategoryId = request.CategoryId;
            listing.Latitude = request.Latitude;
            listing.Longitude = request.Longitude;

            bool priceDropped = request.Price < oldPrice;

            var usersToEmail = new List<User>();

            if (priceDropped)
            {
                var favoriteUserIds = await _context.Favorites
                    .Where(f => f.ListingId == listing.ListingId)
                    .Select(f => f.UserId)
                    .Distinct()
                    .ToListAsync();

                usersToEmail = await _context.Users
                    .Where(u => favoriteUserIds.Contains(u.UserId))
                    .ToListAsync();

                foreach (var user in usersToEmail)
                {
                    _context.Notifications.Add(
                        new Notification
                        {
                            UserId = user.UserId,
                            Message =
                                $"Price dropped! '{listing.Title}' is now " +
                                $"${request.Price:F2} " +
                                $"(was ${oldPrice:F2}).",
                            IsRead = false,
                            CreatedAt = DateTime.UtcNow
                        }
                    );
                }
            }

            await _context.SaveChangesAsync();

            if (priceDropped)
            {
                foreach (var user in usersToEmail)
                {
                    if (string.IsNullOrWhiteSpace(user.Email))
                    {
                        continue;
                    }

                    try
                    {
                        string userName =
                            WebUtility.HtmlEncode(user.FullName);

                        string listingTitle =
                            WebUtility.HtmlEncode(listing.Title);

                        await _emailService.SendEmailAsync(
                            user.Email,
                            $"Price drop: {listing.Title}",
                            $"""
                    <div style="
                        font-family: Arial, sans-serif;
                        max-width: 600px;
                        margin: auto;">

                        <h2>Price drop alert</h2>

                        <p>Hello {userName},</p>

                        <p>
                            A listing you saved has dropped in price.
                        </p>

                        <p>
                            <strong>Listing:</strong>
                            {listingTitle}
                        </p>

                        <p>
                            <strong>Previous price:</strong>
                            ${oldPrice:F2}
                        </p>

                        <p>
                            <strong>New price:</strong>
                            ${request.Price:F2}
                        </p>

                        <p>
                            Open UniLife Marketplace to view the listing.
                        </p>
                    </div>
                    """
                        );
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(
                            $"Price-drop email to {user.Email} failed: " +
                            ex.Message
                        );
                    }
                }
            }

            return Ok(new
            {
                message = "Listing updated successfully.",
                priceDropped,
                oldPrice,
                newPrice = listing.Price,
                notifiedUsers = usersToEmail.Count,
                listing
            });
        }

        // GET: api/Listing/my
        [Authorize]
        [HttpGet("my")]
        public async Task<IActionResult> GetMyListings()
        {
            var userIdValue = User
                .FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userIdValue, out int userId))
            {
                return Unauthorized("Invalid user token.");
            }

            var listings = await _context.Listings
                .Include(l => l.Category)
                .Include(l => l.Images)
                .Where(l => l.UserId == userId)
                .OrderByDescending(l => l.CreatedAt)
                .ToListAsync();

            return Ok(listings);
        }

        // DELETE: api/Listing/{id}
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteListing(int id)
        {
            var userIdValue = User
                .FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userIdValue, out int userId))
            {
                return Unauthorized("Invalid user token.");
            }

            var listing = await _context.Listings
                .Include(l => l.Images)
                .FirstOrDefaultAsync(l => l.ListingId == id);

            if (listing == null)
            {
                return NotFound("Listing not found.");
            }

            // Only the listing owner can delete it
            if (listing.UserId != userId)
            {
                return Forbid();
            }

            // Delete recently viewed records
            var recentlyViewedRecords =
                await _context.RecentlyViewedListings
                    .Where(r => r.ListingId == id)
                    .ToListAsync();

            _context.RecentlyViewedListings.RemoveRange(
                recentlyViewedRecords
            );

            // Delete favorites connected to the listing
            var favorites = await _context.Favorites
                .Where(f => f.ListingId == id)
                .ToListAsync();

            _context.Favorites.RemoveRange(favorites);

            // Delete messages connected to the listing
            var messages = await _context.ChatMessages
                .Where(m => m.ListingId == id)
                .ToListAsync();

            _context.ChatMessages.RemoveRange(messages);

            // Delete listing image records and physical image files
            foreach (var image in listing.Images)
            {
                if (!string.IsNullOrWhiteSpace(image.ImageUrl))
                {
                    var relativePath = image.ImageUrl
                        .TrimStart('/')
                        .Replace('/', Path.DirectorySeparatorChar);

                    var imagePath = Path.Combine(
                        Directory.GetCurrentDirectory(),
                        "wwwroot",
                        relativePath
                    );

                    if (System.IO.File.Exists(imagePath))
                    {
                        System.IO.File.Delete(imagePath);
                    }
                }
            }

            _context.ListingImages.RemoveRange(listing.Images);

            // Delete the listing last
            _context.Listings.Remove(listing);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Listing deleted successfully.",
                listingId = id
            });
        }

        // GET: api/Listing/{id}/similar
        [HttpGet("{id}/similar")]
        public async Task<IActionResult> GetSimilarListings(
            int id)
        {
            var listing = await _context.Listings
                .FindAsync(id);

            if (listing == null)
            {
                return NotFound("Listing not found.");
            }

            var minPrice = listing.Price * 0.75m;
            var maxPrice = listing.Price * 1.25m;

            var similarListings = await _context.Listings
                .Include(l => l.Category)
                .Include(l => l.Images)
                .Where(l =>
                    l.ListingId != id &&
                    !l.IsHidden &&
                    l.Status == ListingStatus.Available &&
                    l.CategoryId == listing.CategoryId &&
                    l.Price >= minPrice &&
                    l.Price <= maxPrice)
                .OrderByDescending(l => l.CreatedAt)
                .Take(10)
                .ToListAsync();

            return Ok(similarListings);
        }

        // GET: api/Listing/recommended-for-you
        [HttpGet("recommended-for-you")]
        public async Task<IActionResult>
            GetRecommendedForYou()
        {
            if (User.Identity == null ||
                !User.Identity.IsAuthenticated)
            {
                return Unauthorized(
                    "Please login to view recommendations.");
            }

            var userIdValue = User
                .FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userIdValue, out int userId))
            {
                return Unauthorized("Invalid user token.");
            }

            var recentCategoryIds =
                await _context.RecentlyViewedListings
                    .Include(r => r.Listing)
                    .Where(r => r.UserId == userId)
                    .OrderByDescending(r => r.ViewedAt)
                    .Select(r => r.Listing!.CategoryId)
                    .Distinct()
                    .Take(5)
                    .ToListAsync();

            if (!recentCategoryIds.Any())
            {
                return Ok(new
                {
                    message =
                        "No recommendations yet. " +
                        "View some listings first.",
                    data = new List<object>()
                });
            }

            var viewedListingIds =
                await _context.RecentlyViewedListings
                    .Where(r => r.UserId == userId)
                    .Select(r => r.ListingId)
                    .ToListAsync();

            var recommendations = await _context.Listings
                .Include(l => l.Category)
                .Include(l => l.Images)
                .Where(l =>
                    !l.IsHidden &&
                    l.Status == ListingStatus.Available &&
                    l.UserId != userId &&
                    recentCategoryIds.Contains(
                        l.CategoryId) &&
                    !viewedListingIds.Contains(
                        l.ListingId))
                .OrderByDescending(l => l.CreatedAt)
                .Take(20)
                .ToListAsync();

            return Ok(recommendations);
        }

        // GET: api/Listing/top-sellers
        [HttpGet("top-sellers")]
        public async Task<IActionResult> GetTopSellers()
        {
            var sellers = await _context.Users
                .Where(u => u.Role == "User")
                .Select(u => new
                {
                    u.UserId,
                    u.FullName,
                    u.ProfileImageUrl,

                    AverageRating = _context.Reviews
                        .Where(r =>
                            r.SellerId == u.UserId)
                        .Average(r =>
                            (double?)r.Rating) ?? 0,

                    TotalReviews = _context.Reviews
                        .Count(r =>
                            r.SellerId == u.UserId)
                })
                .OrderByDescending(x =>
                    x.AverageRating)
                .ThenByDescending(x =>
                    x.TotalReviews)
                .Take(10)
                .ToListAsync();

            return Ok(sellers);
        }

        // GET: api/Listing/new
        [HttpGet("new")]
        public async Task<IActionResult> GetNewestListings()
        {
            var listings = await _context.Listings
                .Include(l => l.Category)
                .Include(l => l.Images)
                .Include(l => l.User)
                .Where(l =>
                    !l.IsHidden &&
                    l.Status == ListingStatus.Available)
                .OrderByDescending(l => l.CreatedAt)
                .Take(20)
                .ToListAsync();

            return Ok(listings);
        }

        // GET: api/Listing/trending
        [HttpGet("trending")]
        public async Task<IActionResult> GetTrendingListings()
        {
            var listings = await _context.Listings
                .Include(l => l.Category)
                .Include(l => l.Images)
                .Include(l => l.User)
                .Where(l =>
                    !l.IsHidden &&
                    l.Status == ListingStatus.Available)
                .OrderByDescending(l => l.ViewCount)
                .Take(20)
                .ToListAsync();

            return Ok(listings);
        }

        // GET: api/Listing/nearby
        [HttpGet("nearby")]
        public async Task<IActionResult> GetNearbyListings(
            double latitude,
            double longitude,
            double radiusKm = 10)
        {
            if (radiusKm <= 0)
            {
                return BadRequest(
                    "Radius must be greater than zero.");
            }

            var listings = await _context.Listings
                .Include(l => l.Category)
                .Include(l => l.User)
                .Include(l => l.Images)
                .Where(l =>
                    !l.IsHidden &&
                    l.Status == ListingStatus.Available &&
                    l.Latitude != null &&
                    l.Longitude != null)
                .ToListAsync();

            var nearbyListings = listings
                .Select(l => new
                {
                    Listing = l,

                    DistanceKm = CalculateDistanceKm(
                        latitude,
                        longitude,
                        l.Latitude!.Value,
                        l.Longitude!.Value)
                })
                .Where(x =>
                    x.DistanceKm <= radiusKm)
                .OrderBy(x =>
                    x.DistanceKm)
                .ToList();

            return Ok(nearbyListings);
        }

        private static double CalculateDistanceKm(
            double lat1,
            double lon1,
            double lat2,
            double lon2)
        {
            const double earthRadiusKm = 6371;

            double dLat =
                DegreesToRadians(lat2 - lat1);

            double dLon =
                DegreesToRadians(lon2 - lon1);

            double a =
                Math.Sin(dLat / 2) *
                Math.Sin(dLat / 2) +

                Math.Cos(
                    DegreesToRadians(lat1)) *

                Math.Cos(
                    DegreesToRadians(lat2)) *

                Math.Sin(dLon / 2) *
                Math.Sin(dLon / 2);

            double c = 2 * Math.Atan2(
                Math.Sqrt(a),
                Math.Sqrt(1 - a));

            return earthRadiusKm * c;
        }



        private static double DegreesToRadians(
            double degrees)
        {
            return degrees * Math.PI / 180;
        }
    }
}