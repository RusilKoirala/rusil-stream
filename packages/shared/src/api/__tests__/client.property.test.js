// Feature: multi-platform-monorepo, Properties 1-4: API client correctness
import * as fc from 'fast-check';
import { createApiClient, ApiError } from '../client.js';

const REQUIRED_METHODS = [
  'login', 'signup', 'logout', 'getProfiles', 'getSaved', 'addSaved',
  'removeSaved', 'getHistory', 'addHistory', 'getTrending', 'getPopular',
  'getTopRated', 'searchContent', 'getMovieDetail', 'getTVDetail',
];

function makeFetch(status, body) {
  return async () => ({
    ok: status >= 200 && status < 300,
    status,
    statusText: 'Status ' + status,
    json: async () => body,
  });
}

/**
 * Validates: Requirements 3.1
 * Property 1: API client exposes all required endpoint methods
 */
describe('Property 1: API client exposes all required endpoint methods', () => {
  test('createApiClient returns all 15 endpoint methods', () => {
    fc.assert(
      fc.property(
        fc.webUrl(),
        (baseUrl) => {
          const client = createApiClient({ baseUrl, getToken: async () => null });
          return REQUIRED_METHODS.every((m) => typeof client[m] === 'function');
        }
      ),
      { numRuns: 50 }
    );
  });
});

/**
 * Validates: Requirements 3.2, 3.4
 * Property 2: API client routes requests to the configured base URL
 */
describe('Property 2: API client routes requests to the configured base URL', () => {
  test('requests are sent to the configured baseUrl', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.webUrl(),
        async (baseUrl) => {
          let capturedUrl = null;
          global.fetch = async (url) => {
            capturedUrl = url;
            return { ok: true, status: 200, json: async () => ({}) };
          };

          const client = createApiClient({ baseUrl, getToken: async () => null });
          try { await client.getTrending(); } catch { /* ignore */ }

          return capturedUrl !== null && capturedUrl.startsWith(baseUrl);
        }
      ),
      { numRuns: 50 }
    );
  });
});

/**
 * Validates: Requirements 3.3
 * Property 3: API client throws ApiError on non-2xx responses
 */
describe('Property 3: API client throws ApiError on non-2xx responses', () => {
  test('throws ApiError with correct status for 4xx/5xx responses', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 400, max: 599 }),
        async (status) => {
          global.fetch = makeFetch(status, { error: 'Something went wrong' });

          const client = createApiClient({
            baseUrl: 'http://localhost:3000',
            getToken: async () => null,
          });

          try {
            await client.getTrending();
            return false; // should have thrown
          } catch (err) {
            return err instanceof ApiError && err.status === status;
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Validates: Requirements 3.5
 * Property 4: API client attaches Bearer token when a token is provided
 */
describe('Property 4: API client attaches Bearer token when provided', () => {
  test('Authorization header contains Bearer token', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 200 }),
        async (token) => {
          let capturedHeaders = null;
          global.fetch = async (url, opts) => {
            capturedHeaders = opts?.headers ?? {};
            return { ok: true, status: 200, json: async () => ({}) };
          };

          const client = createApiClient({
            baseUrl: 'http://localhost:3000',
            getToken: async () => token,
          });

          try { await client.getTrending(); } catch { /* ignore */ }

          return capturedHeaders?.Authorization === `Bearer ${token}`;
        }
      ),
      { numRuns: 100 }
    );
  });
});
