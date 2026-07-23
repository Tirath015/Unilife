import { API_BASE_URL, STORAGE_KEYS } from './config';

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

function buildHeaders(isFormData = false) {
  const token = localStorage.getItem(STORAGE_KEYS.token);
  const headers = {};

  if (!isFormData) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  return headers;
}

export async function apiRequest(path, options = {}) {
  const { method = 'GET', body, isFormData = false, ...rest } = options;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: buildHeaders(isFormData),
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
    ...rest,
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem(STORAGE_KEYS.token);
      localStorage.removeItem(STORAGE_KEYS.user);
    }

    const message = payload?.message || payload?.title || 'Something went wrong while calling the API.';
    throw new ApiError(message, response.status, payload);
  }

  return payload;
}
