import { afterEach, describe, expect, it, vi } from "vitest";
import { normalizeVersionTag, resolveVersionTag } from "./version-tag";

describe("normalizeVersionTag", () => {
  it("should strip lowercase 'v' prefix", () => {
    expect(normalizeVersionTag("v1.2.3")).toBe("1.2.3");
  });

  it("should strip uppercase 'V' prefix", () => {
    expect(normalizeVersionTag("V1.2.3")).toBe("1.2.3");
  });

  it("should return version unchanged if no 'v' prefix exists", () => {
    expect(normalizeVersionTag("1.2.3")).toBe("1.2.3");
  });

  it("should trim surrounding whitespace before stripping prefix", () => {
    expect(normalizeVersionTag("  v2.0.0-beta.1  ")).toBe("2.0.0-beta.1");
  });

  it("should only strip the initial leading 'v' and preserve subsequent 'v' characters", () => {
    expect(normalizeVersionTag("v1.0.0-v2")).toBe("1.0.0-v2");
  });

  it("should handle empty string and whitespace-only inputs gracefully", () => {
    expect(normalizeVersionTag("")).toBe("");
    expect(normalizeVersionTag("   ")).toBe("");
  });

  it("should return empty string when input consists only of 'v' or 'V'", () => {
    expect(normalizeVersionTag("v")).toBe("");
    expect(normalizeVersionTag("V")).toBe("");
  });
});

describe("resolveVersionTag", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("Precedence Resolution", () => {
    it("should prioritize CLI argument over GITHUB_REF_NAME and RELEASE_VERSION", () => {
      const env = {
        GITHUB_REF_NAME: "v2.0.0",
        RELEASE_VERSION: "v3.0.0",
      };

      const result = resolveVersionTag("v1.0.0", env);

      expect(result).toBe("1.0.0");
    });

    it("should fallback to GITHUB_REF_NAME when CLI argument is missing or undefined", () => {
      const env = {
        GITHUB_REF_NAME: "v2.0.0",
        RELEASE_VERSION: "v3.0.0",
      };

      const result = resolveVersionTag(undefined, env);

      expect(result).toBe("2.0.0");
    });

    it("should fallback to RELEASE_VERSION when CLI argument and GITHUB_REF_NAME are missing", () => {
      const env = {
        GITHUB_REF_NAME: undefined,
        RELEASE_VERSION: "v3.0.0",
      };

      const result = resolveVersionTag(undefined, env);

      expect(result).toBe("3.0.0");
    });

    it("should treat empty string CLI argument as falsy and fallback to environment variables", () => {
      const env = {
        GITHUB_REF_NAME: "v2.5.0",
      };

      const result = resolveVersionTag("", env);

      expect(result).toBe("2.5.0");
    });
  });

  describe("Process Environment Fallback", () => {
    it("should read from process.env when custom env map is omitted", () => {
      vi.stubEnv("GITHUB_REF_NAME", "v1.4.2");

      const result = resolveVersionTag();

      expect(result).toBe("1.4.2");
    });
  });

  describe("Error Propagation", () => {
    it("should throw an error when no version sources are provided", () => {
      const env = {};

      expect(() => resolveVersionTag(undefined, env)).toThrow(
        "No version tag provided. Pass as an argument or set GITHUB_REF_NAME / RELEASE_VERSION.",
      );
    });

    it("should throw an error when all resolution sources evaluate to empty strings", () => {
      const env = {
        GITHUB_REF_NAME: "",
        RELEASE_VERSION: "",
      };

      expect(() => resolveVersionTag("", env)).toThrow(
        "No version tag provided. Pass as an argument or set GITHUB_REF_NAME / RELEASE_VERSION.",
      );
    });
  });
});
