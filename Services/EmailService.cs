using MailKit.Net.Smtp;
using MailKit.Security;
using Marketplace_capstone_feature_01.Configurations;
using Marketplace_capstone_feature_01.Interfaces;
using Microsoft.Extensions.Options;
using MimeKit;

namespace Marketplace_capstone_feature_01.Services
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _settings;
        private readonly ILogger<EmailService> _logger;

        public EmailService(
            IOptions<EmailSettings> settings,
            ILogger<EmailService> logger)
        {
            _settings = settings.Value;
            _logger = logger;
        }

        public async Task SendEmailAsync(
            string recipientEmail,
            string subject,
            string htmlMessage)
        {
            if (string.IsNullOrWhiteSpace(recipientEmail))
            {
                throw new ArgumentException(
                    "Recipient email is required.",
                    nameof(recipientEmail));
            }

            var email = new MimeMessage();

            email.From.Add(new MailboxAddress(
                _settings.DisplayName,
                _settings.FromEmail));

            email.To.Add(MailboxAddress.Parse(recipientEmail));
            email.Subject = subject;

            email.Body = new BodyBuilder
            {
                HtmlBody = htmlMessage
            }.ToMessageBody();

            using var smtpClient = new SmtpClient();

            try
            {
                await smtpClient.ConnectAsync(
                    _settings.Host,
                    _settings.Port,
                    SecureSocketOptions.StartTls);

                await smtpClient.AuthenticateAsync(
                    _settings.Username,
                    _settings.Password);

                await smtpClient.SendAsync(email);

                await smtpClient.DisconnectAsync(true);

                _logger.LogInformation(
                    "Email sent successfully to {RecipientEmail}.",
                    recipientEmail);
            }
            catch (Exception exception)
            {
                _logger.LogError(
                    exception,
                    "Email could not be sent to {RecipientEmail}.",
                    recipientEmail);

                Console.WriteLine(exception.ToString());

                throw;
            }
        }
    }
}