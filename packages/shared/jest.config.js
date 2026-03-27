export default {
  testEnvironment: 'node',
  transform: {},
  testMatch: ['**/__tests__/**/*.test.js'],
  moduleNameMapper: {
    '^expo-secure-store$': '<rootDir>/src/auth/__mocks__/expo-secure-store.js',
  },
};
