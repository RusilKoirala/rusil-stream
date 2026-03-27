import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { decodeToken } from '../lib/api';

const AuthContext = createContext(null);
const STORAGE_KEY = 'streaming_app_auth_token';
const PROFILE_KEY = 'streaming_app_profile_id';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [profileId, setProfileId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 3000);
    Promise.all([
      AsyncStorage.getItem(STORAGE_KEY),
      AsyncStorage.getItem(PROFILE_KEY),
    ]).then(([stored, storedProfile]) => {
      clearTimeout(timeout);
      if (stored) {
        const decoded = decodeToken(stored);
        if (decoded) {
          setToken(stored);
          setUser(decoded);
          setProfileId(storedProfile || null);
        }
      }
      setLoading(false);
    }).catch(() => setLoading(false));
    return () => clearTimeout(timeout);
  }, []);

  async function login(newToken, firstProfileId = null) {
    await AsyncStorage.setItem(STORAGE_KEY, newToken);
    const decoded = decodeToken(newToken);
    setToken(newToken);
    setUser(decoded);
    if (firstProfileId) {
      await AsyncStorage.setItem(PROFILE_KEY, firstProfileId);
      setProfileId(firstProfileId);
    }
  }

  async function selectProfile(pid) {
    await AsyncStorage.setItem(PROFILE_KEY, pid);
    setProfileId(pid);
  }

  async function logout() {
    await AsyncStorage.removeItem(STORAGE_KEY);
    await AsyncStorage.removeItem(PROFILE_KEY);
    setToken(null);
    setUser(null);
    setProfileId(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, profileId, loading, login, logout, selectProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
