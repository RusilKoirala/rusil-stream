import { createApiClient } from './lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const baseUrl = process.env.EXPO_PUBLIC_API_URL ?? 'https://rusilstream.app';

async function getToken() {
  try {
    return await AsyncStorage.getItem('streaming_app_auth_token');
  } catch {
    return null;
  }
}

const api = createApiClient({ baseUrl, getToken });

export default api;
