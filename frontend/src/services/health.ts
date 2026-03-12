import { getApiBaseUrl } from '../config/api';

export type BackendHealth = {
  status: string;
};

export async function fetchBackendHealth(signal?: AbortSignal): Promise<BackendHealth> {
  const apiBaseUrl = getApiBaseUrl();

  if (!apiBaseUrl) {
    throw new Error(
      'Backend URL is not configured. Set EXPO_PUBLIC_API_BASE_URL before starting Expo.',
    );
  }

  const response = await fetch(`${apiBaseUrl}/health`, {
    headers: {
      Accept: 'application/json',
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Backend health request failed with status ${response.status}.`);
  }

  return (await response.json()) as BackendHealth;
}
