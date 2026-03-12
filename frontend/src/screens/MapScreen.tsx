import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';

// Leaflet CSS is injected once into the page head (Expo Web / Metro doesn't handle CSS imports)
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

// Haversine distance (metres) – duplicated client-side for instant UI feedback
function haversineMetres(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
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
  useLeafletCSS();

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const circleRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);

  const [selectedPoint, setSelectedPoint] = useState<LatLng | null>(null);
  const [radius, setRadius] = useState(500); // metres
  const [userPos, setUserPos] = useState<LatLng | null>(null);
  const [alarm, setAlarm] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [monitoring, setMonitoring] = useState(false);

  // ---- Initialise Leaflet map --------------------------------------------
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    let cancelled = false;

    (async () => {
      const L = await import('leaflet');

      // Fix default marker icons (Leaflet expects them from /images/)
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (cancelled || !mapContainerRef.current) return;
      if (mapInstanceRef.current) return; // already initialised

      const map = L.map(mapContainerRef.current).setView([44.4268, 26.1025], 13); // Bucharest default

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      map.on('click', (e: any) => {
        const latlng: LatLng = { lat: e.latlng.lat, lng: e.latlng.lng };
        setSelectedPoint(latlng);
      });

      mapInstanceRef.current = map;

      // Try to centre on user's real location
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            map.setView([latitude, longitude], 14);
            setUserPos({ lat: latitude, lng: longitude });
          },
          () => {}, // ignore errors – keep default centre
          { enableHighAccuracy: true },
        );
      }
    })();

    return () => { cancelled = true; };
  }, []);

  // ---- Draw / update marker + circle when selectedPoint or radius change --
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedPoint) return;

    (async () => {
      const L = await import('leaflet');
      const map = mapInstanceRef.current;

      if (markerRef.current) map.removeLayer(markerRef.current);
      if (circleRef.current) map.removeLayer(circleRef.current);

      markerRef.current = L.marker([selectedPoint.lat, selectedPoint.lng])
        .addTo(map)
        .bindPopup('Alarm point');

      circleRef.current = L.circle([selectedPoint.lat, selectedPoint.lng], {
        radius,
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.15,
      }).addTo(map);
    })();
  }, [selectedPoint, radius]);

  // ---- Draw user position marker -----------------------------------------
  useEffect(() => {
    if (!mapInstanceRef.current || !userPos) return;

    (async () => {
      const L = await import('leaflet');
      const map = mapInstanceRef.current;

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

  // ---- Check proximity whenever user position or alarm point changes ------
  useEffect(() => {
    if (!userPos || !selectedPoint) {
      setAlarm(false);
      setDistance(null);
      return;
    }
    const d = haversineMetres(userPos.lat, userPos.lng, selectedPoint.lat, selectedPoint.lng);
    setDistance(d);
    setAlarm(d <= radius);
  }, [userPos, selectedPoint, radius]);

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
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {},
      { enableHighAccuracy: true },
    );
    setWatchId(id);
    setMonitoring(true);
  }, [monitoring, watchId]);

  // ---- Radius adjustment -------------------------------------------------
  const adjustRadius = (delta: number) => setRadius((r) => Math.max(50, r + delta));

  // ---- Render (web only) -------------------------------------------------
  if (Platform.OS !== 'web') {
    return (
      <View style={styles.fallback}>
        <Text>Map is only available on web for now.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map */}
      <div ref={mapContainerRef} style={{ flex: 1, minHeight: 0 }} />

      {/* Controls */}
      <View style={styles.controls}>
        {/* Radius */}
        <View style={styles.row}>
          <Pressable style={styles.btn} onPress={() => adjustRadius(-100)}>
            <Text style={styles.btnText}>− 100 m</Text>
          </Pressable>
          <Text style={styles.label}>Radius: {radius} m</Text>
          <Pressable style={styles.btn} onPress={() => adjustRadius(100)}>
            <Text style={styles.btnText}>+ 100 m</Text>
          </Pressable>
        </View>

        {/* Monitoring toggle */}
        <Pressable
          style={[styles.btn, monitoring ? styles.btnDanger : styles.btnPrimary]}
          onPress={toggleMonitoring}
        >
          <Text style={styles.btnText}>{monitoring ? 'Stop Monitoring' : 'Start Monitoring'}</Text>
        </Pressable>

        {/* Status */}
        {distance !== null && (
          <Text style={[styles.status, alarm && styles.statusAlarm]}>
            {alarm
              ? `🔔 ALARM — You are ${Math.round(distance)} m from the point (inside ${radius} m radius)`
              : `📍 ${Math.round(distance)} m away (outside ${radius} m radius)`}
          </Text>
        )}
        {!selectedPoint && (
          <Text style={styles.hint}>Tap the map to set an alarm point</Text>
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
});