import { apiRequest } from "../../api/httpClient";

export const adminLocalService = {
  // Dashboard
  async getOverview() {
    return {
      users: 0,
      listings: 0,
      reports: 0,
    };
  },

  // Listings
  async getListings() {
    return apiRequest("/Listing");
  },

  // Users
  async getUsers() {
    return apiRequest("/Users");
  },

  // Reports (legacy compatibility)
  async getReports() {
    return apiRequest("/Reports/admin");
  },

  async updateReport(reportId, data) {
    return apiRequest(`/Reports/${reportId}/status`, {
      method: "PATCH",
      body: {
        status: Number(data.status),
      },
    });
  },

  async deleteReport(reportId) {
    return apiRequest(`/Reports/${reportId}`, {
      method: "DELETE",
    });
  },
};

export default adminLocalService;