import { apiRequest } from "../api/httpClient";

export const marketplaceTransactionService = {
  async expressInterest(listingId) {
    if (!listingId) {
      throw new Error("Listing ID is required.");
    }

    return apiRequest(
      `/MarketplaceTransactions/listing/${listingId}/interested`,
      {
        method: "POST",
      }
    );
  },

  async getInterestedBuyers(listingId) {
    if (!listingId) {
      throw new Error("Listing ID is required.");
    }

    return apiRequest(
      `/MarketplaceTransactions/listing/${listingId}/interested-buyers`
    );
  },

  async acceptBuyer(transactionId) {
    if (!transactionId) {
      throw new Error("Transaction ID is required.");
    }

    return apiRequest(
      `/MarketplaceTransactions/${transactionId}/accept`,
      {
        method: "PATCH",
      }
    );
  },

  async sellerComplete(transactionId) {
    if (!transactionId) {
      throw new Error("Transaction ID is required.");
    }

    return apiRequest(
      `/MarketplaceTransactions/${transactionId}/seller-complete`,
      {
        method: "PATCH",
      }
    );
  },

  async buyerConfirm(transactionId) {
    if (!transactionId) {
      throw new Error("Transaction ID is required.");
    }

    return apiRequest(
      `/MarketplaceTransactions/${transactionId}/buyer-confirm`,
      {
        method: "PATCH",
      }
    );
  },

  async cancelTransaction(transactionId) {
    if (!transactionId) {
      throw new Error("Transaction ID is required.");
    }

    return apiRequest(
      `/MarketplaceTransactions/${transactionId}/cancel`,
      {
        method: "PATCH",
      }
    );
  },

  async getMyTransactions() {
    return apiRequest("/MarketplaceTransactions/my");
  },
};