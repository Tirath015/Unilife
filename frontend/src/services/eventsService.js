import { apiRequest } from '../api/httpClient';
import { USE_MOCKS } from '../api/config';
import { events } from '../data/mockData';
import { delay } from './mockHelpers';

export const eventsService = {
  async getEvents() {
    if (USE_MOCKS) return delay(events);
    return apiRequest('/events');
  },

  async register(eventId) {
    if (USE_MOCKS) return delay({ eventId, registered: true });
    return apiRequest(`/events/${eventId}/register`, { method: 'POST' });
  },
};
