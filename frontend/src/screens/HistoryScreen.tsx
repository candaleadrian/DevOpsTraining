import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { historyApi, AlarmEvent } from '../services/historyApi';

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString();
}

export function HistoryScreen() {
  const [events, setEvents] = useState<AlarmEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await historyApi.list({ limit: 100 });
      setEvents(data);
    } catch (e) {
      console.error('Failed to load alarm history:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const clearHistory = useCallback(async () => {
    try {
      await historyApi.clear();
      setEvents([]);
    } catch (e) {
      console.error('Failed to clear history:', e);
    }
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#8a5a44" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Alarm History</Text>
        {events.length > 0 && (
          <Pressable style={styles.clearBtn} onPress={clearHistory}>
            <Text style={styles.clearBtnText}>Clear All</Text>
          </Pressable>
        )}
      </View>

      {events.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No alarm events yet.</Text>
          <Text style={styles.emptyHint}>Events will appear here when you enter or exit an alarm zone.</Text>
        </View>
      ) : (
        <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
          {events.map((ev) => (
            <View key={ev.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={[styles.badge, ev.event_type === 'entered' ? styles.badgeEntered : styles.badgeExited]}>
                  {ev.event_type === 'entered' ? '⚠ ENTERED' : '✓ EXITED'}
                </Text>
                <Text style={styles.timestamp}>{formatTime(ev.triggered_at)}</Text>
              </View>
              <Text style={styles.zoneName}>{ev.zone_name}</Text>
              <Text style={styles.detail}>
                Distance: {Math.round(ev.distance_meters)} m
              </Text>
              <Text style={styles.detail}>
                Position: {ev.latitude.toFixed(5)}, {ev.longitude.toFixed(5)}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}

      <Pressable style={styles.refreshBtn} onPress={loadEvents}>
        <Text style={styles.refreshBtnText}>Refresh</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f4ee' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  title: { fontSize: 20, fontWeight: '700', color: '#1f2a37' },
  clearBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#dc2626' },
  clearBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#1f2a37', marginBottom: 6 },
  emptyHint: { fontSize: 13, color: '#7a8793', textAlign: 'center' },
  list: { flex: 1 },
  listContent: { padding: 16, paddingTop: 4, gap: 10 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e7d8c9',
    gap: 4,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  badge: { fontSize: 12, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, overflow: 'hidden' },
  badgeEntered: { backgroundColor: '#fef2f2', color: '#dc2626' },
  badgeExited: { backgroundColor: '#f0fdf4', color: '#16a34a' },
  timestamp: { fontSize: 12, color: '#7a8793' },
  zoneName: { fontSize: 15, fontWeight: '700', color: '#1f2a37' },
  detail: { fontSize: 13, color: '#4b5563' },
  refreshBtn: {
    margin: 16,
    marginTop: 8,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#8a5a44',
    alignItems: 'center',
  },
  refreshBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
