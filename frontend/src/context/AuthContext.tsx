import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AuthUser,
  getStoredToken,
  getStoredUser,
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
} from '../services/authApi';
import { setTokenGetter } from '../config/apiClient';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isGuest: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  isGuest: true,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Wire up the token getter for the shared axios client
  useEffect(() => {
    setTokenGetter(async () => token);
  }, [token]);

  // Restore session from storage on mount
  useEffect(() => {
    (async () => {
      const [savedToken, savedUser] = await Promise.all([
        getStoredToken(),
        getStoredUser(),
      ]);
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(savedUser);
      }
      setLoading(false);
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    setToken(res.access_token);
    setUser(res.user);
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const res = await apiRegister(email, password);
    setToken(res.access_token);
    setUser(res.user);
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isGuest: !user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
