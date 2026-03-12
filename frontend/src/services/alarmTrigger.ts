// Alarm trigger service — plays sounds and/or sends browser notifications.

import { getAlarmPreferences, AlarmSound } from './alarmPreferences';

// ---- Sound synthesis via Web Audio API -----------------------------------

let audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

function playBeep(volume: number) {
  const ctx = getAudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = 880;
  gain.gain.value = volume;
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  // beep-beep pattern
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.setValueAtTime(0, ctx.currentTime + 0.15);
  gain.gain.setValueAtTime(volume, ctx.currentTime + 0.25);
  gain.gain.setValueAtTime(0, ctx.currentTime + 0.4);
  osc.stop(ctx.currentTime + 0.5);
}

function playSiren(volume: number) {
  const ctx = getAudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  gain.gain.value = volume * 0.6;
  osc.connect(gain).connect(ctx.destination);
  osc.frequency.setValueAtTime(400, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.5);
  osc.frequency.linearRampToValueAtTime(400, ctx.currentTime + 1.0);
  osc.start();
  osc.stop(ctx.currentTime + 1.0);
}

function playChime(volume: number) {
  const ctx = getAudioCtx();
  const notes = [523, 659, 784]; // C5, E5, G5
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    gain.gain.value = volume * 0.7;
    osc.frequency.value = freq;
    osc.connect(gain).connect(ctx.destination);
    const t = ctx.currentTime + i * 0.2;
    osc.start(t);
    gain.gain.setValueAtTime(volume * 0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    osc.stop(t + 0.4);
  });
}

const soundPlayers: Record<AlarmSound, (v: number) => void> = {
  beep: playBeep,
  siren: playSiren,
  chime: playChime,
};

// ---- Browser notification ------------------------------------------------

async function sendNotification(distanceM: number, radiusM: number) {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'default') {
    await Notification.requestPermission();
  }
  if (Notification.permission === 'granted') {
    new Notification('🔔 Proximity Alarm', {
      body: `You are ${Math.round(distanceM)} m from the alarm point (radius ${radiusM} m)`,
      icon: '/assets/favicon.png',
    });
  }
}

// ---- Public API ----------------------------------------------------------

let lastFired = 0;
const COOLDOWN_MS = 3000; // prevent spam

export function fireAlarm(distanceM: number, radiusM: number): void {
  const now = Date.now();
  if (now - lastFired < COOLDOWN_MS) return;
  lastFired = now;

  const prefs = getAlarmPreferences();

  if (prefs.mode === 'sound' || prefs.mode === 'both') {
    soundPlayers[prefs.sound](prefs.volume);
  }

  if (prefs.mode === 'notification' || prefs.mode === 'both') {
    sendNotification(distanceM, radiusM);
  }
}

export function stopAlarm(): void {
  // Close audio context to stop any lingering sounds
  if (audioCtx) {
    audioCtx.close().catch(() => {});
    audioCtx = null;
  }
}
