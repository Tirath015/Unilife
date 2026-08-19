using Marketplace_capstone_feature_01.Data;
using Marketplace_capstone_feature_01.DTOs;
using Marketplace_capstone_feature_01.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace Marketplace_capstone_feature_01.Services
{
    public class SmartSearchService : ISmartSearchService
    {
        private readonly ApplicationDbContext _context;

        public SmartSearchService(
            ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<SmartSearchFiltersDto> ParseSearchAsync(
            string searchText)
        {
            string originalText = searchText.Trim();
            string normalizedText = originalText.ToLower();

            SmartSearchFiltersDto filters =
                new SmartSearchFiltersDto
                {
                    OriginalSearchText = originalText,
                    SortBy = "newest"
                };

            ExtractPriceFilters(
                normalizedText,
                filters);

            ExtractSortOrder(
                normalizedText,
                filters);

            ExtractListingType(
                normalizedText,
                filters);

            await ExtractCityAsync(
                normalizedText,
                filters);

            await ExtractCategoryAsync(
                normalizedText,
                filters);

            filters.Keyword = ExtractKeyword(
                normalizedText,
                filters);

            return filters;
        }

        private static void ExtractPriceFilters(
            string searchText,
            SmartSearchFiltersDto filters)
        {
            Match betweenMatch = Regex.Match(
                searchText,
                @"between\s+\$?([\d,]+(?:\.\d{1,2})?)\s+(?:and|to)\s+\$?([\d,]+(?:\.\d{1,2})?)",
                RegexOptions.IgnoreCase);

            if (betweenMatch.Success)
            {
                filters.MinimumPrice =
                    ParsePrice(betweenMatch.Groups[1].Value);

                filters.MaximumPrice =
                    ParsePrice(betweenMatch.Groups[2].Value);

                return;
            }

            Match underMatch = Regex.Match(
                searchText,
                @"(?:under|below|less than|max|maximum)\s+\$?([\d,]+(?:\.\d{1,2})?)",
                RegexOptions.IgnoreCase);

            if (underMatch.Success)
            {
                filters.MaximumPrice =
                    ParsePrice(underMatch.Groups[1].Value);
            }

            Match aboveMatch = Regex.Match(
                searchText,
                @"(?:above|over|more than|min|minimum)\s+\$?([\d,]+(?:\.\d{1,2})?)",
                RegexOptions.IgnoreCase);

            if (aboveMatch.Success)
            {
                filters.MinimumPrice =
                    ParsePrice(aboveMatch.Groups[1].Value);
            }
        }

        private static decimal? ParsePrice(
            string value)
        {
            string cleanedValue =
                value.Replace(",", "");

            if (decimal.TryParse(
                cleanedValue,
                out decimal price))
            {
                return price;
            }

            return null;
        }

        private static void ExtractSortOrder(
            string searchText,
            SmartSearchFiltersDto filters)
        {
            if (searchText.Contains("cheapest") ||
                searchText.Contains("lowest price") ||
                searchText.Contains("price low"))
            {
                filters.SortBy = "price-low";
                return;
            }

            if (searchText.Contains("most expensive") ||
                searchText.Contains("highest price") ||
                searchText.Contains("price high"))
            {
                filters.SortBy = "price-high";
                return;
            }

            if (searchText.Contains("oldest"))
            {
                filters.SortBy = "oldest";
                return;
            }

            filters.SortBy = "newest";
        }

        private static void ExtractListingType(
            string searchText,
            SmartSearchFiltersDto filters)
        {
            if (searchText.Contains("for rent") ||
                searchText.Contains("rental") ||
                searchText.Contains("rent"))
            {
                filters.ListingType = "Rent";
                return;
            }

            if (searchText.Contains("wanted") ||
                searchText.Contains("looking for") ||
                searchText.Contains("need to buy"))
            {
                filters.ListingType = "Wanted";
                return;
            }

            if (searchText.Contains("for sale") ||
                searchText.Contains("buy") ||
                searchText.Contains("sale"))
            {
                filters.ListingType = "Sale";
            }
        }

        private async Task ExtractCityAsync(
            string searchText,
            SmartSearchFiltersDto filters)
        {
            List<string> locations = await _context.Listings
                .AsNoTracking()
                .Where(l => !string.IsNullOrWhiteSpace(
                    l.Location))
                .Select(l => l.Location)
                .Distinct()
                .ToListAsync();

            string? matchingLocation = locations
                .OrderByDescending(location =>
                    location.Length)
                .FirstOrDefault(location =>
                    searchText.Contains(
                        location.ToLower()));

            if (!string.IsNullOrWhiteSpace(
                matchingLocation))
            {
                filters.City = matchingLocation;
            }
        }

        private async Task ExtractCategoryAsync(
            string searchText,
            SmartSearchFiltersDto filters)
        {
            List<string> categoryNames =
                await _context.Categories
                    .AsNoTracking()
                    .Where(category =>
                        !string.IsNullOrWhiteSpace(
                            category.Name))
                    .Select(category =>
                        category.Name)
                    .ToListAsync();

            string? matchingCategory = categoryNames
                .OrderByDescending(category =>
                    category.Length)
                .FirstOrDefault(category =>
                    searchText.Contains(
                        category.ToLower()));

            if (!string.IsNullOrWhiteSpace(
                matchingCategory))
            {
                filters.Category = matchingCategory;
                return;
            }

            Dictionary<string, string> categoryKeywords =
                new Dictionary<string, string>
                {
                    { "laptop", "Electronics" },
                    { "computer", "Electronics" },
                    { "phone", "Electronics" },
                    { "iphone", "Electronics" },
                    { "tablet", "Electronics" },

                    { "car", "Vehicles" },
                    { "truck", "Vehicles" },
                    { "vehicle", "Vehicles" },

                    { "room", "Housing" },
                    { "apartment", "Housing" },
                    { "house", "Housing" },

                    { "book", "Books" },
                    { "textbook", "Books" },

                    { "chair", "Furniture" },
                    { "table", "Furniture" },
                    { "sofa", "Furniture" }
                };

            foreach (KeyValuePair<string, string> item
                     in categoryKeywords)
            {
                if (searchText.Contains(item.Key))
                {
                    filters.Category = item.Value;
                    break;
                }
            }
        }

        private static string? ExtractKeyword(
            string searchText,
            SmartSearchFiltersDto filters)
        {
            string cleanedText = searchText;

            cleanedText = Regex.Replace(
                cleanedText,
                @"between\s+\$?[\d,]+(?:\.\d{1,2})?\s+(?:and|to)\s+\$?[\d,]+(?:\.\d{1,2})?",
                " ",
                RegexOptions.IgnoreCase);

            cleanedText = Regex.Replace(
                cleanedText,
                @"(?:under|below|less than|max|maximum|above|over|more than|min|minimum)\s+\$?[\d,]+(?:\.\d{1,2})?",
                " ",
                RegexOptions.IgnoreCase);

            if (!string.IsNullOrWhiteSpace(filters.City))
            {
                cleanedText = Regex.Replace(
                    cleanedText,
                    Regex.Escape(
                        filters.City.ToLower()),
                    " ",
                    RegexOptions.IgnoreCase);
            }

            if (!string.IsNullOrWhiteSpace(
                filters.Category))
            {
                cleanedText = Regex.Replace(
                    cleanedText,
                    Regex.Escape(
                        filters.Category.ToLower()),
                    " ",
                    RegexOptions.IgnoreCase);
            }

            string[] stopWords =
            {
                "in",
                "at",
                "near",
                "for",
                "the",
                "a",
                "an",
                "show",
                "find",
                "search",
                "listing",
                "listings",
                "available",
                "sale",
                "rent",
                "rental",
                "wanted",
                "buy",
                "cheapest",
                "oldest",
                "newest",
                "most",
                "expensive",
                "price",
                "low",
                "high"
            };

            string[] words = cleanedText
                .Split(
                    ' ',
                    StringSplitOptions.RemoveEmptyEntries |
                    StringSplitOptions.TrimEntries)
                .Where(word =>
                    !stopWords.Contains(word))
                .Where(word =>
                    !Regex.IsMatch(
                        word,
                        @"^\$?[\d,]+(?:\.\d{1,2})?$"))
                .ToArray();

            string keyword = string.Join(
                " ",
                words);

            return string.IsNullOrWhiteSpace(keyword)
                ? null
                : keyword;
        }
    }
}