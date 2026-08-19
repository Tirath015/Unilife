import { apiRequest } from "../api/httpClient";
import { STORAGE_KEYS } from "../api/config";

function normalizeUser(user) {
  if (!user) {
    return null;
  }

  return {
    ...user,

    id: user.id ?? user.userId,
    userId: user.userId ?? user.id,

    role: user.role?.toLowerCase() || "user",

    photoUrl:
      user.photoUrl ??
      user.profileImageUrl ??
      "",
  };
}

function getStoredUser() {
  try {
    const storedUser = localStorage.getItem(STORAGE_KEYS.user);

    if (!storedUser) {
      return null;
    }

    return JSON.parse(storedUser);
  } catch (error) {
    console.error("Unable to read the stored user:", error);

    localStorage.removeItem(STORAGE_KEYS.user);
    localStorage.removeItem(STORAGE_KEYS.token);

    return null;
  }
}

export const authService = {
  async login(credentials) {
    const response = await apiRequest("/Auth/login", {
      method: "POST",
      body: {
        email: credentials.email?.trim(),
        password: credentials.password,
      },
    });

    if (!response?.token) {
      throw new Error("The server did not return a login token.");
    }

    const normalizedUser = normalizeUser(response.user);

    localStorage.setItem(STORAGE_KEYS.token, response.token);
    localStorage.setItem(
      STORAGE_KEYS.user,
      JSON.stringify(normalizedUser)
    );

    return {
      ...response,
      user: normalizedUser,
    };
  },

  async register(payload) {
    return apiRequest("/Auth/register", {
      method: "POST",
      body: {
        fullName: payload.fullName?.trim(),
        email: payload.email?.trim(),
        password: payload.password,
        phoneNumber: payload.phoneNumber?.trim() || null,
      },
    });
  },

  async verifyEmail(token) {
    const encodedToken = encodeURIComponent(token);

    return apiRequest(`/Auth/verify-email?token=${encodedToken}`, {
      method: "GET",
    });
  },

  async resendVerification(email) {
    return apiRequest("/Auth/resend-verification", {
      method: "POST",
      body: {
        email: email?.trim(),
      },
    });
  },

  async forgotPassword(email) {
    return apiRequest("/Auth/forgot-password", {
      method: "POST",
      body: {
        email: email?.trim(),
      },
    });
  },

  async resetPassword(payload) {
    return apiRequest("/Auth/reset-password", {
      method: "POST",
      body: {
        email: payload.email?.trim(),
        token: payload.token,
        newPassword: payload.newPassword,
      },
    });
  },

  async getCurrentUser() {
    const token = localStorage.getItem(STORAGE_KEYS.token);
    const user = getStoredUser();

    if (!token || !user) {
      return null;
    }

    return normalizeUser(user);
  },

  isAuthenticated() {
    return Boolean(localStorage.getItem(STORAGE_KEYS.token));
  },

  getToken() {
    return localStorage.getItem(STORAGE_KEYS.token);
  },

  logout() {
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.user);
  },
};