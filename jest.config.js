module.exports = {
  preset: 'react-native',
  modulePathIgnorePatterns: ['<rootDir>/example/', '<rootDir>/lib/'],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  testMatch: ['**/__tests__/**/?(*.)+(spec|test).[jt]s?(x)'],
  collectCoverage: true,
  collectCoverageFrom: [
    '**/src/**/*.[jt]s?(x)',
    '!**/__tests__/**"',
    '!**/__utils__/**"',
    '!**/example/**',
  ],
};
