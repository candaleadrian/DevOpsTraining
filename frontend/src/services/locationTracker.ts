// Location tracking — web default (browser geolocation API)

import { LatLng, LocationCallback, ErrorCallback } from './locationTracker.types';
export type { LatLng, LocationCallback, ErrorCallback } from './locationTracker.types';

export async function getCurrentPosition(): Promise<LatLng | null> {
  if (!('geolocation' in navigator)) return null;
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true },
    );
  });
}

export function watchPosition(
  onLocation: LocationCallback,
  onError?: ErrorCallback,
): number {
  const id = navigator.geolocation.watchPosition(
    (pos) => onLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
    (err) => onError?.(new Error(err.message)),
    { enableHighAccuracy: true },
  );
  return id;
}

export function clearWatch(id: number): void {
  navigator.geolocation.clearWatch(id);
}

// Background tracking is not available on web — provide no-op stubs
export async function startBackgroundTracking(
  _onLocation?: LocationCallback,
  _onError?: ErrorCallback,
): Promise<() => void> {
  return () => {};
}

export async function stopBackgroundTracking(): Promise<void> {}
