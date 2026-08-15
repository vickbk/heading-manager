import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Local flat environment baseline stubs
const DEFAULT_TEST_ENV: Record<string, string> = {
  CWD: "test/workdir/",
  IS_CI: "false",
  GITHUB_STEP_SUMMARY_PATH: "test/step/summary/path",
  GITHUB_ENV_PATH: "test/env/path",
  GITHUB_REF_NAME: "test/ref/name",
  PATH_VITEST_REPORT: "test/vitest/coverage-report.json",
  PATH_CHANGELOG: "test/CHANGELOG.md",
};

/**
 * Initializes process.env with baseline test defaults and applies optional overrides.
 * Uses `vi.stubEnv` for isolated, auto-cleared test state.
 */
export function initConfig(
  overrides: Record<string, string | undefined | null> = {},
): void {
  const merged: Record<string, string | undefined | null> = {
    ...DEFAULT_TEST_ENV,
    ...overrides,
  };

  for (const [key, value] of Object.entries(merged)) {
    if (value === undefined || value === null) {
      delete process.env[key];
    } else {
      vi.stubEnv(key, value);
    }
  }
}

/**
 * Restores process.env to its un-stubbed state.
 */
export function resetConfig(): void {
  vi.unstubAllEnvs();
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

  it("should initialize default baseline environment variables", () => {
    expect(process.env.CWD).toBe("test/workdir/");
    expect(process.env.IS_CI).toBe("false");
    expect(process.env.GITHUB_REF_NAME).toBe("test/ref/name");
  });

  it("should initialize with custom provided keys", () => {
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
      GITHUB_REF_NAME: null,
    });

    expect(process.env.TMDB_API_KEY).toBeUndefined();
    expect(process.env.GITHUB_REF_NAME).toBeUndefined();
  });

  it("should completely restore original process.env on resetConfig", () => {
    const stubSpy = vi.spyOn(vi, "unstubAllEnvs");

    initConfig({
      TEMPORARY_VAR: "temporary_value",
    });
    expect(process.env.TEMPORARY_VAR).toBe("temporary_value");

    resetConfig();

    expect(stubSpy).toHaveBeenCalledTimes(1);
    expect(process.env.TEMPORARY_VAR).toBeUndefined();
  });
});
