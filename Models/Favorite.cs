namespace Marketplace_capstone_feature_01.Models
{
    public class Favorite
    {
        // This class represents a favorite listing for a user. It contains the following properties:
        public int FavoriteId { get; set; }

        public int UserId { get; set; }
        public User? User { get; set; }

        public int ListingId { get; set; }
        public Listing? Listing { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
