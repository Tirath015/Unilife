import { apiRequest } from "../api/httpClient";

export const adminService = {
  getUsers() {
    return apiRequest("/Admin/users");
  },

  getListings() {
    return apiRequest("/Admin/listings");
  },

  getDashboard() {
    return apiRequest("/Admin/dashboard");
  },

  getReports() {
    return apiRequest("/Admin/reports");
  },

  getStatistics() {
    return apiRequest("/Admin/statistics");
  },

  deleteUser(id) {
    return apiRequest(`/Admin/users/${id}`, {
      method: "DELETE",
    });
  },

  deleteListing(id) {
    return apiRequest(`/Admin/listings/${id}`, {
      method: "DELETE",
    });
  },

  blockUser(id) {
    return apiRequest(`/Admin/users/${id}/block`, {
      method: "PUT",
    });
  },

  unblockUser(id) {
    return apiRequest(`/Admin/users/${id}/unblock`, {
      method: "PUT",
    });
  },

  reviewReport(id, payload = {}) {
    return apiRequest(`/Admin/reports/${id}/review`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  deleteReport(id) {
    return apiRequest(`/Admin/reports/${id}`, {
      method: "DELETE",
    });
  },
};