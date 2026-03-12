import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { getApiBaseUrl } from '../config/api';
import { useBackendHealth } from '../hooks/useBackendHealth';
import { MainTabParamList, RootStackParamList } from '../navigation/types';
import { InfoCard, ScreenLayout } from '../ui/ScreenLayout';
import { StatusBadge } from '../ui/StatusBadge';

type HomeScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function HomeScreen({ navigation }: HomeScreenProps) {
  const { data, error, isLoading, refresh } = useBackendHealth();
  const apiBaseUrl = getApiBaseUrl() ?? 'Set EXPO_PUBLIC_API_BASE_URL';

  const backendStatusLabel = isLoading
    ? 'Checking'
    : error
      ? 'Unavailable'
      : data?.status ?? 'Unknown';

  const backendStatusTone = isLoading
    ? 'loading'
    : error
      ? 'error'
      : 'healthy';

  return (
    <ScreenLayout
      eyebrow="Dashboard"
      title="Control Center"
      description="This home screen is now connected to the backend health endpoint. That matters because it proves the mobile app can call a real service instead of staying as a static UI exercise."
      footer={
        <View style={styles.footerActions}>
          <Pressable onPress={() => void refresh()} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Refresh Backend Status</Text>
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate('AlarmDetail', { alarmId: 'demo-alarm-1' })}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Open Sample Alarm Detail</Text>
          </Pressable>
        </View>
      }
    >
      <View style={styles.statusPanel}>
        <Text style={styles.statusLabel}>Backend health</Text>
        <StatusBadge label={backendStatusLabel} tone={backendStatusTone} />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
      <InfoCard label="API base URL" value={apiBaseUrl} />
      <InfoCard label="Current milestone" value="Frontend to backend connectivity check" />
      <InfoCard
        label="Why this is first"
        value="A health call is the smallest safe integration point. It verifies networking, configuration, and async UI state before feature-specific API work begins."
      />
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Professional reasoning</Text>
        <Text style={styles.bannerBody}>
          Teams usually integrate a simple endpoint first because it isolates infrastructure and configuration problems before business endpoints and data models make debugging harder.
        </Text>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  statusPanel: {
    backgroundColor: '#fffdf8',
    borderColor: '#e7d8c9',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  statusLabel: {
    color: '#8a5a44',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  errorText: {
    color: '#8b2e2e',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  },
  banner: {
    backgroundColor: '#24313d',
    borderRadius: 18,
    padding: 18,
  },
  bannerTitle: {
    color: '#f7f4ee',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  bannerBody: {
    color: '#d8e2eb',
    fontSize: 15,
    lineHeight: 22,
  },
  footerActions: {
    gap: 12,
  },
  button: {
    backgroundColor: '#8a5a44',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  buttonText: {
    color: '#fffaf5',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: '#e9dccf',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  secondaryButtonText: {
    color: '#5f4335',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
});