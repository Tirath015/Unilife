import { apiRequest } from "../../api/httpClient";

export const adminReportService = {
  getReports() {
    return apiRequest("/Reports/admin");
  },

  updateStatus(reportId, status) {
    return apiRequest(`/Reports/${reportId}/status`, {
      method: "PATCH",
      body: {
        status: Number(status),
      },
    });
  },
};