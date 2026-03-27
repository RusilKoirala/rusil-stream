import React, { createContext, useContext, useState, useEffect } from 'react';
import { decodeToken } from '@streaming-app/shared';

const AuthContext = createContext(null);
const STORAGE_KEY = 'streaming_app_auth_token';
const PROFILE_KEY = 'streaming_app_profile_id';

async function secureGet(key) {
  try {
    const SS = await import('expo-secure-store');
    return await SS.getItemAsync(key);
  } catch { return null; }
}

async function secureSet(key, value) {
  try {
    const SS = await import('expo-secure-store');
    await SS.setItemAsync(key, value);
  } catch {}
}

async function secureDel(key) {
  try {
    const SS = await import('expo-secure-store');
    await SS.deleteItemAsync(key);
  } catch {}
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);       // decoded JWT payload
  const [profileId, setProfileId] = useState(null); // selected profile _id
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 3000);
    Promise.all([secureGet(STORAGE_KEY), secureGet(PROFILE_KEY)]).then(([stored, storedProfile]) => {
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
    });
    return () => clearTimeout(timeout);
  }, []);

  async function login(newToken, firstProfileId = null) {
    await secureSet(STORAGE_KEY, newToken);
    const decoded = decodeToken(newToken);
    setToken(newToken);
    setUser(decoded);
    if (firstProfileId) {
      await secureSet(PROFILE_KEY, firstProfileId);
      setProfileId(firstProfileId);
    }
  }

  async function selectProfile(pid) {
    await secureSet(PROFILE_KEY, pid);
    setProfileId(pid);
  }

  async function logout() {
    await secureDel(STORAGE_KEY);
    await secureDel(PROFILE_KEY);
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
