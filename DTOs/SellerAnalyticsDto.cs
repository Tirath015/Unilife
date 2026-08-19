namespace Marketplace_capstone_feature_01.DTOs
{
    public class SellerAnalyticsOverviewDto
    {
        public int TotalListings { get; set; }

        public int TotalViews { get; set; }

        public int TotalFavorites { get; set; }

        public int TotalMessages { get; set; }

        public int TotalRequests { get; set; }

        public int PendingRequests { get; set; }

        public int ApprovedRequests { get; set; }

        public int RejectedRequests { get; set; }

        public double AverageRating { get; set; }

        public int TotalReviews { get; set; }

        public double OverallConversionRate { get; set; }
    }

    public class ListingAnalyticsDto
    {
        public int ListingId { get; set; }

        public string Title { get; set; } = string.Empty;

        public decimal Price { get; set; }

        public string Status { get; set; } = string.Empty;

        public int Views { get; set; }

        public int Favorites { get; set; }

        public int Messages { get; set; }

        public int Requests { get; set; }

        public int ApprovedRequests { get; set; }

        public double ConversionRate { get; set; }

        public string? MainImageUrl { get; set; }
    }

    public class MonthlySellerSummaryDto
    {
        public int ListingsCreatedThisMonth { get; set; }

        public int SoldThisMonth { get; set; }

        public int RentedThisMonth { get; set; }

        public int RequestsThisMonth { get; set; }

        public int ReviewsThisMonth { get; set; }

        public int MessagesThisMonth { get; set; }
    }

}
