// Alarm preferences stored in localStorage (web) with reactive listeners.

import { AlarmPreferences, ALARM_PREFERENCES_DEFAULTS, Listener } from './alarmPreferences.types';
export type { AlarmMode, AlarmSound, AlarmPreferences } from './alarmPreferences.types';

const STORAGE_KEY = 'alarm_preferences';
const defaults = ALARM_PREFERENCES_DEFAULTS;
const listeners = new Set<Listener>();

export function getAlarmPreferences(): AlarmPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaults, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { ...defaults };
}

export function setAlarmPreferences(prefs: Partial<AlarmPreferences>): void {
  const merged = { ...getAlarmPreferences(), ...prefs };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  listeners.forEach((fn) => fn(merged));
}

export function subscribeAlarmPreferences(fn: Listener): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}
