using Marketplace_capstone_feature_01.Data;
using Marketplace_capstone_feature_01.DTOs;
using Marketplace_capstone_feature_01.Enums;
using Marketplace_capstone_feature_01.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Marketplace_capstone_feature_01.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ReportsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ReportsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // POST: api/Reports/listing/5
        [HttpPost("listing/{listingId}")]
        public async Task<IActionResult> ReportListing(
            int listingId,
            [FromBody] CreateReportDto request)
        {
            var userIdValue = User
                .FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userIdValue, out int reporterId))
            {
                return Unauthorized("Invalid user token.");
            }

            if (!Enum.IsDefined(typeof(ReportReason), request.Reason))
            {
                return BadRequest("Invalid report reason.");
            }

            var listing = await _context.Listings
                .AsNoTracking()
                .FirstOrDefaultAsync(l => l.ListingId == listingId);

            if (listing == null)
            {
                return NotFound("Listing not found.");
            }

            if (listing.UserId == reporterId)
            {
                return BadRequest(
                    "You cannot report your own listing."
                );
            }

            var duplicateReport = await _context.Reports
                .AnyAsync(r =>
                    r.ReporterId == reporterId &&
                    r.ListingId == listingId &&
                    r.ReportType == ReportType.Listing &&
                    r.Status == ReportStatus.Pending);

            if (duplicateReport)
            {
                return BadRequest(
                    "You already submitted a pending report for this listing."
                );
            }

            var report = new Report
            {
                ReporterId = reporterId,
                ListingId = listingId,
                ReportedUserId = null,
                ReportType = ReportType.Listing,
                Reason = request.Reason,
                Description = request.Description?.Trim(),
                Status = ReportStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            _context.Reports.Add(report);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Listing report submitted successfully.",
                reportId = report.ReportId,
                reportType = report.ReportType,
                reason = report.Reason,
                status = report.Status,
                createdAt = report.CreatedAt
            });
        }

        // POST: api/Reports/user/5
        [HttpPost("user/{reportedUserId}")]
        public async Task<IActionResult> ReportUser(
            int reportedUserId,
            [FromBody] CreateReportDto request)
        {
            var userIdValue = User
                .FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userIdValue, out int reporterId))
            {
                return Unauthorized("Invalid user token.");
            }

            if (!Enum.IsDefined(typeof(ReportReason), request.Reason))
            {
                return BadRequest("Invalid report reason.");
            }

            if (reportedUserId == reporterId)
            {
                return BadRequest(
                    "You cannot report your own account."
                );
            }

            var reportedUserExists = await _context.Users
                .AnyAsync(u => u.UserId == reportedUserId);

            if (!reportedUserExists)
            {
                return NotFound("Reported user not found.");
            }

            var duplicateReport = await _context.Reports
                .AnyAsync(r =>
                    r.ReporterId == reporterId &&
                    r.ReportedUserId == reportedUserId &&
                    r.ReportType == ReportType.User &&
                    r.Status == ReportStatus.Pending);

            if (duplicateReport)
            {
                return BadRequest(
                    "You already submitted a pending report for this user."
                );
            }

            var report = new Report
            {
                ReporterId = reporterId,
                ListingId = null,
                ReportedUserId = reportedUserId,
                ReportType = ReportType.User,
                Reason = request.Reason,
                Description = request.Description?.Trim(),
                Status = ReportStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            _context.Reports.Add(report);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "User report submitted successfully.",
                reportId = report.ReportId,
                reportType = report.ReportType,
                reason = report.Reason,
                status = report.Status,
                createdAt = report.CreatedAt
            });
        }

        // GET: api/Reports/my
        [HttpGet("my")]
        public async Task<IActionResult> GetMyReports()
        {
            var userIdValue = User
                .FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userIdValue, out int reporterId))
            {
                return Unauthorized("Invalid user token.");
            }

            var reports = await _context.Reports
                .AsNoTracking()
                .Include(r => r.Listing)
                .Include(r => r.ReportedUser)
                .Where(r => r.ReporterId == reporterId)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new
                {
                    reportId = r.ReportId,
                    reportType = r.ReportType,
                    reason = r.Reason,
                    description = r.Description,
                    status = r.Status,
                    createdAt = r.CreatedAt,

                    listing = r.ListingId == null
                        ? null
                        : new
                        {
                            listingId = r.Listing!.ListingId,
                            title = r.Listing.Title
                        },

                    reportedUser = r.ReportedUserId == null
                        ? null
                        : new
                        {
                            userId = r.ReportedUser!.UserId,
                            fullName = r.ReportedUser.FullName
                        }
                })
                .ToListAsync();

            return Ok(reports);
        }

        // GET: api/Reports/admin
        [Authorize(Roles = "Admin")]
        [HttpGet("admin")]
        public async Task<IActionResult> GetAdminReports()
        {
            var reports = await _context.Reports
                .AsNoTracking()
                .Include(r => r.Reporter)
                .Include(r => r.Listing)
                .Include(r => r.ReportedUser)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new
                {
                    reportId = r.ReportId,
                    reportType = r.ReportType,
                    reason = r.Reason,
                    description = r.Description,
                    status = r.Status,
                    createdAt = r.CreatedAt,

                    reporter = new
                    {
                        userId = r.Reporter.UserId,
                        fullName = r.Reporter.FullName,
                        email = r.Reporter.Email
                    },

                    listing = r.ListingId == null
                        ? null
                        : new
                        {
                            listingId = r.Listing!.ListingId,
                            title = r.Listing.Title,
                            ownerId = r.Listing.UserId
                        },

                    reportedUser = r.ReportedUserId == null
                        ? null
                        : new
                        {
                            userId = r.ReportedUser!.UserId,
                            fullName = r.ReportedUser.FullName,
                            email = r.ReportedUser.Email
                        }
                })
                .ToListAsync();

            return Ok(reports);
        }

        // PATCH: api/Reports/5/status
        [Authorize(Roles = "Admin")]
        [HttpPatch("{reportId}/status")]
        public async Task<IActionResult> UpdateReportStatus(
            int reportId,
            [FromBody] UpdateReportStatusDto request)
        {
            if (!Enum.IsDefined(typeof(ReportStatus), request.Status))
            {
                return BadRequest("Invalid report status.");
            }

            var report = await _context.Reports
                .FirstOrDefaultAsync(r => r.ReportId == reportId);

            if (report == null)
            {
                return NotFound("Report not found.");
            }

            report.Status = request.Status;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Report status updated successfully.",
                reportId = report.ReportId,
                status = report.Status
            });
        }
    }
}