import { Platform } from 'react-native';

const apiBaseUrlFromEnvironment = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

function getDefaultApiBaseUrl() {
  if (Platform.OS === 'web') {
    return 'http://localhost:8000';
  }

  return null;
}

export function getApiBaseUrl() {
  return apiBaseUrlFromEnvironment || getDefaultApiBaseUrl();
}
