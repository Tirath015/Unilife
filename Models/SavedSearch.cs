namespace Marketplace_capstone_feature_01.Models
{
    public class SavedSearch
    {
        public int SavedSearchId { get; set; }

        public int UserId { get; set; }
        public User? User { get; set; }

        public string? Keyword { get; set; }

        public int? CategoryId { get; set; }
        public Category? Category { get; set; }

        public decimal? MinPrice { get; set; }

        public decimal? MaxPrice { get; set; }

        public string? Location { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
