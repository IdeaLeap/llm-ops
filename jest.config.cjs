/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  modulePathIgnorePatterns: ["dist/", "docs/"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.m?[tj]sx?$": ["ts-jest", { useESM: true }, {
      tsconfig: 'tsconfig.json',
    },],
  },
  transformIgnorePatterns: [
    "/node_modules/",
  ],
  setupFiles: ["dotenv/config"],
  testTimeout: 20_000,
};