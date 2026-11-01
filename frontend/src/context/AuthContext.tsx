import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { User } from '../types';
import { setAuthToken } from '../api/client';
import { getMe } from '../api/auth';

interface AuthContextType {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

const TOKEN_KEY = 'mealbox360_auth_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize auth state on startup
  useEffect(() => {
    const bootstrap = async () => {
      try {
        let storedToken: string | null = null;
        try {
          storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
        } catch {
          // In some web / emulator environments SecureStore might fail gracefully
        }

        if (storedToken) {
          setAuthToken(storedToken);
          setTokenState(storedToken);
          try {
            const profile = await getMe();
            setUser(profile);
          } catch (e) {
            console.warn('Failed to load user profile with stored token:', e);
            // If token expired/invalid, clear it
            setAuthToken(null);
            setTokenState(null);
            await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
  }, []);

  const login = async (newToken: string) => {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, newToken);
    } catch {
      // fallback
    }
    setAuthToken(newToken);
    setTokenState(newToken);
    try {
      const profile = await getMe();
      setUser(profile);
    } catch (e) {
      console.warn('Error fetching user after login:', e);
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch {
      // fallback
    }
    setAuthToken(null);
    setTokenState(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (token) {
      try {
        const profile = await getMe();
        setUser(profile);
      } catch (e) {
        console.warn('Failed to refresh user profile:', e);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ token, user, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
