import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";
import { Config, ConfigError } from "../types";
import { configSchema } from "./config-schema";
import { getConfig, resetConfig } from "./get-config";

describe("getConfig & resetConfig", () => {
  beforeEach(() => {
    // Ensure clean state before every test
    resetConfig();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("Caching & Reset Lifecycle", () => {
    it("should memoize the config object on subsequent calls", () => {
      vi.stubEnv("CI", "true");
      const firstCall = getConfig();

      vi.stubEnv("CI", "false");
      const secondCall = getConfig();

      expect(firstCall).toBe(secondCall);
      expect(secondCall.isCI).toBe(true);
    });

    it("should re-evaluate environment and create a new instance after resetConfig()", () => {
      vi.stubEnv("CI", "true");
      const firstCall = getConfig();

      resetConfig();

      vi.stubEnv("CI", "false");
      const secondCall = getConfig();

      expect(firstCall).not.toBe(secondCall);
      expect(firstCall.isCI).toBe(true);
      expect(secondCall.isCI).toBe(false);
    });
  });

  describe("GitHub Reference Precedence (GITHUB_REF_NAME vs RELEASE_VERSION)", () => {
    it("should prioritize GITHUB_REF_NAME over RELEASE_VERSION when both are present", () => {
      vi.stubEnv("GITHUB_REF_NAME", "refs/heads/main");
      vi.stubEnv("RELEASE_VERSION", "v1.0.0");

      const config = getConfig();
      expect(config.github.refName).toBe("refs/heads/main");
    });

    it("should fallback to RELEASE_VERSION when GITHUB_REF_NAME is undefined", () => {
      vi.stubEnv("GITHUB_REF_NAME", "");
      vi.stubEnv("RELEASE_VERSION", "v2.5.0");

      const config = getConfig();
      expect(config.github.refName).toBe("v2.5.0");
    });

    it("should fallback to RELEASE_VERSION when GITHUB_REF_NAME is an empty string", () => {
      vi.stubEnv("GITHUB_REF_NAME", "");
      vi.stubEnv("RELEASE_VERSION", "v3.0.0");

      const config = getConfig();
      expect(config.github.refName).toBe("v3.0.0");
    });

    it("should pass undefined/empty to schema when neither GITHUB_REF_NAME nor RELEASE_VERSION is set", () => {
      delete process.env.GITHUB_REF_NAME;
      delete process.env.RELEASE_VERSION;

      const config = getConfig();
      expect(config.github.refName).toBeDefined();
    });
  });

  describe("Environment Mapping & Context", () => {
    it("should pass current working directory (process.cwd()) to schema parse", () => {
      const spyCwd = vi
        .spyOn(process, "cwd")
        .mockReturnValue("/mock/workspace");

      const config = getConfig();

      expect(spyCwd).toHaveBeenCalled();
      expect(config.cwd).toBe("/mock/workspace");
    });

    it("should map all environmental variables accurately to schema input", () => {
      vi.stubEnv("CI", "true");
      vi.stubEnv("GITHUB_STEP_SUMMARY", "/tmp/summary.md");
      vi.stubEnv("GITHUB_ENV", "/tmp/env");
      vi.stubEnv("COVERAGE_PATH", "custom/coverage.json");
      vi.stubEnv("CHANGELOG_PATH", "docs/CHANGELOG.md");

      const config = getConfig();

      expect(config.isCI).toBe(true);
      expect(config.github.stepSummaryPath).toBe("/tmp/summary.md");
      expect(config.github.envPath).toBe("/tmp/env");
      expect(config.paths.vitestReport).toContain("custom/coverage.json");
      expect(config.paths.changelog).toContain("docs/CHANGELOG.md");
    });
  });

  describe("Validation Failures & Error Formatting", () => {
    it("should throw a single formatted error message when validation fails", () => {
      vi.spyOn(configSchema, "safeParse").mockReturnValueOnce({
        success: false,
        error: {
          issues: [
            {
              path: ["paths", "vitestReport"],
              message: "File does not exist",
              code: "custom",
            },
          ],
        } as ZodError<Config>,
      });

      expect(() => getConfig()).toThrowError(
        "Environment validation failed: paths.vitestReport: File does not exist",
      );
    });

    it("should format and concatenate multiple validation error issues with semicolons", () => {
      vi.spyOn(configSchema, "safeParse").mockReturnValueOnce({
        success: false,
        error: {
          issues: [
            {
              path: ["cwd"],
              message: "Must be absolute",
              code: "custom",
            },
            {
              path: ["github", "refName"],
              message: "Required string",
              code: "custom",
            },
          ],
        } as ConfigError,
      });

      expect(() => getConfig()).toThrowError(
        "Environment validation failed: cwd: Must be absolute; github.refName: Required string",
      );
    });

    it("should handle top-level schema validation issue paths correctly", () => {
      vi.spyOn(configSchema, "safeParse").mockReturnValueOnce({
        success: false,
        error: {
          issues: [
            {
              path: ["isCI"],
              message: "Expected boolean, received string",
              code: "invalid_type",
              expected: "boolean",
              received: "string",
            },
          ],
        } as unknown as ConfigError,
      });

      expect(() => getConfig()).toThrowError(
        "Environment validation failed: isCI: Expected boolean, received string",
      );
    });
  });
});
