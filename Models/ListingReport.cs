using Marketplace_capstone_feature_01.Enums;

namespace Marketplace_capstone_feature_01.Models
{
    public class ListingReport
    {
        public int ListingReportId { get; set; }

        public int ListingId { get; set; }
        public Listing? Listing { get; set; }

        public int ReporterId { get; set; }
        public User? Reporter { get; set; }

        public ReportReason Reason { get; set; }

        public string? Description { get; set; }

        public bool IsReviewed { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
