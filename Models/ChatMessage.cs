namespace Marketplace_capstone_feature_01.Models
{
    public class ChatMessage
    {

        // All the properties of the ChatMessage class this is used to store the chat messages between users regarding a listing
        public int ChatMessageId { get; set; }

        public int SenderId { get; set; }
        public User? Sender { get; set; }

        public int ReceiverId { get; set; }
        public User? Receiver { get; set; }

        public int ListingId { get; set; }
        public Listing? Listing { get; set; }

        public string MessageText { get; set; } = string.Empty;

        public bool IsRead { get; set; } = false;

        public DateTime? ReadAt { get; set; }

        public DateTime SentAt { get; set; } = DateTime.UtcNow;
    }
}
