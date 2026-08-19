using Marketplace_capstone_feature_01.Data;
using Marketplace_capstone_feature_01.DTOs;
using Marketplace_capstone_feature_01.Models;
using Microsoft.AspNetCore.Mvc;

namespace Marketplace_capstone_feature_01.Controllers
{
    public class ImagesController  : ControllerBase
    {
       // context class object

       private readonly ApplicationDbContext _context;
        public ImagesController(ApplicationDbContext context)
        {
            _context = context;
        }


        // POST: api/images/upload

        // user can upload image for the listing , the image will be stored in the wwwroot/images folder and the url will be stored in the database
        [HttpPost("upload")]
        public async Task<IActionResult> UploadImage([FromForm] UploadListingImageDto request)
        {
            if (request.Image == null || request.Image.Length == 0)
            {
                return BadRequest("No image file provided.");
            }

            var listing = await _context.Listings.FindAsync(request.ListingId);

            if (listing == null)
            {
                return NotFound("Listing not found.");
            }

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            var extension = Path.GetExtension(request.Image.FileName).ToLower();

            if (!allowedExtensions.Contains(extension))
            {
                return BadRequest("Only image files are allowed.");
            }

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images");

            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var uniqueFileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await request.Image.CopyToAsync(stream);
            }

            var imageUrl = $"/images/{uniqueFileName}";

            var listingImage = new ListingImage
            {
                ListingId = request.ListingId,
                ImageUrl = imageUrl
            };




            _context.ListingImages.Add(listingImage);
            await _context.SaveChangesAsync();





            return Ok(new
            {
                message = "Image uploaded successfully.",
                imageUrl = imageUrl
            });
        }

        // now to upload multiple images for a listing, we will create a new endpoint that will accept a list of images and the listing id, and will store the images in the wwwroot/images folder and the urls in the database

        [HttpPost("upload-multiple")]
        public async Task<IActionResult> UploadMultipleImages([FromForm] UploadMultipleListingImagesDto request)
        {

            // if no images are provided, return bad request
            if (request.Images == null || request.Images.Count == 0)
            {
                return BadRequest("No image files provided.");
            }

            // if more than 10 images are provided, return bad request

            if (request.Images.Count > 10)
            {
                return BadRequest("Maximum 10 images are allowed.");
            }

            var listing = await _context.Listings.FindAsync(request.ListingId);

            // if listing is not found, return not found
            if (listing == null)
            {
                return NotFound("Listing not found.");
            }

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            var uploadedImages = new List<string>();

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images");

            // if the uploads folder does not exist, create it
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }


            foreach (var image in request.Images)
            {
                if (image == null || image.Length == 0)
                {
                    continue;
                }

                if (image.Length > 5 * 1024 * 1024)
                {
                    return BadRequest("Each image must be less than 5 MB.");
                }

                var extension = Path.GetExtension(image.FileName).ToLower();

                if (!allowedExtensions.Contains(extension))
                {
                    return BadRequest("Only .jpg, .jpeg, .png, and .webp files are allowed.");
                }

                var uniqueFileName = $"{Guid.NewGuid()}{extension}";
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await image.CopyToAsync(stream);
                }

                var imageUrl = $"/images/{uniqueFileName}";

                var listingImage = new ListingImage
                {
                    ListingId = request.ListingId,
                    ImageUrl = imageUrl
                };

                _context.ListingImages.Add(listingImage);
                uploadedImages.Add(imageUrl);
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Images uploaded successfully.",
                images = uploadedImages
            });
        }



    }
}
