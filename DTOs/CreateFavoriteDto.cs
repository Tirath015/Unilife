using System.ComponentModel.DataAnnotations;

namespace Marketplace_capstone_feature_01.DTOs
{
    public class CreateFavoriteDto
    {
        [Required]
        public int UserId { get; set; }

        [Required]
        public int ListingId { get; set; }
    }
}
