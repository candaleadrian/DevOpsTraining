// Alarm preferences stored in localStorage (web) with reactive listeners.

export type AlarmMode = 'notification' | 'sound' | 'both';

export type AlarmSound = 'beep' | 'siren' | 'chime';

export interface AlarmPreferences {
  mode: AlarmMode;
  sound: AlarmSound;
  volume: number; // 0–1
}

const STORAGE_KEY = 'alarm_preferences';

const defaults: AlarmPreferences = {
  mode: 'both',
  sound: 'beep',
  volume: 0.8,
};

type Listener = (prefs: AlarmPreferences) => void;
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
