import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AlarmDetailScreen } from '../screens/AlarmDetailScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { MapScreen } from '../screens/MapScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
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
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Map" component={MapScreen} options={{ title: 'Map' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator>
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