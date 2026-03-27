import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

export function AuthScreen() {
  const { login, register } = useAuth();
  const navigation = useNavigation();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const goToApp = () => {
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: 'MainTabs' as never }] }),
    );
  };

  const handleSubmit = async () => {
    setError('');
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        await login(trimmedEmail, password);
      } else {
        await register(trimmedEmail, password);
      }
      goToApp();
    } catch (e: any) {
      const msg =
        e?.response?.data?.detail ||
        (isLogin ? 'Invalid email or password' : 'Registration failed');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Proximity Alarm</Text>
      <Text style={styles.subtitle}>{isLogin ? 'Sign In' : 'Create Account'}</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#9ca3af"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        textContentType="emailAddress"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#9ca3af"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        textContentType="password"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        style={[styles.btn, loading && styles.btnDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.btnText}>{isLogin ? 'Sign In' : 'Register'}</Text>
        )}
      </Pressable>

      <Pressable onPress={() => { setIsLogin(!isLogin); setError(''); }}>
        <Text style={styles.toggle}>
          {isLogin ? "Don't have an account? Register" : 'Already have an account? Sign In'}
        </Text>
      </Pressable>

      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.line} />
      </View>

      <Pressable
        style={styles.guestBtn}
        onPress={goToApp}
      >
        <Text style={styles.guestBtnText}>Continue as Guest (max 3 zones)</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f4ee',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#8a5a44',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2a37',
    textAlign: 'center',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e7d8c9',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1f2a37',
    backgroundColor: '#fff',
  },
  error: {
    color: '#dc2626',
    fontSize: 13,
    textAlign: 'center',
  },
  btn: {
    backgroundColor: '#8a5a44',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  toggle: {
    color: '#8a5a44',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#e7d8c9',
  },
  dividerText: {
    color: '#7a8793',
    fontSize: 13,
    marginHorizontal: 12,
  },
  guestBtn: {
    borderWidth: 1,
    borderColor: '#e7d8c9',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  guestBtnText: {
    color: '#7a8793',
    fontWeight: '600',
    fontSize: 14,
  },
});
