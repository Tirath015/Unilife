import { apiRequest } from '../api/httpClient';
import { USE_MOCKS } from '../api/config';
import { resources } from '../data/mockData';
import { delay } from './mockHelpers';

export const resourcesService = {
  async getResources() {
    if (USE_MOCKS) return delay(resources);
    return apiRequest('/resources');
  },
};
