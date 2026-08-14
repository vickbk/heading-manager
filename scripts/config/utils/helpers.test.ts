import { describe, expect, it } from "vitest";
import { buildRequired } from "./helpers";

describe("buildRequired", () => {
  describe("truthy value inputs", () => {
    it("returns the exact value during build phase", () => {
      expect(buildRequired(true, "API_KEY_123")).toBe("API_KEY_123");
    });

    it("returns the exact value during runtime phase", () => {
      expect(buildRequired(false, "API_KEY_123")).toBe("API_KEY_123");
    });

    it("treats whitespace-only strings as truthy and returns them", () => {
      expect(buildRequired(true, "   ")).toBe("   ");
      expect(buildRequired(false, "   ")).toBe("   ");
    });

    it("treats stringified keywords as truthy and returns them", () => {
      expect(buildRequired(true, "false")).toBe("false");
      expect(buildRequired(true, "0")).toBe("0");
      expect(buildRequired(true, "undefined")).toBe("undefined");
      expect(buildRequired(true, "null")).toBe("null");
    });
  });

  describe("falsy value inputs (empty string / undefined)", () => {
    it("returns 'build-placeholder' when value is undefined and isBuildPhase is true", () => {
      expect(buildRequired(true, undefined)).toBe("build-placeholder");
    });

    it("returns undefined when value is undefined and isBuildPhase is false", () => {
      expect(buildRequired(false, undefined)).toBeUndefined();
    });

    it("returns 'build-placeholder' when value is empty string '' and isBuildPhase is true", () => {
      expect(buildRequired(true, "")).toBe("build-placeholder");
    });

    it("returns undefined when value is empty string '' and isBuildPhase is false", () => {
      expect(buildRequired(false, "")).toBeUndefined();
    });
  });

  describe("omitted optional arguments", () => {
    it("returns 'build-placeholder' when value argument is completely omitted during build phase", () => {
      expect(buildRequired(true)).toBe("build-placeholder");
    });

    it("returns undefined when value argument is completely omitted during runtime phase", () => {
      expect(buildRequired(false)).toBeUndefined();
    });
  });

  describe("JavaScript runtime edge cases (untyped or JS callers)", () => {
    it("coerces null to fallback behavior", () => {
      // @ts-expect-error Testing untyped JS caller passing null
      expect(buildRequired(true, null)).toBe("build-placeholder");
      // @ts-expect-error Testing untyped JS caller passing null
      expect(buildRequired(false, null)).toBeUndefined();
    });

    it("handles truthy/falsy non-boolean isBuildPhase values", () => {
      // @ts-expect-error Testing untyped JS caller passing truthy number
      expect(buildRequired(1, "")).toBe("build-placeholder");
      // @ts-expect-error Testing untyped JS caller passing falsy number
      expect(buildRequired(0, "")).toBeUndefined();
    });
  });
});
