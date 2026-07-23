import { apiRequest } from '../api/httpClient';
import { USE_MOCKS } from '../api/config';
import { delay } from './mockHelpers';

function mockReply(message) {
  const text = message.toLowerCase();
  if (text.includes('market') || text.includes('sell') || text.includes('listing')) {
    return 'You can open Marketplace, choose Post Listing, add product details, then submit. The backend will save it using the Marketplace API.';
  }
  if (text.includes('event')) return 'Campus Events shows upcoming events and registration buttons. In the final app, registrations will come from the Events API.';
  if (text.includes('job')) return 'Student Jobs can later connect to a Jobs API or career services feed.';
  return 'I can help with marketplace listings, campus resources, events, notifications, and common student questions.';
}

export const brunoService = {
  async ask(message) {
    if (USE_MOCKS) return delay({ reply: mockReply(message) }, 500);
    return apiRequest('/bruno/chat', {
      method: 'POST',
      body: { message },
    });
  },
};
