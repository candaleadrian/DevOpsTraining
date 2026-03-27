import axios from 'axios';
import { Platform } from 'react-native';
import { getApiBaseUrl } from '../config/api';

const API = axios.create({ baseURL: getApiBaseUrl() ?? '' });

export interface AuthUser {
  id: number;
  email: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

// ---------------------------------------------------------------------------
// Token persistence (localStorage on web, AsyncStorage on native)
// ---------------------------------------------------------------------------

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

async function getStorageItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  }
  const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
  return AsyncStorage.getItem(key);
}

async function setStorageItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
    return;
  }
  const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
  await AsyncStorage.setItem(key, value);
}

async function removeStorageItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem(key);
    return;
  }
  const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
  await AsyncStorage.removeItem(key);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function getStoredToken(): Promise<string | null> {
  return getStorageItem(TOKEN_KEY);
}

export async function getStoredUser(): Promise<AuthUser | null> {
  const raw = await getStorageItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

async function persistAuth(data: AuthResponse): Promise<void> {
  await setStorageItem(TOKEN_KEY, data.access_token);
  await setStorageItem(USER_KEY, JSON.stringify(data.user));
}

export async function register(email: string, password: string): Promise<AuthResponse> {
  const r = await API.post<AuthResponse>('/auth/register', { email, password });
  await persistAuth(r.data);
  return r.data;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const r = await API.post<AuthResponse>('/auth/login', { email, password });
  await persistAuth(r.data);
  return r.data;
}

export async function logout(): Promise<void> {
  await removeStorageItem(TOKEN_KEY);
  await removeStorageItem(USER_KEY);
}
