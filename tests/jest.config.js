module.exports = {
  testEnvironment: 'allure-jest/node',
  testEnvironmentOptions: {
    resultsDir: './tests/allure-results'
  },
  testMatch: ['**/tests/**/*.test.js'],
  verbose: true,
  testTimeout: 60000
};
