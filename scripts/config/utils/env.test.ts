import { normalizePath } from "@/scripts/shared/normalize-path";
import process from "node:process";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Config } from "../types";
import { config } from "./env";
import * as getConfigModule from "./get-config";

describe("env.ts Proxy & Integration Suite", () => {
  const cwd = normalizePath(process.cwd(), true);
  beforeEach(() => {
    getConfigModule.resetConfig();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    vi.resetModules();
  });

  afterEach(() => {
    getConfigModule.resetConfig();
    vi.unstubAllEnvs();
  });

  describe("Real Config Proxy Evaluation", () => {
    it("should dynamically resolve config properties from the real getConfig() implementation", () => {
      vi.stubEnv("CI", "true");
      vi.stubEnv("GITHUB_REF_NAME", "refs/heads/main");

      expect(config.isCI).toBe(true);
      expect(config.github.refName).toBe("refs/heads/main");
      expect(config.cwd).toBe(cwd);
    });

    it("should reflect updated process.env values immediately after resetConfig()", () => {
      vi.stubEnv("CI", "false");
      expect(config.isCI).toBe(false);

      // Mutate environment state and clear config cache
      vi.stubEnv("CI", "true");
      getConfigModule.resetConfig();

      // Proxy trap reads re-evaluated config on next property access
      expect(config.isCI).toBe(true);
    });

    it("should resolve relative paths relative to process.cwd() using real path schemas", () => {
      vi.stubEnv("CHANGELOG_PATH", "docs/HISTORY.md");
      getConfigModule.resetConfig();

      expect(config.paths.changelog).toBe(`${cwd}/docs/HISTORY.md`);
    });
  });

  describe("Edge Cases & Proxy Traps", () => {
    it("should support object destructuring across multiple properties", () => {
      vi.stubEnv("CI", "true");
      getConfigModule.resetConfig();

      const { isCI, cwd: configWD, paths } = config;

      expect(isCI).toBe(true);
      expect(configWD).toBe(cwd);
      expect(paths.changelog).toBe(`${cwd}/CHANGELOG.md`);
    });

    it("should return undefined for non-existent property keys on Config", () => {
      const nonExistentKey = (config as unknown as Record<string, unknown>)[
        "invalidKeyName"
      ];

      expect(nonExistentKey).toBeUndefined();
    });

    it("should safely handle Symbol property lookups without throwing", () => {
      const symbolProp = Symbol("test.symbol");

      expect(() => {
        const value = (config as unknown as Record<symbol, unknown>)[
          symbolProp
        ];
        expect(value).toBeUndefined();
      }).not.toThrow();
    });

    it("should propagate validation errors thrown by getConfig() through the Proxy getter", () => {
      // Spy on getConfig to simulate runtime schema validation error
      vi.spyOn(getConfigModule, "getConfig").mockImplementationOnce(() => {
        throw new Error(
          "Environment validation failed: paths.changelog: File does not exist",
        );
      });

      expect(() => config.paths).toThrowError(
        "Environment validation failed: paths.changelog: File does not exist",
      );
    });

    it("should correctly forward function execution if a method exists on the config object", () => {
      const customConfig = {
        ...getConfigModule.getConfig(),
        customHelper: vi.fn().mockReturnValue("helper_output"),
      };

      vi.spyOn(getConfigModule, "getConfig").mockReturnValueOnce(
        customConfig as unknown as Config,
      );

      expect((config as unknown as typeof customConfig).customHelper()).toBe(
        "helper_output",
      );
    });
  });
});
