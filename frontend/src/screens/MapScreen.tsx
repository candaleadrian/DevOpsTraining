import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Animated } from 'react-native';
import { fireAlarm, stopAlarm } from '../services/alarmTrigger';
import { zonesApi, AlarmZone } from '../services/zonesApi';
import { historyApi } from '../services/historyApi';
import { watchPosition, clearWatch } from '../services/locationTracker';
import PlatformMap from '../components/PlatformMap';
import { ZONE_COLOURS, PlatformMapRef } from '../components/PlatformMap.types';
import LocationSearch from '../components/LocationSearch';

// Toast component for showing feedback
function Toast({ message, type, onDone }: { message: string; type: 'success' | 'error'; onDone: () => void }) {
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(1800),
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => onDone());
  }, []);
  return (
    <Animated.View style={[toastStyles.container, type === 'error' ? toastStyles.error : toastStyles.success, { opacity }]}>
      <Text style={toastStyles.text}>{type === 'success' ? '✓' : '✕'} {message}</Text>
    </Animated.View>
  );
}

const toastStyles = StyleSheet.create({
  container: { position: 'absolute', top: 12, left: 20, right: 20, padding: 12, borderRadius: 10, zIndex: 999, alignItems: 'center' },
  success: { backgroundColor: '#166534' },
  error: { backgroundColor: '#991b1b' },
  text: { color: '#fff', fontWeight: '700', fontSize: 14 },
});

