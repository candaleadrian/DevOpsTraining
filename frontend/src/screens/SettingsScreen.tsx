import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ScreenLayout } from '../ui/ScreenLayout';
import {
  AlarmMode,
  AlarmSound,
  getAlarmPreferences,
  setAlarmPreferences,
  subscribeAlarmPreferences,
  AlarmPreferences,
} from '../services/alarmPreferences';
import { fireAlarm } from '../services/alarmTrigger';

const MODES: { value: AlarmMode; label: string }[] = [
  { value: 'notification', label: '🔔 Notification' },
  { value: 'sound', label: '🔊 Sound' },
  { value: 'both', label: '🔔+🔊 Both' },
];

const SOUNDS: { value: AlarmSound; label: string }[] = [
  { value: 'beep', label: 'Beep' },
  { value: 'siren', label: 'Siren' },
  { value: 'chime', label: 'Chime' },
];

const VOLUMES = [0.2, 0.4, 0.6, 0.8, 1.0];

export function SettingsScreen() {
  const [prefs, setPrefs] = useState<AlarmPreferences>(getAlarmPreferences);

  useEffect(() => subscribeAlarmPreferences(setPrefs), []);

  const update = (partial: Partial<AlarmPreferences>) => setAlarmPreferences(partial);

  return (
    <ScreenLayout
      eyebrow="Settings"
      title="Alarm Preferences"
      description="Choose how the proximity alarm notifies you when you enter the radius."
    >
      {/* Alarm mode */}
      <Text style={s.sectionTitle}>Alarm mode</Text>
      <View style={s.row}>
        {MODES.map((m) => (
          <Pressable
            key={m.value}
            style={[s.chip, prefs.mode === m.value && s.chipActive]}
            onPress={() => update({ mode: m.value })}
          >
            <Text style={[s.chipText, prefs.mode === m.value && s.chipTextActive]}>
              {m.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Sound picker */}
      <Text style={s.sectionTitle}>Alarm sound</Text>
      <View style={s.row}>
        {SOUNDS.map((snd) => (
          <Pressable
            key={snd.value}
            style={[s.chip, prefs.sound === snd.value && s.chipActive]}
            onPress={() => update({ sound: snd.value })}
          >
            <Text style={[s.chipText, prefs.sound === snd.value && s.chipTextActive]}>
              {snd.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Volume */}
      <Text style={s.sectionTitle}>Volume</Text>
      <View style={s.row}>
        {VOLUMES.map((v) => (
          <Pressable
            key={v}
            style={[s.chip, prefs.volume === v && s.chipActive]}
            onPress={() => update({ volume: v })}
          >
            <Text style={[s.chipText, prefs.volume === v && s.chipTextActive]}>
              {Math.round(v * 100)}%
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Test button */}
      <Text style={s.sectionTitle}>Test</Text>
      <Pressable style={s.testBtn} onPress={() => fireAlarm(100, 500)}>
        <Text style={s.testBtnText}>🔔 Test Alarm</Text>
      </Pressable>
    </ScreenLayout>
  );
}

const s = StyleSheet.create({
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#8a5a44', marginTop: 18, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#e7d8c9' },
  chipActive: { backgroundColor: '#8a5a44' },
  chipText: { fontSize: 14, color: '#1f2a37', fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  testBtn: { marginTop: 8, backgroundColor: '#8a5a44', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  testBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});