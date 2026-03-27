// Feature: multi-platform-monorepo, Properties 5-7: Auth helpers correctness
import * as fc from 'fast-check';
import { saveToken, getToken, clearToken, decodeToken } from '../tokenStore.js';

/**
 * Build a JWT with the given payload (unsigned, for testing decodeToken only).
 */
function buildJWT(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${header}.${body}.fakesig`;
}

const futureExp = () => Math.floor(Date.now() / 1000) + 3600;
const pastExp = () => Math.floor(Date.now() / 1000) - 1;

/**
 * Validates: Requirements 4.1, 4.2
 * Property 5: saveToken → getToken returns same token
 */
describe('Property 5: token round-trip', () => {
  test('saveToken then getToken returns the same non-expired token', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.emailAddress(),
        async (userId, email) => {
          const token = buildJWT({ userId, email, exp: futureExp() });
          await saveToken(token);
          const retrieved = await getToken();
          return retrieved === token;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Validates: Requirements 4.4
 * Property 6: saveToken → clearToken → getToken = null
 */
describe('Property 6: clear round-trip', () => {
  test('saveToken then clearToken then getToken returns null', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.emailAddress(),
        async (userId, email) => {
          const token = buildJWT({ userId, email, exp: futureExp() });
          await saveToken(token);
          await clearToken();
          const retrieved = await getToken();
          return retrieved === null;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Validates: Requirements 4.5
 * Property 7: decodeToken extracts correct payload fields
 */
describe('Property 7: decodeToken extracts correct payload fields', () => {
  test('returns userId, email, exp from valid non-expired JWT', () => {
    const exp = futureExp();
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.emailAddress(),
        (userId, email) => {
          const token = buildJWT({ userId, email, exp });
          const decoded = decodeToken(token);
          return (
            decoded !== null &&
            decoded.userId === userId &&
            decoded.email === email &&
            decoded.exp === exp
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  test('returns null for expired tokens', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.emailAddress(),
        (userId, email) => {
          const token = buildJWT({ userId, email, exp: pastExp() });
          return decodeToken(token) === null;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('returns null for malformed tokens', () => {
    fc.assert(
      fc.property(
        fc.string({ maxLength: 30 }),
        (garbage) => {
          const notJwt = garbage.replace(/\./g, '');
          return decodeToken(notJwt) === null;
        }
      ),
      { numRuns: 100 }
    );
  });
});
