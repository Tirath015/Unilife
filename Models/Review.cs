namespace Marketplace_capstone_feature_01.Models
{
    public class Review
    {
        public int ReviewId { get; set; }

        public int BuyerId { get; set; }
        public User? Buyer { get; set; }

        public int SellerId { get; set; }
        public User? Seller { get; set; }

        public int ListingId { get; set; }
        public Listing? Listing { get; set; }

        public int Rating { get; set; }

        public string? Comment { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
