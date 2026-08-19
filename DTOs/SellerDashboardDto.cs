namespace Marketplace_capstone_feature_01.DTOs
{
    public class SellerDashboardDto
    {
        public int TotalListings { get; set; }

        public int ActiveListings { get; set; }

        public int SoldListings { get; set; }

        public int RentedListings { get; set; }

        public int HiddenListings { get; set; }

        public int TotalViews { get; set; }

        public int TotalFavorites { get; set; }

        public int PendingRequests { get; set; }

        public int AcceptedRequests { get; set; }

        public int RejectedRequests { get; set; }

        public int TotalMessages { get; set; }

        public int UnreadMessages { get; set; }

        public double AverageRating { get; set; }

        public int TotalReviews { get; set; }

        public List<SellerListingSummaryDto> PopularListings { get; set; }
            = new List<SellerListingSummaryDto>();
    }

    public class SellerListingSummaryDto
    {
        public int ListingId { get; set; }

        public string Title { get; set; } = string.Empty;

        public decimal Price { get; set; }

        public int ViewCount { get; set; }

        public int FavoriteCount { get; set; }

        public string Status { get; set; } = string.Empty;

        public string? MainImageUrl { get; set; }
    }
}
