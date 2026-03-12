import { PropsWithChildren, ReactNode } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

type ScreenLayoutProps = PropsWithChildren<{
  eyebrow: string;
  title: string;
  description: string;
  footer?: ReactNode;
}>;

export function ScreenLayout({
  eyebrow,
  title,
  description,
  footer,
  children,
}: ScreenLayoutProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        <View style={styles.section}>{children}</View>
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

export function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f4ee',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  eyebrow: {
    color: '#8a5a44',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  title: {
    color: '#1f2a37',
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 14,
  },
  description: {
    color: '#3b4a59',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  section: {
    gap: 12,
  },
  footer: {
    marginTop: 24,
  },
  card: {
    backgroundColor: '#fffdf8',
    borderColor: '#e7d8c9',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  cardLabel: {
    color: '#8a5a44',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  cardValue: {
    color: '#1f2a37',
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 24,
  },
});