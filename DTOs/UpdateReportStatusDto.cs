using Marketplace_capstone_feature_01.Enums;
using System.ComponentModel.DataAnnotations;

namespace Marketplace_capstone_feature_01.DTOs
{
    public class UpdateReportStatusDto
    {
        [Required]
        public ReportStatus Status { get; set; }
    }
}