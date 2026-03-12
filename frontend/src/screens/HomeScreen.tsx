import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { MainTabParamList, RootStackParamList } from '../navigation/types';
import { InfoCard, ScreenLayout } from '../ui/ScreenLayout';

type HomeScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function HomeScreen({ navigation }: HomeScreenProps) {
  return (
    <ScreenLayout
      eyebrow="Dashboard"
      title="Control Center"
      description="This home screen is the operational entry point for the app. In a real product it becomes the place where users see active alarms, location status, and notification health."
      footer={
        <Pressable
          onPress={() => navigation.navigate('AlarmDetail', { alarmId: 'demo-alarm-1' })}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Open Sample Alarm Detail</Text>
        </Pressable>
      }
    >
      <InfoCard label="Current milestone" value="Frontend navigation and screen structure" />
      <InfoCard label="Next integration" value="Connect this app to the FastAPI health endpoint" />
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Why this screen exists</Text>
        <Text style={styles.bannerBody}>
          Professionals create structure early. It prevents business logic, navigation, and presentation from being mixed into one growing file.
        </Text>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#24313d',
    borderRadius: 18,
    padding: 18,
  },
  bannerTitle: {
    color: '#f7f4ee',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  bannerBody: {
    color: '#d8e2eb',
    fontSize: 15,
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#8a5a44',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  buttonText: {
    color: '#fffaf5',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
});