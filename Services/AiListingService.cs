using Marketplace_capstone_feature_01.DTOs;
using Marketplace_capstone_feature_01.Interfaces;
using OpenAI.Chat;

namespace Marketplace_capstone_feature_01.Services
{
    public class AiListingService : IAiListingService
    {
        private readonly ChatClient _chatClient;

        public AiListingService(IConfiguration configuration)
        {
            string apiKey =
                configuration["OpenAI:ApiKey"]
                ?? throw new InvalidOperationException(
                    "OpenAI API key is missing."
                );

            string model =
                configuration["OpenAI:Model"]
                ?? "gpt-5-mini";

            _chatClient = new ChatClient(
                model: model,
                apiKey: apiKey
            );
        }

        public async Task<string> GenerateDescriptionAsync(
            GenerateListingDescriptionDto request
        )
        {
            string category =
                string.IsNullOrWhiteSpace(request.CategoryName)
                    ? "Not provided"
                    : request.CategoryName.Trim();

            string condition =
                string.IsNullOrWhiteSpace(request.Condition)
                    ? "Not provided"
                    : request.Condition.Trim();

            string location =
                string.IsNullOrWhiteSpace(request.Location)
                    ? "Not provided"
                    : request.Location.Trim();

            string details =
                string.IsNullOrWhiteSpace(request.KeyDetails)
                    ? "No additional details"
                    : request.KeyDetails.Trim();

            string existingDescription =
                string.IsNullOrWhiteSpace(request.ExistingDescription)
                    ? "None"
                    : request.ExistingDescription.Trim();

            string price = request.Price.HasValue
                ? $"${request.Price.Value:0.00} CAD"
                : "Not provided";

            string prompt = $"""
                Write a clear and appealing description for a student
                marketplace listing.

                Listing details:
                Title: {request.Title.Trim()}
                Category: {category}
                Condition: {condition}
                Price: {price}
                Location: {location}
                Key details: {details}
                Existing description: {existingDescription}

                Rules:
                - Write 60 to 110 words.
                - Use a friendly and trustworthy tone.
                - Do not invent specifications.
                - Do not include phone numbers, email addresses,
                  headings, hashtags, or quotation marks.
                - Mention pickup only when the provided details support it.
                - Tell buyers to confirm important details with the seller.
                - Return only the description.
                """;

            ChatCompletion completion =
                await _chatClient.CompleteChatAsync(prompt);

            string? description = completion.Content
                .FirstOrDefault()
                ?.Text
                ?.Trim();

            if (string.IsNullOrWhiteSpace(description))
            {
                throw new InvalidOperationException(
                    "The AI returned an empty description."
                );
            }

            return description.Length > 1000
                ? description[..1000]
                : description;
        }
    }
}