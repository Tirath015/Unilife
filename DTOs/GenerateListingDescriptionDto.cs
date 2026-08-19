using System.ComponentModel.DataAnnotations;

namespace Marketplace_capstone_feature_01.DTOs
{
    public class GenerateListingDescriptionDto
    {
        [Required]
        [StringLength(150)]
        public string Title { get; set; } = string.Empty;

        [StringLength(100)]
        public string? CategoryName { get; set; }

        [StringLength(100)]
        public string? Condition { get; set; }

        [Range(0, 999999)]
        public decimal? Price { get; set; }

        [StringLength(150)]
        public string? Location { get; set; }

        [StringLength(500)]
        public string? KeyDetails { get; set; }

        [StringLength(1000)]
        public string? ExistingDescription { get; set; }
    }
}