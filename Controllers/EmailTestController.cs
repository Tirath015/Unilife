using Marketplace_capstone_feature_01.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Marketplace_capstone_feature_01.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class EmailTestController : Controller
    {

        private readonly IEmailService _emailService;

        public EmailTestController(IEmailService emailService)
        {
            _emailService = emailService;
        }

        [HttpPost]
        public async Task<IActionResult> SendTestEmail(string recipientEmail)
        {
            await _emailService.SendEmailAsync(
                recipientEmail,
                "Marketplace Email Test",
                """
                <h2>Email service is working</h2>
                <p>Your Marketplace backend successfully sent this email.</p>
                """);

            return Ok(new
            {
                message = "Test email sent successfully."
            });
        }


        }
}
