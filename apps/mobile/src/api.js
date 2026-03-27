import { createApiClient } from './lib/api';
import * as SecureStore from 'expo-secure-store';

const baseUrl = process.env.EXPO_PUBLIC_API_URL ?? 'https://api.rusilstream.app';

async function getToken() {
  try {
    return await SecureStore.getItemAsync('streaming_app_auth_token');
  } catch {
    return null;
  }
}

const api = createApiClient({ baseUrl, getToken });

export default api;
