import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>Proximity Alarm</Text>
      <Text style={styles.title}>Frontend Hello World</Text>
      <Text style={styles.body}>
        This Expo app will become the mobile client for the FastAPI backend.
      </Text>
      <Text style={styles.body}>
        Next steps: add navigation, connect to the API, and introduce location features.
      </Text>
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f4ee',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  eyebrow: {
    color: '#8a5a44',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  title: {
    color: '#1f2a37',
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 16,
  },
  body: {
    color: '#3b4a59',
    fontSize: 17,
    lineHeight: 25,
    marginBottom: 10,
  },
});
