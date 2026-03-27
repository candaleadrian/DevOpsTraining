/**
 * Local zone storage for guest users (max 3 zones, stored on device).
 * Mirrors the zonesApi interface so MapScreen can switch transparently.
 */
import { Platform } from 'react-native';
import { AlarmZone, CreateZonePayload } from './zonesApi';

const STORAGE_KEY = 'guest_zones';
const MAX_GUEST_ZONES = 3;

let _nextId = Date.now();

// ---------------------------------------------------------------------------
// Storage helpers
// ---------------------------------------------------------------------------

async function readZones(): Promise<AlarmZone[]> {
  let raw: string | null = null;
  if (Platform.OS === 'web') {
    raw = localStorage.getItem(STORAGE_KEY);
  } else {
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    raw = await AsyncStorage.getItem(STORAGE_KEY);
  }
  if (!raw) return [];
  try {
    return JSON.parse(raw) as AlarmZone[];
  } catch {
    return [];
  }
}

async function writeZones(zones: AlarmZone[]): Promise<void> {
  const raw = JSON.stringify(zones);
  if (Platform.OS === 'web') {
    localStorage.setItem(STORAGE_KEY, raw);
  } else {
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    await AsyncStorage.setItem(STORAGE_KEY, raw);
  }
}

// ---------------------------------------------------------------------------
// Public API (same shape as zonesApi)
// ---------------------------------------------------------------------------

export const guestZonesApi = {
  list: async (): Promise<AlarmZone[]> => {
    return readZones();
  },

  create: async (payload: CreateZonePayload): Promise<AlarmZone> => {
    const zones = await readZones();
    if (zones.length >= MAX_GUEST_ZONES) {
      throw new Error(`Guest users can save up to ${MAX_GUEST_ZONES} zones. Sign in for unlimited zones.`);
    }
    const now = new Date().toISOString();
    const zone: AlarmZone = {
      id: _nextId++,
      name: payload.name,
      latitude: payload.latitude,
      longitude: payload.longitude,
      radius_meters: payload.radius_meters,
      is_active: true,
      created_at: now,
      updated_at: now,
    };
    zones.unshift(zone);
    await writeZones(zones);
    return zone;
  },

  get: async (id: number): Promise<AlarmZone> => {
    const zones = await readZones();
    const zone = zones.find((z) => z.id === id);
    if (!zone) throw new Error('Zone not found');
    return zone;
  },

  update: async (
    id: number,
    payload: Partial<CreateZonePayload & { is_active: boolean }>,
  ): Promise<AlarmZone> => {
    const zones = await readZones();
    const idx = zones.findIndex((z) => z.id === id);
    if (idx === -1) throw new Error('Zone not found');
    const zone = { ...zones[idx], ...payload, updated_at: new Date().toISOString() };
    zones[idx] = zone;
    await writeZones(zones);
    return zone;
  },

  remove: async (id: number): Promise<void> => {
    const zones = await readZones();
    await writeZones(zones.filter((z) => z.id !== id));
  },

  checkProximity: async (
    latitude: number,
    longitude: number,
  ): Promise<{ zone_id: number; name: string; distance: number; alarm: boolean }[]> => {
    const zones = await readZones();
    return zones
      .filter((z) => z.is_active)
      .map((z) => {
        const d = haversineMetres(z.latitude, z.longitude, latitude, longitude);
        return { zone_id: z.id, name: z.name, distance: Math.round(d * 10) / 10, alarm: d <= z.radius_meters };
      });
  },
};

export { MAX_GUEST_ZONES };

// Haversine (metres)
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
