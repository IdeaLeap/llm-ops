/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  modulePathIgnorePatterns: ["<rootDir>/dist/", "<rootDir>/docs/"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.m?[tj]sx?$": [
      "ts-jest",
      { useESM: true },
      {
        tsconfig: "tsconfig.json",
      },
    ],
  },
  transformIgnorePatterns: [
    "/node_modules/",
    "node_modules/(?!@ngrx|(?!deck.gl)|ng-dynamic)",
    "/node_modules/(?!mermaid-ssr)",
  ],
  setupFiles: ["dotenv/config"],
  testTimeout: 20_000,
  testMatch: ["<rootDir>/**/*.{spec,test}.ts"],
};
