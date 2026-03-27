import React, { createContext, useContext, useState, useEffect } from 'react';
import { saveToken, getToken, clearToken, decodeToken } from '@streaming-app/shared';

const AuthContext = createContext(null);

/**
 * Provides auth token and profile state to the TV app.
 */
export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore token on mount
  useEffect(() => {
    (async () => {
      const stored = await getToken();
      if (stored) {
        setToken(stored);
        setUser(decodeToken(stored));
      }
      setLoading(false);
    })();
  }, []);

  /**
   * Persist a new JWT and update state.
   * @param {string} newToken
   */
  async function login(newToken) {
    await saveToken(newToken);
    setToken(newToken);
    setUser(decodeToken(newToken));
  }

  /**
   * Clear the stored token and reset state.
   */
  async function logout() {
    await clearToken();
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth context.
 * @returns {{ token: string|null, user: object|null, loading: boolean, login: Function, logout: Function }}
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
