namespace Marketplace_capstone_feature_01.DTOs
{
    public class SmartSearchFiltersDto
    {
        public string OriginalSearchText { get; set; } =
            string.Empty;

        public string? Keyword { get; set; }

        public string? Category { get; set; }

        public decimal? MinimumPrice { get; set; }

        public decimal? MaximumPrice { get; set; }

        public string? City { get; set; }

        public string? ListingType { get; set; }

        public string SortBy { get; set; } = "newest";
    }
}