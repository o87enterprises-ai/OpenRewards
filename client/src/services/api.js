import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('openrewards_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authAPI = {
  register: (email, password) => api.post('/auth/register', { email, password }),
  login: (email, password) => api.post('/auth/login', { email, password }),
};

export const rewardsAPI = {
  getConfig: () => api.get('/rewards/config'),
  getStatus: () => api.get('/rewards/status'),
  optIn: () => api.post('/rewards/opt-in'),
  optOut: () => api.post('/rewards/opt-out'),
  startImpressionSession: (adId, zone) => api.post('/rewards/impression-session', { adId, zone }),
  earn: (sessionId, visibleMs) => api.post('/rewards/earn', { sessionId, visibleMs }),
  getLedger: (limit = 20) => api.get('/rewards/ledger', { params: { limit } }),
  getPayouts: () => api.get('/rewards/payouts'),
  requestPayout: (method, destination) => api.post('/rewards/payout-request', { method, destination }),
};

export default api;
