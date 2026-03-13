import axios from 'axios';
import { zonesApi } from '../zonesApi';

jest.mock('axios', () => {
  const mockInstance = {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  };
  return {
    create: jest.fn(() => mockInstance),
    __mockInstance: mockInstance,
  };
});

const mockAxios = (axios as any).__mockInstance;

beforeEach(() => jest.clearAllMocks());

describe('zonesApi', () => {
  const sampleZone = {
    id: 1,
    name: 'Office',
    latitude: 44.4268,
    longitude: 26.1025,
    radius_meters: 300,
    is_active: true,
    created_at: '2026-03-12T10:00:00',
    updated_at: '2026-03-12T10:00:00',
  };

  test('list() calls GET /api/zones and returns data', async () => {
    mockAxios.get.mockResolvedValue({ data: [sampleZone] });
    const result = await zonesApi.list();
    expect(mockAxios.get).toHaveBeenCalledWith('/api/zones');
    expect(result).toEqual([sampleZone]);
  });

  test('create() calls POST /api/zones with payload', async () => {
    mockAxios.post.mockResolvedValue({ data: sampleZone });
    const payload = { name: 'Office', latitude: 44.4268, longitude: 26.1025, radius_meters: 300 };
    const result = await zonesApi.create(payload);
    expect(mockAxios.post).toHaveBeenCalledWith('/api/zones', payload);
    expect(result).toEqual(sampleZone);
  });

  test('get() calls GET /api/zones/:id', async () => {
    mockAxios.get.mockResolvedValue({ data: sampleZone });
    const result = await zonesApi.get(1);
    expect(mockAxios.get).toHaveBeenCalledWith('/api/zones/1');
    expect(result).toEqual(sampleZone);
  });

  test('update() calls PATCH /api/zones/:id with partial payload', async () => {
    const updated = { ...sampleZone, name: 'Updated' };
    mockAxios.patch.mockResolvedValue({ data: updated });
    const result = await zonesApi.update(1, { name: 'Updated' });
    expect(mockAxios.patch).toHaveBeenCalledWith('/api/zones/1', { name: 'Updated' });
    expect(result.name).toBe('Updated');
  });

  test('remove() calls DELETE /api/zones/:id', async () => {
    mockAxios.delete.mockResolvedValue({});
    await zonesApi.remove(1);
    expect(mockAxios.delete).toHaveBeenCalledWith('/api/zones/1');
  });

  test('checkProximity() calls POST /api/zones/check', async () => {
    const checkResult = [{ zone_id: 1, name: 'Office', distance: 50.0, alarm: true }];
    mockAxios.post.mockResolvedValue({ data: checkResult });
    const result = await zonesApi.checkProximity(44.4268, 26.1025);
    expect(mockAxios.post).toHaveBeenCalledWith('/api/zones/check', {
      latitude: 44.4268,
      longitude: 26.1025,
    });
    expect(result[0].alarm).toBe(true);
  });

  test('list() propagates errors', async () => {
    mockAxios.get.mockRejectedValue(new Error('Network Error'));
    await expect(zonesApi.list()).rejects.toThrow('Network Error');
  });
});
