import * as SecureStore from 'expo-secure-store';

const STORAGE_KEY = 'streaming_app_auth_token';

/**
 * Persist a JWT token to secure storage.
 * @param {string} token
 * @returns {Promise<void>}
 */
export async function saveToken(token) {
  await SecureStore.setItemAsync(STORAGE_KEY, token);
}

/**
 * Retrieve the stored JWT token. Returns null if no token is stored or if
 * the stored token is expired.
 * @returns {Promise<string|null>}
 */
export async function getToken() {
  const token = await SecureStore.getItemAsync(STORAGE_KEY);
  if (!token) return null;
  const decoded = decodeToken(token);
  if (!decoded) {
    // Token is expired or malformed — clean it up
    await SecureStore.deleteItemAsync(STORAGE_KEY);
    return null;
  }
  return token;
}

/**
 * Remove the stored JWT token from secure storage.
 * @returns {Promise<void>}
 */
export async function clearToken() {
  await SecureStore.deleteItemAsync(STORAGE_KEY);
}

/**
 * Decode a JWT payload without verifying the signature.
 * Returns null if the token is malformed or expired.
 * @param {string} token
 * @returns {{ userId: string, email: string, exp: number }|null}
 */
export function decodeToken(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // Base64url → base64 → decode
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const payload = JSON.parse(atob(padded));

    if (typeof payload.exp === 'number' && payload.exp < Date.now() / 1000) {
      return null;
    }

    return {
      userId: payload.userId ?? payload.sub ?? null,
      email: payload.email ?? null,
      exp: payload.exp ?? null,
    };
  } catch {
    return null;
  }
}
