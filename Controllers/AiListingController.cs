using Marketplace_capstone_feature_01.DTOs;
using Marketplace_capstone_feature_01.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Marketplace_capstone_feature_01.Controllers

   
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AiListingController : ControllerBase
    {
        private readonly IAiListingService _aiListingService;

        public AiListingController(
            IAiListingService aiListingService
        )
        {
            _aiListingService = aiListingService;
        }

        // POST: api/AiListing/generate-description
        [HttpPost("generate-description")]
        public async Task<IActionResult> GenerateDescription(
            [FromBody] GenerateListingDescriptionDto request
        )
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            if (string.IsNullOrWhiteSpace(request.Title))
            {
                return BadRequest(
                    "Enter a listing title first."
                );
            }

            try
            {
                string description =
                    await _aiListingService
                        .GenerateDescriptionAsync(request);

                return Ok(new
                {
                    description
                });
            }
            catch (Exception error)
            {
                Console.WriteLine(
                    $"AI description error: {error.Message}"
                );

                return StatusCode(
                    StatusCodes.Status503ServiceUnavailable,
                    new
                    {
                        message =
                            "The AI description service is currently unavailable."
                    }
                );
            }
        }
    }
}