const path = require('path')

module.exports = {
  rootDir: path.join(__dirname, '../'),
  testEnvironment: "node",
  verbose: true,
  globals: {
    __DEV__: true
  },
  moduleNameMapper: {},
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.js?(x)",
    "<rootDir>/scripts/**/__tests__/**/*.js?(x)"
  ],
  transformIgnorePatterns: [
    ".*"
  ],
  collectCoverageFrom: [
    "src/**/*.{js}",
    "!**/__mocks__/**/*.{js}"
  ],
  coverageDirectory: "reports/coverage",
  setupFilesAfterEnv: []
}