using Marketplace_capstone_feature_01.Enums;

namespace Marketplace_capstone_feature_01.Models
{
    public class PurchaseRequest
    {
        public int PurchaseRequestId { get; set; }

        public int ListingId { get; set; }
        public Listing? Listing { get; set; }

        public int BuyerId { get; set; }
        public User? Buyer { get; set; }

        public int SellerId { get; set; }
        public User? Seller { get; set; }

        public string? Message { get; set; }

        public RequestStatus Status { get; set; } = RequestStatus.Pending;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
