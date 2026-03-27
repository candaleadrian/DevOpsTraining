import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
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
import { useAuth } from '../context/AuthContext';

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

const RADIUS_STEPS = [10, 25, 50, 100, 250, 500];

export function SettingsScreen() {
  const [prefs, setPrefs] = useState<AlarmPreferences>(getAlarmPreferences);
  const { user, isGuest, logout } = useAuth();
  const navigation = useNavigation();

  useEffect(() => subscribeAlarmPreferences(setPrefs), []);

  const update = (partial: Partial<AlarmPreferences>) => setAlarmPreferences(partial);

  const handleLogout = async () => {
    await logout();
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: 'Auth' as never }] }),
    );
  };

  const handleSignIn = () => {
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: 'Auth' as never }] }),
    );
  };

  return (
    <ScreenLayout
      eyebrow="Settings"
      title="Alarm Preferences"
      description="Choose how the proximity alarm notifies you when you enter the radius."
    >
      {/* Account */}
      <Text style={s.sectionTitle}>Account</Text>
      {isGuest ? (
        <View style={s.accountRow}>
          <Text style={s.accountText}>Guest mode (max 3 zones)</Text>
          <Pressable style={s.signInBtn} onPress={handleSignIn}>
            <Text style={s.signInBtnText}>Sign In</Text>
          </Pressable>
        </View>
      ) : (
        <View style={s.accountRow}>
          <Text style={s.accountText}>{user?.email}</Text>
          <Pressable style={s.logoutBtn} onPress={handleLogout}>
            <Text style={s.logoutBtnText}>Sign Out</Text>
          </Pressable>
        </View>
      )}

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

      {/* Radius step */}
      <Text style={s.sectionTitle}>Radius step</Text>
      <View style={s.row}>
        {RADIUS_STEPS.map((step) => (
          <Pressable
            key={step}
            style={[s.chip, prefs.radiusStep === step && s.chipActive]}
            onPress={() => update({ radiusStep: step })}
          >
            <Text style={[s.chipText, prefs.radiusStep === step && s.chipTextActive]}>
              {step} m
            </Text>
          </Pressable>
        ))}
        <Pressable
          style={[s.chip, !RADIUS_STEPS.includes(prefs.radiusStep) && s.chipActive]}
          onPress={() => {}}
        >
          <Text style={[s.chipText, !RADIUS_STEPS.includes(prefs.radiusStep) && s.chipTextActive]}>
            Custom
          </Text>
        </Pressable>
      </View>
      <View style={s.customRow}>
        <TextInput
          style={s.customInput}
          keyboardType="numeric"
          placeholder="Custom meters"
          value={!RADIUS_STEPS.includes(prefs.radiusStep) ? String(prefs.radiusStep) : ''}
          onChangeText={(text) => {
            const num = parseInt(text, 10);
            if (num > 0) update({ radiusStep: num });
          }}
        />
        <Text style={s.customUnit}>m</Text>
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
  accountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#e7d8c9' },
  accountText: { fontSize: 14, color: '#1f2a37', fontWeight: '600', flex: 1 },
  logoutBtn: { backgroundColor: '#dc2626', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  logoutBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  signInBtn: { backgroundColor: '#8a5a44', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  signInBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#e7d8c9' },
  chipActive: { backgroundColor: '#8a5a44' },
  chipText: { fontSize: 14, color: '#1f2a37', fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  customRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 },
  customInput: { borderWidth: 1, borderColor: '#c5a88a', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, width: 130, backgroundColor: '#fff' },
  customUnit: { fontSize: 14, fontWeight: '600', color: '#8a5a44' },
  testBtn: { marginTop: 8, backgroundColor: '#8a5a44', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  testBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});