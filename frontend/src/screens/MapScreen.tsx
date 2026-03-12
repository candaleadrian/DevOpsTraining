import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, ScrollView, TextInput } from 'react-native';
import { fireAlarm, stopAlarm } from '../services/alarmTrigger';
import { zonesApi, AlarmZone } from '../services/zonesApi';
import { historyApi } from '../services/historyApi';

// Leaflet CSS is injected once into the page head
function useLeafletCSS() {
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const id = 'leaflet-css';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
  }, []);
}

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

// Colours for zone circles
const ZONE_COLOURS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];

export function MapScreen() {
  useLeafletCSS();

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const zoneLayersRef = useRef<Map<number, { marker: any; circle: any }>>(new Map());
  const pendingMarkerRef = useRef<any>(null);
  const pendingCircleRef = useRef<any>(null);

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

  // ---- Initialise Leaflet map --------------------------------------------
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    let cancelled = false;

    (async () => {
      const L = await import('leaflet');
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (cancelled || !mapContainerRef.current || mapRef.current) return;

      const map = L.map(mapContainerRef.current).setView([44.4268, 26.1025], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      map.on('click', (e: any) => {
        setPendingPoint({ lat: e.latlng.lat, lng: e.latlng.lng });
      });

      mapRef.current = map;

      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            map.setView([pos.coords.latitude, pos.coords.longitude], 14);
            setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          },
          () => {},
          { enableHighAccuracy: true },
        );
      }
    })();

    return () => { cancelled = true; };
  }, []);

  // ---- Draw saved zones on map -------------------------------------------
  useEffect(() => {
    if (!mapRef.current) return;

    (async () => {
      const L = await import('leaflet');
      const map = mapRef.current;

      // Remove old zone layers
      zoneLayersRef.current.forEach(({ marker, circle }) => {
        map.removeLayer(marker);
        map.removeLayer(circle);
      });
      zoneLayersRef.current.clear();

      zones.forEach((z, i) => {
        const colour = ZONE_COLOURS[i % ZONE_COLOURS.length];
        const marker = L.marker([z.latitude, z.longitude])
          .addTo(map)
          .bindPopup(`<b>${z.name}</b><br>${z.radius_meters}m radius`);
        const circle = L.circle([z.latitude, z.longitude], {
          radius: z.radius_meters,
          color: colour,
          fillColor: colour,
          fillOpacity: 0.12,
        }).addTo(map);
        zoneLayersRef.current.set(z.id, { marker, circle });
      });
    })();
  }, [zones]);

  // ---- Draw pending point (before save) ----------------------------------
  useEffect(() => {
    if (!mapRef.current) return;

    (async () => {
      const L = await import('leaflet');
      const map = mapRef.current;

      if (pendingMarkerRef.current) map.removeLayer(pendingMarkerRef.current);
      if (pendingCircleRef.current) map.removeLayer(pendingCircleRef.current);
      pendingMarkerRef.current = null;
      pendingCircleRef.current = null;

      if (!pendingPoint) return;

      const pendingIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });

      pendingMarkerRef.current = L.marker([pendingPoint.lat, pendingPoint.lng], { icon: pendingIcon, opacity: 0.6 })
        .addTo(map)
        .bindPopup('New zone (unsaved)');

      pendingCircleRef.current = L.circle([pendingPoint.lat, pendingPoint.lng], {
        radius: pendingRadius,
        color: '#9ca3af',
        dashArray: '6',
        fillColor: '#9ca3af',
        fillOpacity: 0.08,
      }).addTo(map);
    })();
  }, [pendingPoint, pendingRadius]);

  // ---- Draw user position marker -----------------------------------------
  useEffect(() => {
    if (!mapRef.current || !userPos) return;

    (async () => {
      const L = await import('leaflet');
      const map = mapRef.current;

      if (userMarkerRef.current) map.removeLayer(userMarkerRef.current);

      const userIcon = L.divIcon({
        html: '<div style="background:#22c55e;width:14px;height:14px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 6px rgba(0,0,0,.3)"></div>',
        className: '',
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      userMarkerRef.current = L.marker([userPos.lat, userPos.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup('You are here');
    })();
  }, [userPos]);

  // ---- Check proximity against all zones ---------------------------------
  useEffect(() => {
    if (!userPos || zones.length === 0) {
      setProximityResults([]);
      firedAlarmsRef.current.clear();
      return;
    }

    // Client-side proximity check for instant feedback
    const results = zones
      .filter((z) => z.is_active)
      .map((z) => {
        const d = haversineMetres(userPos.lat, userPos.lng, z.latitude, z.longitude);
        return { zone_id: z.id, name: z.name, distance: d, alarm: d <= z.radius_meters };
      });

    setProximityResults(results);

    const alarming = results.filter((r) => r.alarm);
    const alarmingIds = new Set(alarming.map((r) => r.zone_id));

    // Fire alarm for newly entered zones
    for (const r of alarming) {
      if (!firedAlarmsRef.current.has(r.zone_id)) {
        fireAlarm(r.distance, zones.find((z) => z.id === r.zone_id)?.radius_meters ?? 500);
        firedAlarmsRef.current.add(r.zone_id);
        // Log "entered" event
        historyApi.create({
          zone_id: r.zone_id,
          zone_name: r.name,
          event_type: 'entered',
          distance_meters: r.distance,
          latitude: userPos.lat,
          longitude: userPos.lng,
        }).catch((e) => console.error('Failed to log alarm event:', e));
      }
    }

    // Stop alarm if we left all zones
    for (const id of firedAlarmsRef.current) {
      if (!alarmingIds.has(id)) {
        // Log "exited" event
        const zone = zones.find((z) => z.id === id);
        const pr = results.find((r) => r.zone_id === id);
        historyApi.create({
          zone_id: id,
          zone_name: zone?.name ?? `Zone ${id}`,
          event_type: 'exited',
          distance_meters: pr?.distance ?? 0,
          latitude: userPos.lat,
          longitude: userPos.lng,
        }).catch((e) => console.error('Failed to log exit event:', e));
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
    } catch (e) {
      console.error('Failed to save zone:', e);
    }
  }, [pendingPoint, pendingName, pendingRadius, zones.length, loadZones]);

  // ---- Delete zone -------------------------------------------------------
  const deleteZone = useCallback(async (id: number) => {
    try {
      await zonesApi.remove(id);
      await loadZones();
    } catch (e) {
      console.error('Failed to delete zone:', e);
    }
  }, [loadZones]);

  // ---- Start / stop live tracking ----------------------------------------
  const toggleMonitoring = useCallback(() => {
    if (monitoring && watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setMonitoring(false);
      return;
    }
    if (!('geolocation' in navigator)) return;
    const id = navigator.geolocation.watchPosition(
      (pos) => setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true },
    );
    setWatchId(id);
    setMonitoring(true);
  }, [monitoring, watchId]);

  // ---- Render ------------------------------------------------------------
  if (Platform.OS !== 'web') {
    return (
      <View style={styles.fallback}>
        <Text>Map is only available on web for now.</Text>
      </View>
    );
  }

  const alarmingZones = proximityResults.filter((r) => r.alarm);

  return (
    <View style={styles.container}>
      {/* Map */}
      <div ref={mapContainerRef} style={{ flex: 1, minHeight: 0 }} />

      {/* Controls */}
      <View style={styles.controls}>
        {/* Pending zone form */}
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

        {/* Monitoring toggle */}
        <Pressable
          style={[styles.btn, monitoring ? styles.btnDanger : styles.btnPrimary, { alignSelf: 'center' }]}
          onPress={toggleMonitoring}
        >
          <Text style={styles.btnText}>{monitoring ? 'Stop Monitoring' : 'Start Monitoring'}</Text>
        </Pressable>

        {/* Alarm status */}
        {alarmingZones.length > 0 && (
          <Text style={[styles.status, styles.statusAlarm]}>
            🔔 ALARM — Inside: {alarmingZones.map((r) => `${r.name} (${Math.round(r.distance)}m)`).join(', ')}
          </Text>
        )}

        {/* Saved zones list */}
        {zones.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Saved Zones ({zones.length})</Text>
            <ScrollView style={{ maxHeight: 120 }}>
              {zones.map((z, i) => {
                const pr = proximityResults.find((r) => r.zone_id === z.id);
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
                    <Pressable onPress={() => deleteZone(z.id)}>
                      <Text style={styles.deleteBtn}>✕</Text>
                    </Pressable>
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
  fallback: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
});