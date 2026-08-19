namespace Marketplace_capstone_feature_01.Models
{
    public class RecentlyViewedListing
    {

        public int RecentlyViewedListingId { get; set; }

        public int UserId { get; set; }
        public User? User { get; set; }

        public int ListingId { get; set; }
        public Listing? Listing { get; set; }

        public DateTime ViewedAt { get; set; } = DateTime.UtcNow;
    }
}
