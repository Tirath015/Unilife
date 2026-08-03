namespace Marketplace_capstone_feature_01.Interfaces
{
    public interface IEmailService
    {
        Task SendEmailAsync(
            string recipientEmail,
            string subject,
            string htmlMessage);
    }
}
