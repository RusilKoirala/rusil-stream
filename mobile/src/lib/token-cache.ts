import * as SecureStore from "expo-secure-store";

const TOKEN_KEY_PREFIX = "clerk_token_";

export const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(`${TOKEN_KEY_PREFIX}${key}`);
    } catch {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(`${TOKEN_KEY_PREFIX}${key}`, value);
    } catch {
      // Ignore token write errors and allow Clerk to continue in-memory.
    }
  },
};
