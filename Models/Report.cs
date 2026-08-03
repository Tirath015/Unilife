using Marketplace_capstone_feature_01.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Marketplace_capstone_feature_01.Models
{
    public class Report
    {
        [Key]
        public int ReportId { get; set; }

        public int ReporterId { get; set; }

        [ForeignKey(nameof(ReporterId))]
        public User Reporter { get; set; }

        public int? ListingId { get; set; }

        public Listing Listing { get; set; }

        public int? ReportedUserId { get; set; }

        [ForeignKey(nameof(ReportedUserId))]
        public User ReportedUser { get; set; }

        public ReportType ReportType { get; set; }

        public ReportReason Reason { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }

        public ReportStatus Status { get; set; } =
            ReportStatus.Pending;

        public DateTime CreatedAt { get; set; } =
            DateTime.UtcNow;
    }
}