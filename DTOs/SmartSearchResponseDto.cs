namespace Marketplace_capstone_feature_01.DTOs
{
    public class SmartSearchResponseDto<T>
    {
        public string Message { get; set; } = string.Empty;

        public SmartSearchFiltersDto Filters { get; set; } =
            new SmartSearchFiltersDto();

        public int TotalResults { get; set; }

        public int PageNumber { get; set; }

        public int PageSize { get; set; }

        public int TotalPages { get; set; }

        public List<T> Listings { get; set; } =
            new List<T>();
    }
}