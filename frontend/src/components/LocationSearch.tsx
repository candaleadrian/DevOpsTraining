import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  TextInput,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Keyboard,
  Platform,
} from 'react-native';

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

interface LocationSearchProps {
  onSelect: (lat: number, lng: number, name: string) => void;
}

export default function LocationSearch({ onSelect }: LocationSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (text: string) => {
    if (text.trim().length < 3) {
      setResults([]);
      setShowResults(false);
      return;
    }
    setLoading(true);
    try {
      const encoded = encodeURIComponent(text.trim());
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=5&addressdetails=0`,
        { headers: { 'User-Agent': 'ProximityAlarmApp/1.0' } },
      );
      if (!res.ok) throw new Error('Search failed');
      const data: SearchResult[] = await res.json();
      setResults(data);
      setShowResults(data.length > 0);
    } catch {
      setResults([]);
      setShowResults(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChangeText = useCallback(
    (text: string) => {
      setQuery(text);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => search(text), 400);
    },
    [search],
  );

  const handleSelect = useCallback(
    (item: SearchResult) => {
      const lat = parseFloat(item.lat);
      const lng = parseFloat(item.lon);
      // Show just the first part of the name (before the first comma)
      const shortName = item.display_name.split(',')[0].trim();
      setQuery(shortName);
      setShowResults(false);
      setResults([]);
      Keyboard.dismiss();
      onSelect(lat, lng, shortName);
    },
    [onSelect],
  );

  const handleClear = useCallback(() => {
    setQuery('');
    setResults([]);
    setShowResults(false);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <Text style={styles.icon}>🔍</Text>
        <TextInput
          style={styles.input}
          placeholder="Search location…"
          placeholderTextColor="#9ca3af"
          value={query}
          onChangeText={handleChangeText}
          returnKeyType="search"
          onSubmitEditing={() => search(query)}
          autoCorrect={false}
        />
        {loading && <ActivityIndicator size="small" color="#8a5a44" style={styles.spinner} />}
        {query.length > 0 && !loading && (
          <Pressable onPress={handleClear} style={styles.clearBtn}>
            <Text style={styles.clearText}>✕</Text>
          </Pressable>
        )}
      </View>

      {showResults && (
        <FlatList
          data={results}
          keyExtractor={(item) => String(item.place_id)}
          keyboardShouldPersistTaps="handled"
          style={styles.list}
          renderItem={({ item }) => (
            <Pressable style={styles.resultRow} onPress={() => handleSelect(item)}>
              <Text style={styles.resultText} numberOfLines={2}>
                {item.display_name}
              </Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 10,
    left: 10,
    right: 10,
    zIndex: 100,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 44,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  icon: { fontSize: 16, marginRight: 6 },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1f2a37',
    paddingVertical: 0,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' as any } : {}),
  },
  spinner: { marginLeft: 6 },
  clearBtn: { padding: 4, marginLeft: 4 },
  clearText: { fontSize: 16, color: '#9ca3af' },
  list: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 4,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  resultRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e7d8c9',
  },
  resultText: { fontSize: 14, color: '#1f2a37' },
});
