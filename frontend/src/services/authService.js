import { apiRequest } from "../api/httpClient";
import { STORAGE_KEYS, USE_MOCKS } from "../api/config";
import { delay } from "./mockHelpers";

const MOCK_USERS_KEY = "unilife_mock_users";

const mockAdminUser = {
  id: 999,
  fullName: "Admin User",
  email: "admin@college.ca",
  password: "Password123!",
  studentId: "ADMIN001",
  campus: "Main Campus",
  program: "Platform Management",
  role: "admin",
  status: "Active",
  photoUrl: "",
};

function getMockUsers() {
  const savedUsers = localStorage.getItem(MOCK_USERS_KEY);
  const users = savedUsers ? JSON.parse(savedUsers) : [];

  const hasAdmin = users.some(
    (user) => user.email?.toLowerCase() === mockAdminUser.email.toLowerCase()
  );

  if (!hasAdmin) {
    const updatedUsers = [mockAdminUser, ...users];
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(updatedUsers));
    return updatedUsers;
  }

  return users;
}

function saveMockUsers(users) {
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
}

function removePassword(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

export const authService = {
  async login(credentials) {
    if (USE_MOCKS) {
      const email = credentials.email?.toLowerCase().trim();
      const password = credentials.password;

      const users = getMockUsers();

      const matchedUser = users.find(
        (user) =>
          user.email?.toLowerCase().trim() === email &&
          user.password === password
      );

      if (!matchedUser) {
        throw new Error("Invalid email or password.");
      }

      if (matchedUser.status === "Blocked") {
        throw new Error("This account is blocked. Please contact admin.");
      }

      const safeUser = removePassword(matchedUser);

      const response = {
        token:
          safeUser.role === "admin"
            ? "mock-admin-jwt-token"
            : "mock-user-jwt-token",
        user: safeUser,
      };

      localStorage.setItem(STORAGE_KEYS.token, response.token);
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(response.user));

      return delay(response);
    }

    const response = await apiRequest("/auth/login", {
      method: "POST",
      body: credentials,
    });

    localStorage.setItem(STORAGE_KEYS.token, response.token);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(response.user));

    return response;
  },

  async register(payload) {
    if (USE_MOCKS) {
      const users = getMockUsers();

      const email = payload.email?.toLowerCase().trim();

      const emailExists = users.some(
        (user) => user.email?.toLowerCase().trim() === email
      );

      if (emailExists) {
        throw new Error("An account with this email already exists.");
      }

      const newUser = {
        id: Date.now(),
        fullName: payload.fullName,
        email: payload.email,
        password: payload.password,
        studentId: payload.studentId,
        campus: payload.campus || "Main Campus",
        program: payload.program || "Computer Systems Technology",
        role: "student",
        status: "Active",
        photoUrl: "",
      };

      const updatedUsers = [newUser, ...users];
      saveMockUsers(updatedUsers);

      const safeUser = removePassword(newUser);

      const response = {
        token: "mock-user-jwt-token",
        user: safeUser,
      };

      localStorage.setItem(STORAGE_KEYS.token, response.token);
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(response.user));

      return delay(response);
    }

    const response = await apiRequest("/auth/register", {
      method: "POST",
      body: payload,
    });

    localStorage.setItem(STORAGE_KEYS.token, response.token);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(response.user));

    return response;
  },

  async getCurrentUser() {
    if (USE_MOCKS) {
      const stored = localStorage.getItem(STORAGE_KEYS.user);
      return delay(stored ? JSON.parse(stored) : null, 100);
    }

    return apiRequest("/auth/me");
  },

  logout() {
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.user);
  },
};