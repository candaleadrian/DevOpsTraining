import * as Location from 'expo-location';
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Dimensions, Button, Alert } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { setLocation, checkLocation } from '../services/locationService';

const MapScreen = () => {
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [marker, setMarker] = useState(null);
  const [radius, setRadius] = useState(1000); // Default radius in meters
  const [locationPermission, setLocationPermission] = useState(false);

  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationPermission(true);
        const userLocation = await Location.getCurrentPositionAsync({});
        setRegion({
          latitude: userLocation.coords.latitude,
          longitude: userLocation.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      } else {
        Alert.alert('Permission Denied', 'Location permission is required to use the map.');
      }
    };
    requestPermissions();
  }, []);

  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setMarker({ latitude, longitude });
  };

  const handleSetLocation = async () => {
    if (!marker) {
      Alert.alert('Error', 'Please select a location on the map.');
      return;
    }
    try {
      await setLocation(marker.latitude, marker.longitude, radius);
      Alert.alert('Success', 'Location and radius set successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to set location.');
    }
  };

  const handleCheckLocation = async () => {
    if (!marker) {
      Alert.alert('Error', 'Please select a location on the map.');
      return;
    }
    try {
      const userLocation = { latitude: region.latitude, longitude: region.longitude };
      const response = await checkLocation(userLocation.latitude, userLocation.longitude);
      if (response.alarm) {
        Alert.alert('Alarm Triggered', `You are within ${response.distance.toFixed(2)} meters of the selected point.`);
      } else {
        Alert.alert('Outside Radius', `You are ${response.distance.toFixed(2)} meters away from the selected point.`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to check location.');
    }
  };

  return (
    <View style={styles.container}>
      {locationPermission ? (
        <MapView
          style={styles.map}
          initialRegion={region}
          onPress={handleMapPress}
        >
          {marker && (
            <>
              <Marker coordinate={marker} />
              <Circle center={marker} radius={radius} strokeColor="rgba(0,0,255,0.5)" fillColor="rgba(0,0,255,0.2)" />
            </>
          )}
        </MapView>
      ) : (
        <View style={styles.permissionContainer}>
          <Button title="Grant Location Permission" onPress={() => Location.requestForegroundPermissionsAsync()} />
        </View>
      )}
      <View style={styles.buttonContainer}>
        <Button title="Set Location" onPress={handleSetLocation} />
        <Button title="Check Location" onPress={handleCheckLocation} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height - 100,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MapScreen;