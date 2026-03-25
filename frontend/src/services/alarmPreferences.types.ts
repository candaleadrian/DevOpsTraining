export type AlarmMode = 'notification' | 'sound' | 'both';

export type AlarmSound = 'beep' | 'siren' | 'chime';

export interface AlarmPreferences {
  mode: AlarmMode;
  sound: AlarmSound;
  volume: number; // 0–1
  radiusStep: number; // metres per tap on +/- buttons
}

export const ALARM_PREFERENCES_DEFAULTS: AlarmPreferences = {
  mode: 'both',
  sound: 'beep',
  volume: 0.8,
  radiusStep: 100,
};

export type Listener = (prefs: AlarmPreferences) => void;
