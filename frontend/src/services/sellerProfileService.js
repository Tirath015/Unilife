import { apiRequest } from "../api/httpClient";

export const sellerProfileService = {
  async getSellerProfile(sellerId) {
    if (!sellerId) {
      throw new Error("Seller ID is required.");
    }

    return apiRequest(
      `/User/${sellerId}/marketplace-profile`
    );
  },
};