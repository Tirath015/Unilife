import { apiRequest } from '../api/httpClient';
import { USE_MOCKS } from '../api/config';
import { discussions } from '../data/mockData';
import { delay } from './mockHelpers';

export const discussionsService = {
  async getDiscussions() {
    if (USE_MOCKS) return delay(discussions);
    return apiRequest('/discussions');
  },

  async createDiscussion(payload) {
    if (USE_MOCKS) return delay({ id: Date.now(), ...payload, author: 'You', replies: 0, lastActive: 'Just now' });
    return apiRequest('/discussions', {
      method: 'POST',
      body: payload,
    });
  },
};
