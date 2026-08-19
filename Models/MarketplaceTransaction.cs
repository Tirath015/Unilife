using Marketplace_capstone_feature_01.Enums;
using System.ComponentModel.DataAnnotations;

namespace Marketplace_capstone_feature_01.Models
{
    public class MarketplaceTransaction
    {
        [Key]
        public int TransactionId { get; set; }

        public int ListingId { get; set; }
        public Listing? Listing { get; set; }

        public int BuyerId { get; set; }
        public User? Buyer { get; set; }

        public int SellerId { get; set; }
        public User? Seller { get; set; }

        public TransactionStatus Status { get; set; } =
            TransactionStatus.Interested;

        public DateTime CreatedAt { get; set; } =
            DateTime.UtcNow;

        public DateTime? AcceptedAt { get; set; }

        public DateTime? SellerCompletedAt { get; set; }

        public DateTime? BuyerConfirmedAt { get; set; }

        public DateTime? CancelledAt { get; set; }
    }
}