export interface LatLng {
  lat: number;
  lng: number;
}

export type LocationCallback = (position: LatLng) => void;
export type ErrorCallback = (error: Error) => void;
