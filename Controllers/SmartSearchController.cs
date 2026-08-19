using Marketplace_capstone_feature_01.Data;
using Marketplace_capstone_feature_01.DTOs;
using Marketplace_capstone_feature_01.Enums;
using Marketplace_capstone_feature_01.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Marketplace_capstone_feature_01.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SmartSearchController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ISmartSearchService _smartSearchService;

        public SmartSearchController(
            ApplicationDbContext context,
            ISmartSearchService smartSearchService)
        {
            _context = context;
            _smartSearchService = smartSearchService;
        }

        // POST: api/SmartSearch
        [HttpPost]
        public async Task<IActionResult> Search(
            SmartSearchRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            if (request.PageNumber < 1)
            {
                request.PageNumber = 1;
            }

            if (request.PageSize < 1)
            {
                request.PageSize = 10;
            }

            SmartSearchFiltersDto filters =
                await _smartSearchService.ParseSearchAsync(
                    request.SearchText);

            var query = _context.Listings
                .AsNoTracking()
                .Include(l => l.Category)
                .Include(l => l.Images)
                .Include(l => l.User)
                .AsQueryable();

            // Only show available and visible listings
            query = query.Where(l =>
                l.Status == ListingStatus.Available &&
                !l.IsHidden);

            // Minimum price
            if (filters.MinimumPrice.HasValue)
            {
                query = query.Where(l =>
                    l.Price >= filters.MinimumPrice.Value);
            }

            // Maximum price
            if (filters.MaximumPrice.HasValue)
            {
                query = query.Where(l =>
                    l.Price <= filters.MaximumPrice.Value);
            }

            // Location filter
            if (!string.IsNullOrWhiteSpace(filters.City))
            {
                string city = filters.City.Trim();

                query = query.Where(l =>
                    l.Location.Contains(city));
            }

            // Category filter
            if (!string.IsNullOrWhiteSpace(filters.Category))
            {
                string category = filters.Category.Trim();

                query = query.Where(l =>
                    l.Category != null &&
                    l.Category.Name.Contains(category));
            }

            // Listing type filter
            if (!string.IsNullOrWhiteSpace(filters.ListingType))
            {
                bool validListingType = Enum.TryParse(
                    filters.ListingType,
                    true,
                    out ListingType listingType);

                if (validListingType)
                {
                    query = query.Where(l =>
                        l.ListingType == listingType);
                }
            }

            // Keyword filter
            if (!string.IsNullOrWhiteSpace(filters.Keyword))
            {
                string[] searchWords = filters.Keyword
                    .Split(
                        ' ',
                        StringSplitOptions.RemoveEmptyEntries |
                        StringSplitOptions.TrimEntries);

                foreach (string searchWord in searchWords)
                {
                    string word = searchWord;

                    query = query.Where(l =>
                        l.Title.Contains(word) ||
                        l.Description.Contains(word) ||
                        l.Location.Contains(word));
                }
            }

            // Sorting
            query = filters.SortBy switch
            {
                "price-low" =>
                    query.OrderBy(l => l.Price),

                "price-high" =>
                    query.OrderByDescending(l => l.Price),

                "oldest" =>
                    query.OrderBy(l => l.CreatedAt),

                _ =>
                    query.OrderByDescending(l => l.CreatedAt)
            };

            int totalResults = await query.CountAsync();

            int totalPages = (int)Math.Ceiling(
                totalResults / (double)request.PageSize);

            var listings = await query
                .Skip(
                    (request.PageNumber - 1) *
                    request.PageSize)
                .Take(request.PageSize)
                .Select(l => new
                {
                    l.ListingId,
                    l.Title,
                    l.Description,
                    l.Price,
                    l.Location,
                    ListingType = l.ListingType.ToString(),
                    Status = l.Status.ToString(),
                    l.CreatedAt,
                    l.ViewCount,

                    Category = l.Category == null
                        ? null
                        : l.Category.Name,

                    Seller = l.User == null
                        ? null
                        : new
                        {
                            l.User.UserId,
                            l.User.FullName
                        },

                    Images = l.Images
                        .Select(image => new
                        {
                            image.ListingImageId,
                            image.ImageUrl
                        })
                        .ToList()
                })
                .ToListAsync();

            var response = new SmartSearchResponseDto<object>
            {
                Message = totalResults > 0
                    ? "Listings found successfully."
                    : "No listings matched your search.",

                Filters = filters,
                TotalResults = totalResults,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize,
                TotalPages = totalPages,
                Listings = listings
                    .Cast<object>()
                    .ToList()
            };

            return Ok(response);
        }
    }
}