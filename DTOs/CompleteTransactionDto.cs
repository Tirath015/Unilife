using System.ComponentModel.DataAnnotations;

namespace Marketplace_capstone_feature_01.DTOs
{
    public class CompleteTransactionDto
    {
        [Required]
        public int TransactionId { get; set; }
    }
}