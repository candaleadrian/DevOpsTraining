import axios from 'axios';
import { historyApi } from '../historyApi';

jest.mock('../../config/api', () => ({
  getApiBaseUrl: () => 'http://localhost:8000',
}));

jest.mock('axios', () => {
  const mockInstance = {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  };
  return {
    create: jest.fn(() => mockInstance),
    __mockInstance: mockInstance,
  };
});

const mockAxios = (axios as any).__mockInstance;

beforeEach(() => jest.clearAllMocks());

describe('historyApi', () => {
  const sampleEvent = {
    id: 1,
    zone_id: 1,
    zone_name: 'Office',
    event_type: 'entered' as const,
    distance_meters: 150.5,
    latitude: 44.427,
    longitude: 26.103,
    triggered_at: '2026-03-12T15:36:22',
  };

  test('list() calls GET /api/alarm-events', async () => {
    mockAxios.get.mockResolvedValue({ data: [sampleEvent] });
    const result = await historyApi.list();
    expect(mockAxios.get).toHaveBeenCalledWith('/api/alarm-events', { params: undefined });
    expect(result).toEqual([sampleEvent]);
  });

  test('list() passes zone_id and limit as query params', async () => {
    mockAxios.get.mockResolvedValue({ data: [] });
    await historyApi.list({ zone_id: 1, limit: 10 });
    expect(mockAxios.get).toHaveBeenCalledWith('/api/alarm-events', {
      params: { zone_id: 1, limit: 10 },
    });
  });

  test('create() calls POST /api/alarm-events with payload', async () => {
    mockAxios.post.mockResolvedValue({ data: sampleEvent });
    const payload = {
      zone_id: 1,
      zone_name: 'Office',
      event_type: 'entered' as const,
      distance_meters: 150.5,
      latitude: 44.427,
      longitude: 26.103,
    };
    const result = await historyApi.create(payload);
    expect(mockAxios.post).toHaveBeenCalledWith('/api/alarm-events', payload);
    expect(result.event_type).toBe('entered');
  });

  test('clear() calls DELETE /api/alarm-events', async () => {
    mockAxios.delete.mockResolvedValue({});
    await historyApi.clear();
    expect(mockAxios.delete).toHaveBeenCalledWith('/api/alarm-events');
  });

  test('create() propagates errors', async () => {
    mockAxios.post.mockRejectedValue(new Error('500 Internal'));
    await expect(
      historyApi.create({
        zone_id: 1,
        zone_name: 'X',
        event_type: 'entered',
        distance_meters: 0,
        latitude: 0,
        longitude: 0,
      }),
    ).rejects.toThrow('500 Internal');
  });
});
