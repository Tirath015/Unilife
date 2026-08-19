using System.ComponentModel.DataAnnotations;

namespace Marketplace_capstone_feature_01.DTOs
{
    public class UploadListingImageDto
    {

        [Required]
        public int ListingId { get; set; }

        [Required]
        public IFormFile Image { get; set; } = default!;
    }
}
