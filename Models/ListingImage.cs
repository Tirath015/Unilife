namespace Marketplace_capstone_feature_01.Models
{
    public class ListingImage
    {
        public int ListingImageId { get; set; }

        public string ImageUrl { get; set; } = string.Empty;

        public int ListingId { get; set; }
        public Listing? Listing { get; set; }
    }
}
