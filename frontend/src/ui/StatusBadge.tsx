import { StyleSheet, Text, View } from 'react-native';

type StatusTone = 'healthy' | 'loading' | 'error';

const toneStyles: Record<StatusTone, { backgroundColor: string; color: string }> = {
  healthy: {
    backgroundColor: '#dff6e7',
    color: '#1f6b3d',
  },
  loading: {
    backgroundColor: '#efe7d2',
    color: '#7a5a12',
  },
  error: {
    backgroundColor: '#f9dfdf',
    color: '#8b2e2e',
  },
};

export function StatusBadge({ label, tone }: { label: string; tone: StatusTone }) {
  return (
    <View style={[styles.badge, { backgroundColor: toneStyles[tone].backgroundColor }]}>
      <Text style={[styles.text, { color: toneStyles[tone].color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
