using System.ComponentModel.DataAnnotations;

namespace Marketplace_capstone_feature_01.DTOs
{
    public class SmartSearchRequestDto
    {
        [Required]
        [StringLength(
            300,
            MinimumLength = 2,
            ErrorMessage = "Search text must be between 2 and 300 characters.")]
        public string SearchText { get; set; } = string.Empty;

        [Range(
            1,
            int.MaxValue,
            ErrorMessage = "Page number must be at least 1.")]
        public int PageNumber { get; set; } = 1;

        [Range(
            1,
            100,
            ErrorMessage = "Page size must be between 1 and 100.")]
        public int PageSize { get; set; } = 10;
    }
}