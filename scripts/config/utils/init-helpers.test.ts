import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { vi } from "vitest";

const DEFAULT_TEST_ENV = {
  cwd: "test/workdir/",
  isCI: false,
  github: {
    stepSummaryPath: "test/step/summary/path",
    envPath: "test/env/path",
    refName: "test/ref/name",
  },
  paths: {
    vitestReport: "test/vitest/coverage-report.json",
    changelog: "test/CHANGELOG.md",
  },
};

/**
 * Initializes process.env with baseline test defaults and applies optional overrides.
 * Uses `vi.stubEnv` when available to enable automatic cleanup with `vi.unstubAllEnvs()`.
 */
export function initConfig(
  overrides: Record<string, string | undefined | null> = {},
): void {
  const merged = {
    ...DEFAULT_TEST_ENV,
    ...overrides,
  };

  for (const [key, value] of Object.entries(merged)) {
    if (value === undefined || value === null) {
      delete process.env[key];
    } else if (typeof vi !== "undefined" && typeof vi.stubEnv === "function") {
      vi.stubEnv(key, value as string);
    } else {
      process.env[key] = value as string;
    }
  }
}

/**
 * Restores process.env to its un-stubbed state.
 */
export function resetConfig(): void {
  if (typeof vi !== "undefined" && typeof vi.unstubAllEnvs === "function") {
    vi.unstubAllEnvs();
  }
}

describe("env resolution with central config setup", () => {
  beforeEach(() => {
    // Populate process.env with standard default test values
    initConfig();
  });

  afterEach(() => {
    // Clean up stubs so tests don't leak state into each other
    resetConfig();
  });

  it("should initialize with default keys", () => {
    initConfig({
      DATABASE_URL: "test_db_url",
      AUTH_SECRET: "test_auth_secret",
    });
    expect(process.env.DATABASE_URL).toBe("test_db_url");
    expect(process.env.AUTH_SECRET).toBe("test_auth_secret");
  });

  it("should allow single-test key overrides", () => {
    initConfig({
      DATABASE_URL:
        "postgresql://custom_user:custom_pass@localhost:5432/custom_db",
      NEW_FEATURE_FLAG: "true",
    });

    expect(process.env.DATABASE_URL).toBe(
      "postgresql://custom_user:custom_pass@localhost:5432/custom_db",
    );
    expect(process.env.NEW_FEATURE_FLAG).toBe("true");
  });

  it("should allow unsetting/deleting specific variables", () => {
    initConfig({
      TMDB_API_KEY: undefined,
    });

    expect(process.env.TMDB_API_KEY).toBeUndefined();
  });
});
