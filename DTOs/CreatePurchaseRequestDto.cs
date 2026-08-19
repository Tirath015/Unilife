using System.ComponentModel.DataAnnotations;

namespace Marketplace_capstone_feature_01.DTOs
{
    public class CreatePurchaseRequestDto
    {
        [Required]
        public int ListingId { get; set; }

        [Required]
        public string Message { get; set; } = string.Empty;
    }
}
