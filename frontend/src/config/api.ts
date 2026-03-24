import { Platform } from 'react-native';

const apiBaseUrlFromEnvironment = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

function getDefaultApiBaseUrl() {
  if (Platform.OS === 'web') {
    return 'http://localhost:8000';
  }

  // Android emulator uses 10.0.2.2 to reach host machine's localhost.
  // For physical devices, set EXPO_PUBLIC_API_BASE_URL to the deployed backend.
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000';
  }

  // iOS simulator can use localhost
  return 'http://localhost:8000';
}

export function getApiBaseUrl() {
  return apiBaseUrlFromEnvironment || getDefaultApiBaseUrl();
}
