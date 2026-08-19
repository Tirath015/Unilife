import { apiRequest } from "../api/httpClient";

export const listingService = {
  // Get all listings
  async getListings() {
    return apiRequest("/Listing");
  },

  // Get single listing
  async getListing(id) {
    return apiRequest(`/Listing/${id}`);
  },

  // Alias (if other pages use getListingById)
  async getListingById(id) {
    return apiRequest(`/Listing/${id}`);
  },

  // Search listings
  async searchListings(filters = {}) {
    const query = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        query.append(key, value);
      }
    });

    return apiRequest(`/Listing/search?${query.toString()}`);
  },

  // Create listing
  async createListing(formData) {
    return apiRequest("/Listing", {
      method: "POST",
      body: formData,
      isFormData: true,
    });
  },

  // Get current user's listings
  async getMyListings() {
    return apiRequest("/Listing/my");
  },

  // Update listing
  async updateListing(id, data) {
    return apiRequest(`/Listing/${id}`, {
      method: "PUT",
      body: data,
    });
  },

  // Delete listing
  async deleteListing(id) {
    return apiRequest(`/Listing/${id}`, {
      method: "DELETE",
    });
  },

  // Get categories
 async getCategories() {
  return apiRequest("/Categories");
},

  // Similar listings
  async getSimilarListings(id) {
    return apiRequest(`/Listing/${id}/similar`);
  },

  // Trending
  async getTrendingListings() {
    return apiRequest("/Listing/trending");
  },

  // New listings
  async getNewestListings() {
    return apiRequest("/Listing/new");
  },

  // Recommendations
  async getRecommendations() {
    return apiRequest("/Listing/recommended-for-you");
  },

  // Nearby listings
  async getNearbyListings(latitude, longitude, radiusKm = 10) {
    return apiRequest(
      `/Listing/nearby?latitude=${latitude}&longitude=${longitude}&radiusKm=${radiusKm}`
    );
  },

  async updateListingStatus(id, status) {
  return apiRequest(`/Listing/${id}/status`, {
    method: "PATCH",
    body: {
      status: Number(status),
    },
  });
},
};