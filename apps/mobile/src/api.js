import { createApiClient } from '@streaming-app/shared';

// Use your local machine's IP so the phone can reach it over WiFi
// Set EXPO_PUBLIC_API_URL in apps/mobile/.env
const baseUrl = process.env.EXPO_PUBLIC_API_URL ?? 'https://api.rusilstream.app';

async function getToken() {
  try {
    const SecureStore = await import('expo-secure-store');
    return await SecureStore.getItemAsync('streaming_app_auth_token');
  } catch {
    return null;
  }
}

const api = createApiClient({ baseUrl, getToken });

export default api;
