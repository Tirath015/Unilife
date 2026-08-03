namespace Marketplace_capstone_feature_01.DTOs
{
    public class CreateSavedSearchDto
    {
        public string? Keyword { get; set; }

        public int? CategoryId { get; set; }

        public decimal? MinPrice { get; set; }

        public decimal? MaxPrice { get; set; }

        public string? Location { get; set; }
    }
}
