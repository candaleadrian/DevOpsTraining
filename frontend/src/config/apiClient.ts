import axios from 'axios';
import { getApiBaseUrl } from './api';

/**
 * Shared Axios instance that automatically attaches the JWT auth header.
 * Import this in zonesApi, historyApi, etc. instead of creating separate instances.
 */
const apiClient = axios.create({ baseURL: getApiBaseUrl() ?? '' });

let _tokenGetter: (() => Promise<string | null>) | null = null;

/** Called once from AuthContext to wire up the token provider. */
export function setTokenGetter(fn: () => Promise<string | null>) {
  _tokenGetter = fn;
}

apiClient.interceptors.request.use(async (config) => {
  if (_tokenGetter) {
    const token = await _tokenGetter();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default apiClient;
