const mockStorage: Record<string, string> = {};

// Mock localStorage for Node test environment
beforeEach(() => {
  Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
  (global as any).localStorage = {
    getItem: jest.fn((key: string) => mockStorage[key] ?? null),
    setItem: jest.fn((key: string, val: string) => {
      mockStorage[key] = val;
    }),
    removeItem: jest.fn((key: string) => {
      delete mockStorage[key];
    }),
  };
});

import {
  getAlarmPreferences,
  setAlarmPreferences,
  subscribeAlarmPreferences,
} from '../alarmPreferences';

describe('alarmPreferences', () => {
  test('getAlarmPreferences returns defaults when nothing stored', () => {
    const prefs = getAlarmPreferences();
    expect(prefs).toEqual({
      mode: 'both',
      sound: 'beep',
      volume: 0.8,
    });
  });

  test('setAlarmPreferences persists to localStorage', () => {
    setAlarmPreferences({ sound: 'siren' });
    expect(localStorage.setItem).toHaveBeenCalled();
    const stored = JSON.parse(mockStorage['alarm_preferences']);
    expect(stored.sound).toBe('siren');
    expect(stored.mode).toBe('both'); // merged with defaults
  });

  test('getAlarmPreferences reads back stored values', () => {
    setAlarmPreferences({ volume: 0.5, mode: 'notification' });
    const prefs = getAlarmPreferences();
    expect(prefs.volume).toBe(0.5);
    expect(prefs.mode).toBe('notification');
    expect(prefs.sound).toBe('beep'); // still the default
  });

  test('subscribeAlarmPreferences fires listener on change', () => {
    const listener = jest.fn();
    const unsub = subscribeAlarmPreferences(listener);

    setAlarmPreferences({ sound: 'chime' });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ sound: 'chime' }),
    );

    unsub();
    setAlarmPreferences({ sound: 'beep' });
    expect(listener).toHaveBeenCalledTimes(1); // not called again after unsub
  });

  test('getAlarmPreferences handles corrupted localStorage gracefully', () => {
    mockStorage['alarm_preferences'] = '{{invalid json}}';
    const prefs = getAlarmPreferences();
    expect(prefs).toEqual({ mode: 'both', sound: 'beep', volume: 0.8 });
  });
});
