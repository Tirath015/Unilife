import { API_BASE_URL, STORAGE_KEYS } from "./config";

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

function buildHeaders(isFormData = false) {
  const token = localStorage.getItem(STORAGE_KEYS.token);
  const headers = {};

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

export async function apiRequest(path, options = {}) {
  const {
    method = "GET",
    body,
    isFormData = false,
    headers: customHeaders,
    ...rest
  } = options;

  const requestHeaders = {
    ...buildHeaders(isFormData),
    ...customHeaders,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: requestHeaders,
      body: isFormData
        ? body
        : body !== undefined
          ? JSON.stringify(body)
          : undefined,
      ...rest,
    });

    const contentType = response.headers.get("content-type") || "";

    let payload = null;

    if (contentType.includes("application/json")) {
      payload = await response.json();
    } else {
      payload = await response.text();
    }

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem(STORAGE_KEYS.token);
        localStorage.removeItem(STORAGE_KEYS.user);
      }

      let message = "Something went wrong while calling the API.";

      if (typeof payload === "string" && payload.trim()) {
        message = payload;
      } else if (payload?.message) {
        message = payload.message;
      } else if (payload?.title) {
        message = payload.title;
      } else if (payload?.errors) {
        message = Object.values(payload.errors)
          .flat()
          .filter(Boolean)
          .join(" ");
      }

      console.error("API request failed:", {
        url: `${API_BASE_URL}${path}`,
        method,
        status: response.status,
        payload,
      });

      throw new ApiError(message, response.status, payload);
    }

    return payload;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    console.error("Network request failed:", {
      url: `${API_BASE_URL}${path}`,
      method,
      error,
    });

    throw new ApiError(
      "Unable to connect to the server. Make sure the backend is running.",
      0,
      error
    );
  }
}