using Marketplace_capstone_feature_01.Enums;
using System.ComponentModel.DataAnnotations;

namespace Marketplace_capstone_feature_01.DTOs
{
    public class CreateListingReportDto
    {
        [Required]
        public int ListingId { get; set; }

        [Required]
        public ReportReason Reason { get; set; }

        [StringLength(500)]
        public string? Description { get; set; }
    }
}
