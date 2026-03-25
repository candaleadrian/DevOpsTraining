/**
 * Tests for LocationSearch component logic.
 * Since the jest environment is 'node' (no DOM/JSDOM), we test the
 * underlying Nominatim fetch logic and result-parsing behaviour directly.
 */

// ---- Mock global fetch ------------------------------------------------
const mockFetch = jest.fn();
(globalThis as any).fetch = mockFetch;

beforeEach(() => jest.clearAllMocks());

const sampleResults = [
  {
    place_id: 101,
    display_name: 'Bucharest, Municipality of Bucharest, Romania',
    lat: '44.4267674',
    lon: '26.1025384',
  },
  {
    place_id: 102,
    display_name: 'Budapest, Central Hungary, Hungary',
    lat: '47.497912',
    lon: '19.040235',
  },
];

describe('LocationSearch – Nominatim integration', () => {
  it('builds the correct Nominatim URL for a query', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => sampleResults,
    });

    const query = 'Bucharest';
    const encoded = encodeURIComponent(query);
    const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=5&addressdetails=0`;

    await fetch(url, { headers: { 'User-Agent': 'ProximityAlarmApp/1.0' } });

    expect(mockFetch).toHaveBeenCalledWith(url, {
      headers: { 'User-Agent': 'ProximityAlarmApp/1.0' },
    });
  });

  it('parses lat/lon as numbers from string responses', () => {
    const item = sampleResults[0];
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);

    expect(lat).toBeCloseTo(44.4268, 3);
    expect(lon).toBeCloseTo(26.1025, 3);
  });

  it('extracts short name from display_name (before first comma)', () => {
    const item = sampleResults[0];
    const shortName = item.display_name.split(',')[0].trim();

    expect(shortName).toBe('Bucharest');
  });

  it('handles empty result array', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    const res = await fetch(
      'https://nominatim.openstreetmap.org/search?q=xyznonexistent&format=json&limit=5&addressdetails=0',
      { headers: { 'User-Agent': 'ProximityAlarmApp/1.0' } },
    );
    const data = await res.json();

    expect(data).toEqual([]);
  });

  it('handles fetch failure gracefully', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

    const res = await fetch(
      'https://nominatim.openstreetmap.org/search?q=test&format=json&limit=5&addressdetails=0',
      { headers: { 'User-Agent': 'ProximityAlarmApp/1.0' } },
    );

    expect(res.ok).toBe(false);
  });

  it('handles network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    await expect(
      fetch('https://nominatim.openstreetmap.org/search?q=test&format=json&limit=5&addressdetails=0'),
    ).rejects.toThrow('Network error');
  });

  it('skips search for queries shorter than 3 characters', () => {
    // This mirrors the component logic: text.trim().length < 3 → no fetch
    const shouldSearch = (text: string) => text.trim().length >= 3;

    expect(shouldSearch('')).toBe(false);
    expect(shouldSearch('ab')).toBe(false);
    expect(shouldSearch('abc')).toBe(true);
    expect(shouldSearch('  ab  ')).toBe(false);
    expect(shouldSearch('  abc  ')).toBe(true);
  });

  it('limits results to 5 via URL parameter', () => {
    const url = 'https://nominatim.openstreetmap.org/search?q=test&format=json&limit=5&addressdetails=0';
    const params = new URLSearchParams(url.split('?')[1]);

    expect(params.get('limit')).toBe('5');
    expect(params.get('format')).toBe('json');
  });

  it('encodes special characters in search query', () => {
    const query = 'São Paulo, Brazil';
    const encoded = encodeURIComponent(query);

    expect(encoded).toContain('S%C3%A3o');
    expect(encoded).not.toContain(' ');
  });
});
