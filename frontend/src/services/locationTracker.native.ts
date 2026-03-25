// Location tracking — native (expo-location) with background support

import * as ExpoLocation from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { LatLng, LocationCallback, ErrorCallback } from './locationTracker.types';
export type { LatLng, LocationCallback, ErrorCallback } from './locationTracker.types';

const BACKGROUND_LOCATION_TASK = 'background-location-task';

// Listeners that receive location updates from the background task
const backgroundListeners = new Set<LocationCallback>();

// Register the background task at module level (required by TaskManager)
TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }: any) => {
  if (error) return;
  if (data?.locations?.length) {
    const loc = data.locations[0];
    const pos: LatLng = { lat: loc.coords.latitude, lng: loc.coords.longitude };
    backgroundListeners.forEach((cb) => cb(pos));
  }
});

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

/**
 * Start background location tracking. Requires background location permission.
 * The onLocation callback will be called even when the app is backgrounded.
 * Returns a cleanup function.
 */
export async function startBackgroundTracking(
  onLocation: LocationCallback,
  onError?: ErrorCallback,
): Promise<() => void> {
  try {
    // Request foreground permission first
    const fg = await ExpoLocation.requestForegroundPermissionsAsync();
    if (fg.status !== 'granted') {
      onError?.(new Error('Foreground location permission denied'));
      return () => {};
    }

    // Request background permission
    const bg = await ExpoLocation.requestBackgroundPermissionsAsync();
    if (bg.status !== 'granted') {
      onError?.(new Error('Background location permission denied'));
      return () => {};
    }

    // Register this listener
    backgroundListeners.add(onLocation);

    // Start background updates if not already running
    const isRunning = await ExpoLocation.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK).catch(() => false);
    if (!isRunning) {
      await ExpoLocation.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
        accuracy: ExpoLocation.Accuracy.High,
        distanceInterval: 10,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: 'Proximity Alarm',
          notificationBody: 'Monitoring your location for alarm zones',
          notificationColor: '#8a5a44',
        },
      });
    }

    return () => {
      backgroundListeners.delete(onLocation);
      if (backgroundListeners.size === 0) {
        ExpoLocation.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK).catch(() => {});
      }
    };
  } catch (e) {
    onError?.(e instanceof Error ? e : new Error(String(e)));
    return () => {};
  }
}

/**
 * Stop all background location tracking.
 */
export async function stopBackgroundTracking(): Promise<void> {
  backgroundListeners.clear();
  const isRunning = await ExpoLocation.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK).catch(() => false);
  if (isRunning) {
    await ExpoLocation.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
  }
}
