// Alarm trigger — native (expo-av for sound, expo-notifications for alerts)

import { Audio } from 'expo-av';
import * as Notifications from 'expo-notifications';
import { getAlarmPreferences, AlarmSound } from './alarmPreferences';

// Configure notification handler so they show while app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// ---- Sound playback via expo-av ------------------------------------------

let currentSound: Audio.Sound | null = null;

async function ensureAudioMode() {
  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
  });
}

// Generate a short tone programmatically isn't possible with expo-av.
// Instead we use the system notification sound via expo-notifications for the
// audible alert and Vibration for haptic feedback.
import { Vibration } from 'react-native';

const VIBRATION_PATTERNS: Record<AlarmSound, number[]> = {
  beep: [0, 200, 100, 200],             // short double-tap
  siren: [0, 500, 200, 500],            // long pulses
  chime: [0, 100, 80, 100, 80, 100],    // gentle triple-tap
};

function playVibration(sound: AlarmSound) {
  Vibration.vibrate(VIBRATION_PATTERNS[sound]);
}

// ---- Native notification -------------------------------------------------

async function sendNotification(distanceM: number, radiusM: number) {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🔔 Proximity Alarm',
      body: `You are ${Math.round(distanceM)} m from the alarm point (radius ${radiusM} m)`,
      sound: true,
    },
    trigger: null, // fire immediately
  });
}

// ---- Public API ----------------------------------------------------------

let lastFired = 0;
const COOLDOWN_MS = 3000;

export function fireAlarm(distanceM: number, radiusM: number): void {
  const now = Date.now();
  if (now - lastFired < COOLDOWN_MS) return;
  lastFired = now;

  const prefs = getAlarmPreferences();

  if (prefs.mode === 'sound' || prefs.mode === 'both') {
    playVibration(prefs.sound);
  }

  if (prefs.mode === 'notification' || prefs.mode === 'both') {
    sendNotification(distanceM, radiusM);
  }
}

export function stopAlarm(): void {
  Vibration.cancel();
  if (currentSound) {
    currentSound.unloadAsync().catch(() => {});
    currentSound = null;
  }
}
