// Location tracking — native (expo-location)

import * as ExpoLocation from 'expo-location';
import { LatLng, LocationCallback, ErrorCallback } from './locationTracker.types';
export type { LatLng, LocationCallback, ErrorCallback } from './locationTracker.types';

export async function getCurrentPosition(): Promise<LatLng | null> {
  const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
  if (status !== 'granted') return null;
  const loc = await ExpoLocation.getCurrentPositionAsync({ accuracy: ExpoLocation.Accuracy.High });
  return { lat: loc.coords.latitude, lng: loc.coords.longitude };
}

// Subscription-based tracking on native returns a remove() handle.
// We store them in a map keyed by a counter so callers get a numeric ID
// compatible with the web API.
let nextId = 1;
const subscriptions = new Map<number, ExpoLocation.LocationSubscription>();

export function watchPosition(
  onLocation: LocationCallback,
  onError?: ErrorCallback,
): number {
  const id = nextId++;

  (async () => {
    try {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        onError?.(new Error('Location permission denied'));
        return;
      }
      const sub = await ExpoLocation.watchPositionAsync(
        { accuracy: ExpoLocation.Accuracy.High, distanceInterval: 5 },
        (loc) => onLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude }),
      );
      subscriptions.set(id, sub);
    } catch (e) {
      onError?.(e instanceof Error ? e : new Error(String(e)));
    }
  })();

  return id;
}

export function clearWatch(id: number): void {
  const sub = subscriptions.get(id);
  if (sub) {
    sub.remove();
    subscriptions.delete(id);
  }
}
