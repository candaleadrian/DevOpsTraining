import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:8000' });

export interface AlarmZone {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateZonePayload {
  name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
}

export const zonesApi = {
  list: () => API.get<AlarmZone[]>('/api/zones').then((r) => r.data),

  create: (payload: CreateZonePayload) =>
    API.post<AlarmZone>('/api/zones', payload).then((r) => r.data),

  get: (id: number) => API.get<AlarmZone>(`/api/zones/${id}`).then((r) => r.data),

  update: (id: number, payload: Partial<CreateZonePayload & { is_active: boolean }>) =>
    API.patch<AlarmZone>(`/api/zones/${id}`, payload).then((r) => r.data),

  remove: (id: number) => API.delete(`/api/zones/${id}`),

  checkProximity: (latitude: number, longitude: number) =>
    API.post<{ zone_id: number; name: string; distance: number; alarm: boolean }[]>(
      '/api/zones/check',
      { latitude, longitude },
    ).then((r) => r.data),
};
