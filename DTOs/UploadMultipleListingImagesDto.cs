using System.ComponentModel.DataAnnotations;

namespace Marketplace_capstone_feature_01.DTOs
{
    public class UploadMultipleListingImagesDto
    {
        [Required]
        public int ListingId { get; set; }

        [Required]
        public List<IFormFile> Images { get; set; } = new List<IFormFile>();
    }
}
