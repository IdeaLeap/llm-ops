/* eslint-env node */
module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:prettier/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-type-checked",
    "plugin:@typescript-eslint/stylistic",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  overrides: [
    {
      files: ["*.js"],
      extends: ["plugin:@typescript-eslint/disable-type-checked"],
    },
  ],
  parserOptions: {
    project: './tsconfig.json',
    sourceType: "module",
  },
  root: true,
  rules: {
    "prettier/prettier": "error",
    "@typescript-eslint/no-explicit-any": 0,
    "@typescript-eslint/no-unsafe-assignment": 0,
    "@typescript-eslint/no-unsafe-member-access": "warn",
    "@typescript-eslint/no-empty-function": "warn",
    "no-constant-condition": 0,
    "@typescript-eslint/no-unsafe-call": "warn",
    "@typescript-eslint/no-unsafe-argument": 0,
    "@typescript-eslint/no-unsafe-return": "warn",
    "@typescript-eslint/no-redundant-type-constituents": 0,
    "no-debugger":0,
    "@typescript-eslint/no-unsafe-member-access":0
  },
};
