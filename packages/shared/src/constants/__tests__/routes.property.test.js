// Feature: multi-platform-monorepo, Property 8: ROUTES constant completeness
import * as fc from 'fast-check';
import { ROUTES } from '../index.js';

const REQUIRED_KEYS = [
  'LOGIN', 'SIGNUP', 'LOGOUT', 'PROFILES', 'SAVED',
  'HISTORY', 'TRENDING', 'POPULAR', 'TOP_RATED', 'SEARCH',
];

/**
 * Validates: Requirements 5.2
 * Property 8: ROUTES constant completeness
 * Every required key maps to a non-empty string starting with /api/
 */
describe('Property 8: ROUTES constant completeness', () => {
  test('all required keys exist and map to /api/ paths', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...REQUIRED_KEYS),
        (key) => {
          const value = ROUTES[key];
          return (
            typeof value === 'string' &&
            value.length > 0 &&
            value.startsWith('/api/')
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  test('ROUTES has exactly the required keys', () => {
    for (const key of REQUIRED_KEYS) {
      expect(ROUTES).toHaveProperty(key);
      expect(typeof ROUTES[key]).toBe('string');
      expect(ROUTES[key].startsWith('/api/')).toBe(true);
    }
  });
});
