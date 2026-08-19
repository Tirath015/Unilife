import { apiRequest } from "../api/httpClient";

export const userService = {
  async getMyProfile() {
    return apiRequest("/User/profile");
  },

  async updateMyProfile(profileData) {
    return apiRequest("/User/profile", {
      method: "PUT",
      body: profileData,
    });
  },
};