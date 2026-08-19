using Marketplace_capstone_feature_01.Data;
using Marketplace_capstone_feature_01.DTOs;
using Marketplace_capstone_feature_01.Interfaces;
using Marketplace_capstone_feature_01.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace Marketplace_capstone_feature_01.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IEmailService _emailService;
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(
            ApplicationDbContext context,
            IConfiguration configuration,
            IEmailService emailService)
        {
            _context = context;
            _configuration = configuration;
            _emailService = emailService;
        }

        // POST: api/Auth/register
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto request)
        {
            if (string.IsNullOrWhiteSpace(request.FullName))
            {
                return BadRequest("Full name is required.");
            }

            if (string.IsNullOrWhiteSpace(request.Email))
            {
                return BadRequest("Email is required.");
            }

            if (string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest("Password is required.");
            }

            string normalizedEmail = request.Email
                .Trim()
                .ToLowerInvariant();

            bool userExists = await _context.Users
                .AnyAsync(u => u.Email.ToLower() == normalizedEmail);

            if (userExists)
            {
                return BadRequest("Email already exists.");
            }

            string passwordHash =
                BCrypt.Net.BCrypt.HashPassword(request.Password);

            string verificationToken =
                GenerateVerificationToken();

            var user = new User
            {
                FullName = request.FullName.Trim(),
                Email = normalizedEmail,
                PasswordHash = passwordHash,
                PhoneNumber = request.PhoneNumber?.Trim(),
                Role = "User",
                IsBlocked = false,
                EmailVerified = false,
                EmailVerificationToken = verificationToken,
                EmailVerificationTokenExpiry =
                    DateTime.UtcNow.AddHours(24),
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            string verificationLink = Url.Action(
                action: nameof(VerifyEmail),
                controller: "Auth",
                values: new
                {
                    token = verificationToken
                },
                protocol: Request.Scheme,
                host: Request.Host.Value
            )!;

            bool emailSent = true;

            try
            {
                await SendVerificationEmailAsync(
                    user,
                    verificationLink);
            }
            catch (Exception ex)
            {
                emailSent = false;

                Console.WriteLine(
                    $"Verification email could not be sent: {ex.Message}");
            }

            return Ok(new
            {
                message = emailSent
                    ? "User registered successfully. Please check your email to verify your account."
                    : "User registered successfully, but the verification email could not be sent. Use the resend verification endpoint.",
                userId = user.UserId,
                email = user.Email,
                emailVerified = user.EmailVerified
            });
        }

        // GET: api/Auth/verify-email?token=...
        [HttpGet("verify-email")]
        public async Task<IActionResult> VerifyEmail(
            [FromQuery] string token)
        {
            if (string.IsNullOrWhiteSpace(token))
            {
                return BadRequest("Verification token is required.");
            }

            var user = await _context.Users
                .FirstOrDefaultAsync(u =>
                    u.EmailVerificationToken == token);

            if (user == null)
            {
                return BadRequest(
                    "The email verification link is invalid.");
            }

            if (user.EmailVerified)
            {
                return Ok(new
                {
                    message = "Your email is already verified."
                });
            }

            if (!user.EmailVerificationTokenExpiry.HasValue ||
                user.EmailVerificationTokenExpiry.Value <
                DateTime.UtcNow)
            {
                return BadRequest(
                    "The email verification link has expired. Please request a new verification email.");
            }

            user.EmailVerified = true;
            user.EmailVerificationToken = null;
            user.EmailVerificationTokenExpiry = null;

            await _context.SaveChangesAsync();

            try
            {
                string safeName =
                    WebUtility.HtmlEncode(user.FullName);

                await _emailService.SendEmailAsync(
                    user.Email,
                    "Welcome to Marketplace",
                    $"""
                    <div style="
                        font-family: Arial, sans-serif;
                        max-width: 600px;
                        margin: auto;">

                        <h2>Welcome to Marketplace, {safeName}!</h2>

                        <p>
                            Your email address has been verified
                            successfully.
                        </p>

                        <p>Your account is now ready to use.</p>

                        <p>You can now:</p>

                        <ul>
                            <li>Create sale and rental listings</li>
                            <li>Search marketplace listings</li>
                            <li>Save your favorite listings</li>
                            <li>Message buyers and sellers</li>
                            <li>Send purchase or rental requests</li>
                        </ul>

                        <p>
                            Thank you for joining Marketplace.
                        </p>

                        <p>
                            Regards,<br />
                            Marketplace Support
                        </p>
                    </div>
                    """);
            }
            catch (Exception ex)
            {
                Console.WriteLine(
                    $"Welcome email could not be sent: {ex.Message}");
            }

            return Ok(new
            {
                message =
                    "Email verified successfully. You can now log in.",
                userId = user.UserId,
                email = user.Email,
                emailVerified = user.EmailVerified
            });
        }

        // POST: api/Auth/resend-verification
        // POST: api/Auth/resend-verification
        [HttpPost("resend-verification")]
        public async Task<IActionResult> ResendVerification(
            [FromBody] ResendVerificationRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email))
            {
                return BadRequest("Email is required.");
            }

            string normalizedEmail = request.Email
                .Trim()
                .ToLowerInvariant();

            var user = await _context.Users
                .FirstOrDefaultAsync(u =>
                    u.Email.ToLower() == normalizedEmail);

            if (user == null)
            {
                return Ok(new
                {
                    message =
                        "If the email is registered and not verified, a verification email will be sent."
                });
            }

            if (user.EmailVerified)
            {
                return Ok(new
                {
                    message = "This email is already verified."
                });
            }

            string newVerificationToken = GenerateVerificationToken();

            user.EmailVerificationToken = newVerificationToken;
            user.EmailVerificationTokenExpiry =
                DateTime.UtcNow.AddHours(24);

            await _context.SaveChangesAsync();

            string verificationLink = Url.Action(
                action: nameof(VerifyEmail),
                controller: "Auth",
                values: new
                {
                    token = newVerificationToken
                },
                protocol: Request.Scheme,
                host: Request.Host.Value
            )!;

            try
            {
                await SendVerificationEmailAsync(
                    user,
                    verificationLink);
            }
            catch (Exception ex)
            {
                Console.WriteLine("====================================");
                Console.WriteLine("EMAIL ERROR");
                Console.WriteLine(ex.ToString());
                Console.WriteLine("====================================");

                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message = "The verification email could not be sent.",
                        error = ex.Message,
                        innerError = ex.InnerException?.Message,
                        stackTrace = ex.StackTrace
                    });
            }

            return Ok(new
            {
                message = "A new verification email has been sent."
            });
        }

        // POST: api/Auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(
                    "Email and password are required.");
            }

            string normalizedEmail = request.Email
                .Trim()
                .ToLowerInvariant();

            var user = await _context.Users
                .FirstOrDefaultAsync(u =>
                    u.Email.ToLower() == normalizedEmail);

            if (user == null)
            {
                return BadRequest(
                    "Invalid email or password.");
            }

            if (user.IsBlocked)
            {
                return Unauthorized(
                    "Your account has been blocked. Please contact support.");
            }

            bool isPasswordValid =
                BCrypt.Net.BCrypt.Verify(
                    request.Password,
                    user.PasswordHash);

            if (!isPasswordValid)
            {
                return BadRequest(
                    "Invalid email or password.");
            }

            if (!user.EmailVerified)
            {
                return Unauthorized(new
                {
                    message =
                        "Please verify your email before logging in.",
                    emailVerified = false
                });
            }

            user.LastLoginAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            string token = CreateToken(user);

            return Ok(new
            {
                message = "Login successful.",
                token,
                user = new
                {
                    user.UserId,
                    user.FullName,
                    user.Email,
                    user.PhoneNumber,
                    user.Role,
                    user.EmailVerified,
                    user.ProfileImageUrl,
                    user.LastLoginAt
                }
            });
        }

        // Generate a secure URL-safe token
        private static string GenerateVerificationToken()
        {
            byte[] randomBytes =
                RandomNumberGenerator.GetBytes(32);

            return WebEncoders.Base64UrlEncode(
                randomBytes);
        }

        // Send the verification email
        private async Task SendVerificationEmailAsync(
            User user,
            string verificationLink)
        {
            string safeName =
                WebUtility.HtmlEncode(user.FullName);

            string safeVerificationLink =
                WebUtility.HtmlEncode(verificationLink);

            await _emailService.SendEmailAsync(
                user.Email,
                "Verify your Marketplace email",
                $"""
                <div style="
                    font-family: Arial, sans-serif;
                    max-width: 600px;
                    margin: auto;">

                    <h2>Verify your email address</h2>

                    <p>Hello {safeName},</p>

                    <p>
                        Thank you for creating a Marketplace account.
                        Please verify your email address before logging in.
                    </p>

                    <div style="
                        margin-top: 30px;
                        margin-bottom: 30px;">

                        <a
                            href="{safeVerificationLink}"
                            style="
                                background-color: #2563eb;
                                color: white;
                                padding: 12px 20px;
                                text-decoration: none;
                                border-radius: 6px;
                                display: inline-block;">

                            Verify Email
                        </a>
                    </div>

                    <p>
                        This verification link expires in 24 hours.
                    </p>

                    <p>
                        You can also copy and paste this link into
                        your browser:
                    </p>

                    <p style="word-break: break-all;">
                        {safeVerificationLink}
                    </p>

                    <p>
                        If you did not create this account,
                        you can ignore this email.
                    </p>

                    <p>
                        Regards,<br />
                        Marketplace Support
                    </p>
                </div>
                """);
        }

        // Generate JWT token
        private string CreateToken(User user)
        {
            var claims = new List<Claim>
            {
                new(
                    ClaimTypes.NameIdentifier,
                    user.UserId.ToString()),

                new(
                    ClaimTypes.Name,
                    user.FullName),

                new(
                    ClaimTypes.Email,
                    user.Email),

                new(
                    ClaimTypes.Role,
                    user.Role),

                new(
                    "email_verified",
                    user.EmailVerified.ToString().ToLower())
            };

            string? jwtKey =
                _configuration["Jwt:Key"];

            if (string.IsNullOrWhiteSpace(jwtKey))
            {
                throw new InvalidOperationException(
                    "JWT key is missing from configuration.");
            }

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey));

            var credentials = new SigningCredentials(
                key,
                SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddDays(1),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler()
                .WriteToken(token);
        }


        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword(ForgotPasswordDto request)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null)
            {
                return Ok(new
                {
                    message = "If the email exists, a reset link has been sent."
                });
            }

            user.PasswordResetToken = Convert.ToHexString(
                RandomNumberGenerator.GetBytes(32));

            user.PasswordResetTokenExpiry = DateTime.UtcNow.AddMinutes(30);

            await _context.SaveChangesAsync();

            // need to change this one 


            var resetLink =
                $"https://yourfrontend.com/reset-password?email={Uri.EscapeDataString(user.Email)}&token={user.PasswordResetToken}";

            await _emailService.SendEmailAsync(
                user.Email,
                "Reset your password",
                $"Click this link to reset your password: {resetLink}");

            return Ok(new
            {
                message = "If the email exists, a reset link has been sent."
            });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword(ResetPasswordDto request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u =>
                u.Email == request.Email &&
                u.PasswordResetToken == request.Token);

            if (user == null)
            {
                return BadRequest(new
                {
                    message = "Invalid reset token."
                });
            }

            if (user.PasswordResetTokenExpiry == null ||
                user.PasswordResetTokenExpiry < DateTime.UtcNow)
            {
                return BadRequest(new
                {
                    message = "Reset token has expired."
                });
            }

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(
                request.NewPassword);

            user.PasswordResetToken = null;
            user.PasswordResetTokenExpiry = null;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Password reset successfully."
            });
        }
        // DTO used by the resend-verification endpoint
        public class ResendVerificationRequest
        {
            public string Email { get; set; } = string.Empty;
        }
    }

} 