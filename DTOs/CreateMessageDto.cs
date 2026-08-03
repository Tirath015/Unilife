using System.ComponentModel.DataAnnotations;

namespace Marketplace_capstone_feature_01.DTOs
{
    public class CreateMessageDto
    {


        [Required]
        public int ReceiverId { get; set; }

        [Required]
        public int ListingId { get; set; }

        [Required]
        public string MessageText { get; set; } = string.Empty;
    }
}
