import { apiRequest } from "../api/httpClient";

export const aiListingService = {
  async generateDescription(data) {
    return apiRequest("/AiListing/generate-description", {
      method: "POST",
      body: data,
    });
  },
};