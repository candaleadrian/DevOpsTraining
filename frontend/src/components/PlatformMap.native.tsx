// PlatformMap — native implementation using react-native-maps

import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, View, Pressable, Text } from 'react-native';
import MapView, { Marker, Circle, MapPressEvent, Region } from 'react-native-maps';
import { getCurrentPosition } from '../services/locationTracker';
import { PlatformMapProps, PlatformMapRef, ZONE_COLOURS } from './PlatformMap.types';

const DEFAULT_REGION: Region = {
  latitude: 44.4268,
  longitude: 26.1025,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const PlatformMapNative = forwardRef<PlatformMapRef, PlatformMapProps>(function PlatformMapNative(
  { zones, userPos, pendingPoint, pendingRadius, onMapPress, onLocate: _onLocate },
  ref,
) {
  const mapRef = useRef<MapView>(null);

  // Expose animateTo method to parent
  useImperativeHandle(ref, () => ({
    animateTo: (lat: number, lng: number) => {
      mapRef.current?.animateToRegion({
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    },
  }));

  // Centre on user location at mount
  useEffect(() => {
    (async () => {
      const pos = await getCurrentPosition();
      if (pos && mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: pos.lat,
          longitude: pos.lng,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        });
      }
    })();
  }, []);

  const handlePress = (e: MapPressEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    onMapPress({ lat: latitude, lng: longitude });
  };

  return (
    <View style={styles.wrapper}>
    <MapView
      ref={mapRef}
      style={styles.map}
      initialRegion={DEFAULT_REGION}
      showsUserLocation
      showsMyLocationButton
      showsCompass
      zoomControlEnabled={false}
      onPress={handlePress}
    >
      {/* Saved zones */}
      {zones.map((z, i) => {
        const colour = ZONE_COLOURS[i % ZONE_COLOURS.length];
        return (
          <React.Fragment key={z.id}>
            <Marker
              coordinate={{ latitude: z.latitude, longitude: z.longitude }}
              title={z.name}
              description={`${z.radius_meters}m radius`}
            />
            <Circle
              center={{ latitude: z.latitude, longitude: z.longitude }}
              radius={z.radius_meters}
              strokeColor={colour}
              fillColor={colour + '1F'}
              strokeWidth={2}
            />
          </React.Fragment>
        );
      })}

      {/* Pending zone (unsaved) */}
      {pendingPoint && (
        <>
          <Marker
            coordinate={{ latitude: pendingPoint.lat, longitude: pendingPoint.lng }}
            title="New zone (unsaved)"
            opacity={0.6}
            pinColor="#9ca3af"
          />
          <Circle
            center={{ latitude: pendingPoint.lat, longitude: pendingPoint.lng }}
            radius={pendingRadius}
            strokeColor="#9ca3af"
            fillColor="rgba(156,163,175,0.08)"
            strokeWidth={1}
            lineDashPattern={[6, 4]}
          />
        </>
      )}

      {/* User position (if tracking manually; showsUserLocation is also on) */}
      {userPos && (
        <Circle
          center={{ latitude: userPos.lat, longitude: userPos.lng }}
          radius={8}
          strokeColor="#22c55e"
          fillColor="#22c55e"
          strokeWidth={2}
        />
      )}
    </MapView>
      {/* Custom zoom + locate controls stacked vertically */}
      <View style={styles.controlStack}>
        <Pressable
          style={styles.controlBtn}
          onPress={() => {
            mapRef.current?.getCamera().then((cam) => {
              if (cam) mapRef.current?.animateCamera({ zoom: (cam.zoom ?? 14) + 1 });
            });
          }}
        >
          <Text style={styles.controlBtnText}>+</Text>
        </Pressable>
        <View style={styles.controlDivider} />
        <Pressable
          style={styles.controlBtn}
          onPress={() => {
            mapRef.current?.getCamera().then((cam) => {
              if (cam) mapRef.current?.animateCamera({ zoom: (cam.zoom ?? 14) - 1 });
            });
          }}
        >
          <Text style={styles.controlBtnText}>−</Text>
        </Pressable>
        <View style={{ height: 8 }} />
        <Pressable
          style={styles.locateBtn}
          onPress={async () => {
            const pos = await getCurrentPosition();
            if (pos && mapRef.current) {
              mapRef.current.animateToRegion({
                latitude: pos.lat,
                longitude: pos.lng,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              });
              _onLocate?.(pos);
            }
          }}
        >
          <Text style={styles.locateBtnText}>⦿</Text>
        </Pressable>
      </View>
    </View>
  );
});

export default PlatformMapNative;

const styles = StyleSheet.create({
  wrapper: { flex: 1, position: 'relative' },
  map: { flex: 1 },
  controlStack: {
    position: 'absolute',
    bottom: 24,
    right: 12,
    alignItems: 'center',
  },
  controlBtn: {
    width: 44,
    height: 44,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  controlBtnText: { fontSize: 22, fontWeight: '700', color: '#333' },
  controlDivider: { height: 1, width: 44, backgroundColor: '#ddd' },
  locateBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  locateBtnText: { fontSize: 22, color: '#333' },
});
