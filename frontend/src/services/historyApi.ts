import apiClient from '../config/apiClient';

const API = apiClient;

export interface AlarmEvent {
  id: number;
  zone_id: number | null;
  zone_name: string;
  event_type: 'entered' | 'exited';
  distance_meters: number;
  latitude: number;
  longitude: number;
  triggered_at: string;
}

export interface CreateAlarmEventPayload {
  zone_id: number;
  zone_name: string;
  event_type: 'entered' | 'exited';
  distance_meters: number;
  latitude: number;
  longitude: number;
}

export const historyApi = {
  list: (params?: { zone_id?: number; limit?: number }) =>
    API.get<AlarmEvent[]>('/api/alarm-events', { params }).then((r) => r.data),

  create: (payload: CreateAlarmEventPayload) =>
    API.post<AlarmEvent>('/api/alarm-events', payload).then((r) => r.data),

  clear: () => API.delete('/api/alarm-events'),
};
