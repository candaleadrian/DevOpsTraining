import { AlarmZone } from '../services/zonesApi';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface PlatformMapRef {
  animateTo: (lat: number, lng: number) => void;
}

export interface PlatformMapProps {
  zones: AlarmZone[];
  userPos: LatLng | null;
  pendingPoint: LatLng | null;
  pendingRadius: number;
  onMapPress: (point: LatLng) => void;
}

// Colours for zone circles (shared between web and native)
export const ZONE_COLOURS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];
