import { type Config } from "jest"
// Sync object

const config: Config = {
  verbose: true,
  rootDir: ".",
  testEnvironment: 'jest-environment-node',
  testMatch: ["**/*.spec.ts"],
  transform: {
    "^.+\\.ts?$": "ts-jest",
  },
};

export default config;