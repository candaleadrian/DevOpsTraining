// Alarm preferences stored via AsyncStorage (Android/iOS) with reactive listeners.
// Keeps a synchronous in-memory cache that is hydrated once at startup.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AlarmPreferences, ALARM_PREFERENCES_DEFAULTS, Listener } from './alarmPreferences.types';
export type { AlarmMode, AlarmSound, AlarmPreferences } from './alarmPreferences.types';

const STORAGE_KEY = 'alarm_preferences';
const defaults = ALARM_PREFERENCES_DEFAULTS;
const listeners = new Set<Listener>();

// In-memory cache so getAlarmPreferences() can stay synchronous
let cached: AlarmPreferences = { ...defaults };

// Hydrate on module load
AsyncStorage.getItem(STORAGE_KEY)
  .then((raw) => {
    if (raw) cached = { ...defaults, ...JSON.parse(raw) };
  })
  .catch(() => {});

export function getAlarmPreferences(): AlarmPreferences {
  return { ...cached };
}

export function setAlarmPreferences(prefs: Partial<AlarmPreferences>): void {
  cached = { ...cached, ...prefs };
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cached)).catch(() => {});
  listeners.forEach((fn) => fn({ ...cached }));
}

export function subscribeAlarmPreferences(fn: Listener): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}
