import { apiRequest } from "../api/httpClient";

export const reviewService = {
  async createReview(reviewData) {
    return apiRequest("/Reviews", {
      method: "POST",
      body: reviewData,
    });
  },

  async getSellerReviews(sellerId) {
    if (!sellerId) {
      throw new Error("Seller ID is required.");
    }

    return apiRequest(`/Reviews/seller/${sellerId}`);
  },

  async getSellerSummary(sellerId) {
    if (!sellerId) {
      throw new Error("Seller ID is required.");
    }

    return apiRequest(`/Reviews/seller/${sellerId}/summary`);
  },

  async getMyReviews() {
    return apiRequest("/Reviews/my");
  },

  async updateReview(reviewId, reviewData) {
    if (!reviewId) {
      throw new Error("Review ID is required.");
    }

    return apiRequest(`/Reviews/${reviewId}`, {
      method: "PUT",
      body: reviewData,
    });
  },

  async deleteReview(reviewId) {
    if (!reviewId) {
      throw new Error("Review ID is required.");
    }

    return apiRequest(`/Reviews/${reviewId}`, {
      method: "DELETE",
    });
  },
};