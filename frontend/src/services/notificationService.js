import { apiRequest } from "../api/httpClient";

export const notificationService = {
  getNotifications() {
    return apiRequest("/Notifications");
  },

  markAsRead(notificationId) {
    return apiRequest(`/Notifications/${notificationId}/read`, {
      method: "PUT",
    });
  },
};