// Haversine distance (metres)
function haversineMetres(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

type LatLng = { lat: number; lng: number };

export function MapScreen() {
  const [zones, setZones] = useState<AlarmZone[]>([]);
  const [pendingPoint, setPendingPoint] = useState<LatLng | null>(null);
  const [pendingRadius, setPendingRadius] = useState(500);
  const [pendingName, setPendingName] = useState('');
  const [userPos, setUserPos] = useState<LatLng | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [monitoring, setMonitoring] = useState(false);
  const [proximityResults, setProximityResults] = useState<
    { zone_id: number; name: string; distance: number; alarm: boolean }[]
  >([]);

  // Track which zones we've already fired alarms for
  const firedAlarmsRef = useRef<Set<number>>(new Set());

  // Map ref for programmatic panning
  const mapRef = useRef<PlatformMapRef>(null);

  // Toast feedback
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  }, []);

  // Pending delete confirmation
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  // ---- Load saved zones on mount -----------------------------------------
  const loadZones = useCallback(async () => {
    try {
      const data = await zonesApi.list();
      setZones(data);
    } catch (e) {
      console.error('Failed to load zones:', e);
    }
  }, []);

  useEffect(() => {
    loadZones();
  }, [loadZones]);

  // ---- Check proximity against all zones ---------------------------------
  useEffect(() => {
    if (!userPos || zones.length === 0) {
      setProximityResults([]);
      firedAlarmsRef.current.clear();
      return;
    }

    const results = zones
      .filter((z) => z.is_active)
      .map((z) => {
        const d = haversineMetres(userPos.lat, userPos.lng, z.latitude, z.longitude);
        return { zone_id: z.id, name: z.name, distance: d, alarm: d <= z.radius_meters };
      });

    setProximityResults(results);

    const alarming = results.filter((r) => r.alarm);
    const alarmingIds = new Set(alarming.map((r) => r.zone_id));

    for (const r of alarming) {
      if (!firedAlarmsRef.current.has(r.zone_id)) {
        fireAlarm(r.distance, zones.find((z) => z.id === r.zone_id)?.radius_meters ?? 500);
        firedAlarmsRef.current.add(r.zone_id);
        historyApi.create({
          zone_id: r.zone_id,
          zone_name: r.name,
          event_type: 'entered',
          distance_meters: r.distance,
          latitude: userPos.lat,
          longitude: userPos.lng,
        }).catch((e: unknown) => console.error('Failed to log alarm event:', e));
      }
    }

    for (const id of firedAlarmsRef.current) {
      if (!alarmingIds.has(id)) {
        const zone = zones.find((z) => z.id === id);
        const pr = results.find((r) => r.zone_id === id);
        historyApi.create({
          zone_id: id,
          zone_name: zone?.name ?? `Zone ${id}`,
          event_type: 'exited',
          distance_meters: pr?.distance ?? 0,
          latitude: userPos.lat,
          longitude: userPos.lng,
        }).catch((e: unknown) => console.error('Failed to log exit event:', e));
        firedAlarmsRef.current.delete(id);
      }
    }
    if (firedAlarmsRef.current.size === 0 && alarming.length === 0) {
      stopAlarm();
    }
  }, [userPos, zones]);

  // ---- Save pending zone -------------------------------------------------
  const saveZone = useCallback(async () => {
    if (!pendingPoint) return;
    const name = pendingName.trim() || `Zone ${zones.length + 1}`;
    try {
      await zonesApi.create({
        name,
        latitude: pendingPoint.lat,
        longitude: pendingPoint.lng,
        radius_meters: pendingRadius,
      });
      setPendingPoint(null);
      setPendingName('');
      setPendingRadius(500);
      await loadZones();
      showToast(`"${name}" added`);
    } catch (e) {
      console.error('Failed to save zone:', e);
      showToast('Failed to save zone', 'error');
    }
  }, [pendingPoint, pendingName, pendingRadius, zones.length, loadZones, showToast]);

  // ---- Delete zone -------------------------------------------------------
  const deleteZone = useCallback(async (id: number) => {
    const zone = zones.find((z) => z.id === id);
    try {
      await zonesApi.remove(id);
      setConfirmDeleteId(null);
      await loadZones();
      showToast(`"${zone?.name ?? 'Zone'}" removed`);
    } catch (e) {
      console.error('Failed to delete zone:', e);
      showToast('Failed to delete zone', 'error');
    }
  }, [loadZones, zones, showToast]);

  // ---- Handle location search selection -----------------------------------
  const handleSearchSelect = useCallback((lat: number, lng: number, name: string) => {
    mapRef.current?.animateTo(lat, lng);
    setPendingPoint({ lat, lng });
    setPendingName(name);
  }, []);

  // ---- Start / stop live tracking ----------------------------------------
  const toggleMonitoring = useCallback(() => {
    if (monitoring && watchId !== null) {
      clearWatch(watchId);
      setWatchId(null);
      setMonitoring(false);
      return;
    }
    const id = watchPosition((pos) => setUserPos(pos));
    setWatchId(id);
    setMonitoring(true);
  }, [monitoring, watchId]);

  // ---- Render ------------------------------------------------------------
  const alarmingZones = proximityResults.filter((r) => r.alarm);

  return (
    <View style={styles.container}>
      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}

      {/* Platform-specific map with search overlay */}
      <View style={styles.mapWrapper}>
        <PlatformMap
          ref={mapRef}
          zones={zones}
          userPos={userPos}
          pendingPoint={pendingPoint}
          pendingRadius={pendingRadius}
          onMapPress={setPendingPoint}
        />
        <LocationSearch onSelect={handleSearchSelect} />
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {pendingPoint && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>New Alarm Zone</Text>
            <TextInput
              style={styles.input}
              placeholder="Zone name (optional)"
              placeholderTextColor="#9ca3af"
              value={pendingName}
              onChangeText={setPendingName}
            />
            <View style={styles.row}>
              <Pressable style={styles.btn} onPress={() => setPendingRadius((r) => Math.max(50, r - 100))}>
                <Text style={styles.btnText}>− 100 m</Text>
              </Pressable>
              <Text style={styles.label}>Radius: {pendingRadius} m</Text>
              <Pressable style={styles.btn} onPress={() => setPendingRadius((r) => r + 100)}>
                <Text style={styles.btnText}>+ 100 m</Text>
              </Pressable>
            </View>
            <View style={styles.row}>
              <Pressable style={[styles.btn, styles.btnPrimary]} onPress={saveZone}>
                <Text style={styles.btnText}>Save Zone</Text>
              </Pressable>
              <Pressable style={[styles.btn, styles.btnDanger]} onPress={() => setPendingPoint(null)}>
                <Text style={styles.btnText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        )}

        <Pressable
          style={[styles.btn, monitoring ? styles.btnDanger : styles.btnPrimary, { alignSelf: 'center' }]}
          onPress={toggleMonitoring}
        >
          <Text style={styles.btnText}>{monitoring ? 'Stop Monitoring' : 'Start Monitoring'}</Text>
        </Pressable>

        {alarmingZones.length > 0 && (
          <Text style={[styles.status, styles.statusAlarm]}>
            🔔 ALARM — Inside: {alarmingZones.map((r) => `${r.name} (${Math.round(r.distance)}m)`).join(', ')}
          </Text>
        )}

        {zones.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Saved Zones ({zones.length})</Text>
            <ScrollView style={{ maxHeight: 150 }}>
              {zones.map((z, i) => {
                const pr = proximityResults.find((r) => r.zone_id === z.id);
                const isConfirming = confirmDeleteId === z.id;
                return (
                  <View key={z.id} style={styles.zoneRow}>
                    <View
                      style={[styles.dot, { backgroundColor: ZONE_COLOURS[i % ZONE_COLOURS.length] }]}
                    />
                    <Text style={styles.zoneName} numberOfLines={1}>
                      {z.name}
                    </Text>
                    <Text style={styles.zoneInfo}>
                      {z.radius_meters}m
                      {pr ? ` · ${Math.round(pr.distance)}m away` : ''}
                    </Text>
                    {isConfirming ? (
                      <View style={styles.confirmRow}>
                        <Pressable onPress={() => deleteZone(z.id)} style={styles.confirmYes}>
                          <Text style={styles.confirmText}>Delete</Text>
                        </Pressable>
                        <Pressable onPress={() => setConfirmDeleteId(null)}>
                          <Text style={styles.confirmCancel}>Cancel</Text>
                        </Pressable>
                      </View>
                    ) : (
                      <Pressable onPress={() => setConfirmDeleteId(z.id)}>
                        <Text style={styles.deleteBtn}>✕</Text>
                      </Pressable>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

        {!pendingPoint && zones.length === 0 && (
          <Text style={styles.hint}>Tap the map to create an alarm zone</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f4ee' },
  mapWrapper: { flex: 1, position: 'relative' },
  controls: { padding: 12, gap: 10, backgroundColor: '#fffdf8', borderTopWidth: 1, borderTopColor: '#e7d8c9' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  label: { fontSize: 15, fontWeight: '600', color: '#1f2a37', minWidth: 120, textAlign: 'center' },
  btn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: '#e7d8c9' },
  btnPrimary: { backgroundColor: '#8a5a44' },
  btnDanger: { backgroundColor: '#dc2626' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 14, textAlign: 'center' },
  status: { fontSize: 14, color: '#1f2a37', textAlign: 'center' },
  statusAlarm: { color: '#dc2626', fontWeight: '700' },
  hint: { fontSize: 13, color: '#7a8793', textAlign: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: '#e7d8c9',
  },
  cardTitle: { fontWeight: '700', fontSize: 15, color: '#1f2a37' },
  input: {
    borderWidth: 1,
    borderColor: '#e7d8c9',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
    color: '#1f2a37',
  },
  zoneRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  zoneName: { fontWeight: '600', fontSize: 13, color: '#1f2a37', flex: 1 },
  zoneInfo: { fontSize: 12, color: '#7a8793' },
  deleteBtn: { fontSize: 16, color: '#dc2626', paddingHorizontal: 6 },
  confirmRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  confirmYes: { backgroundColor: '#dc2626', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  confirmText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  confirmCancel: { color: '#7a8793', fontSize: 12, fontWeight: '600' },
});