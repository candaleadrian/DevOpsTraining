import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { Text, ActivityIndicator, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AlarmDetailScreen } from '../screens/AlarmDetailScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { MapScreen } from '../screens/MapScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { AuthScreen } from '../screens/AuthScreen';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { MainTabParamList, RootStackParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#f7f4ee',
    card: '#fffdf8',
    primary: '#8a5a44',
    text: '#1f2a37',
    border: '#e7d8c9',
  },
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#fffdf8',
        },
        headerTitleStyle: {
          color: '#1f2a37',
          fontWeight: '700',
        },
        tabBarActiveTintColor: '#8a5a44',
        tabBarInactiveTintColor: '#7a8793',
        tabBarStyle: {
          backgroundColor: '#fffdf8',
          borderTopColor: '#e7d8c9',
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
      initialRouteName="Map"
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Home', tabBarIcon: ({ color, size }) => <Text style={{ fontSize: size, color }}>🏠</Text> }} />
      <Tab.Screen name="Map" component={MapScreen} options={{ title: 'Map', tabBarIcon: ({ color, size }) => <Text style={{ fontSize: size, color }}>🗺️</Text> }} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ title: 'History', tabBarIcon: ({ color, size }) => <Text style={{ fontSize: size, color }}>📋</Text> }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings', tabBarIcon: ({ color, size }) => <Text style={{ fontSize: size, color }}>⚙️</Text> }} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <AuthProvider>
      <AppNavigatorInner />
    </AuthProvider>
  );
}

function AppNavigatorInner() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f7f4ee' }}>
        <ActivityIndicator size="large" color="#8a5a44" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator>
        <Stack.Screen
          name="Auth"
          component={AuthScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AlarmDetail"
          component={AlarmDetailScreen}
          options={{ title: 'Alarm Detail' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}