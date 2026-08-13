import "@testing-library/jest-dom";
import { afterEach, beforeEach, vi } from "vitest";

// Environment variables to isolate across all tests
const GHA_ENV_VARS = [
  "GITHUB_REF",
  "GITHUB_REF_NAME",
  "GITHUB_REF_TYPE",
  "GITHUB_STEP_SUMMARY",
  "GITHUB_ENV",
  "GITHUB_OUTPUT",
  "GITHUB_REPOSITORY",
  "GITHUB_EVENT_PATH",
  "GITHUB_TOKEN",
  "RELEASE_VERSION",
];

beforeEach(() => {
  // Save/stub clean baseline for tests
  for (const envVar of GHA_ENV_VARS) {
    if (envVar in process.env) {
      vi.stubEnv(envVar, "");
    }
  }
});

afterEach(() => {
  vi.unstubAllEnvs();
});
