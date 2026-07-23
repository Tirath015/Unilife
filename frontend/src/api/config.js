export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false';

export const STORAGE_KEYS = {
  token: 'unilife_token',
  user: 'unilife_user',
};
