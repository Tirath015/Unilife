import { apiRequest } from '../api/httpClient';
import { USE_MOCKS } from '../api/config';
import { jobs } from '../data/mockData';
import { delay } from './mockHelpers';

export const jobsService = {
  async getJobs(params = {}) {
    if (USE_MOCKS) {
      const q = (params.query || '').toLowerCase();
      const type = params.type || 'All';
      let result = jobs.filter((job) => {
        const matchesQuery = !q || `${job.title} ${job.company} ${job.skills.join(' ')}`.toLowerCase().includes(q);
        const matchesType = type === 'All' || job.type === type;
        return matchesQuery && matchesType;
      });
      return delay(result);
    }
    const search = new URLSearchParams(params).toString();
    return apiRequest(`/jobs?${search}`);
  },
};
