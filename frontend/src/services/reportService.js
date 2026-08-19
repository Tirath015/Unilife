import { apiRequest } from "../api/httpClient";

export const reportService = {
  async reportListing(listingId, reportData) {
    if (!listingId) {
      throw new Error("Listing ID is required.");
    }

    return apiRequest(`/Reports/listing/${listingId}`, {
      method: "POST",
      body: reportData,
    });
  },

  async reportUser(userId, reportData) {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    return apiRequest(`/Reports/user/${userId}`, {
      method: "POST",
      body: reportData,
    });
  },

  async getMyReports() {
    return apiRequest("/Reports/my");
  },
};