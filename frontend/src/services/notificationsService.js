import { apiRequest } from '../api/httpClient';
import { USE_MOCKS } from '../api/config';
import { notifications } from '../data/mockData';
import { delay } from './mockHelpers';

export const notificationsService = {
  async getNotifications() {
    if (USE_MOCKS) return delay(notifications);
    return apiRequest('/notifications');
  },

  async markAllRead() {
    if (USE_MOCKS) return delay({ success: true });
    return apiRequest('/notifications/mark-all-read', { method: 'PATCH' });
  },
};
