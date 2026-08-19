import { apiRequest } from "../api/httpClient";

export const messageService = {
  sendMessage(messageData) {
    return apiRequest("/Messages", {
      method: "POST",
      body: messageData,
    });
  },

  getInbox() {
    return apiRequest("/Messages/inbox");
  },

  getConversation(otherUserId, listingId) {
    const query = new URLSearchParams({
      otherUserId: String(otherUserId),
      listingId: String(listingId),
    });

    return apiRequest(
      `/Messages/conversation?${query.toString()}`
    );
  },

  markAsRead(messageId) {
    return apiRequest(`/Messages/${messageId}/read`, {
      method: "PUT",
    });
  },
};