import { createApiClient, getToken } from '@streaming-app/shared';

const baseUrl = process.env.API_URL ?? 'http://localhost:3000';

/**
 * Shared API client instance for the TV app.
 * Uses the stored auth token for authenticated requests.
 */
const api = createApiClient({ baseUrl, getToken });

export default api;
