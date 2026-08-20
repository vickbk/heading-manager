import { expect as defaultPlaywrightExpect } from "@playwright/test";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { registerPlaywright } from "./register";
import { toHaveValidHeadingHierarchy } from "./to-have-valid-heading-hierarchy";

// Mock the default @playwright/test export
vi.mock("@playwright/test", () => ({
  expect: {
    extend: vi.fn(),
  },
}));

// Mock the matcher implementation to isolate registration testing
vi.mock("./to-have-valid-heading-hierarchy", () => ({
  toHaveValidHeadingHierarchy: vi.fn(),
}));

describe("registerPlaywright", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Default Parameter Handling", () => {
    it("should extend the default Playwright expect instance when called without arguments", () => {
      registerPlaywright();

      expect(defaultPlaywrightExpect.extend).toHaveBeenCalledTimes(1);
      expect(defaultPlaywrightExpect.extend).toHaveBeenCalledWith({
        toHaveValidHeadingHierarchy,
      });
    });
  });

  describe("Custom Expect Injection", () => {
    it("should register matcher on a custom expect instance and bypass default Playwright expect", () => {
      const mockCustomExpect = {
        extend: vi.fn(),
      };

      registerPlaywright(
        mockCustomExpect as unknown as typeof defaultPlaywrightExpect,
      );

      expect(mockCustomExpect.extend).toHaveBeenCalledTimes(1);
      expect(mockCustomExpect.extend).toHaveBeenCalledWith({
        toHaveValidHeadingHierarchy,
      });
      expect(defaultPlaywrightExpect.extend).not.toHaveBeenCalled();
    });

    it("should pass the exact reference of toHaveValidHeadingHierarchy to customExpect.extend", () => {
      const mockCustomExpect = {
        extend: vi.fn(),
      };

      registerPlaywright(
        mockCustomExpect as unknown as typeof defaultPlaywrightExpect,
      );

      const extendArg = mockCustomExpect.extend.mock.calls[0][0];
      expect(extendArg).toHaveProperty("toHaveValidHeadingHierarchy");
      expect(extendArg.toHaveValidHeadingHierarchy).toBe(
        toHaveValidHeadingHierarchy,
      );
    });
  });

  describe("Execution & Idempotency", () => {
    it("should invoke extend on every call when invoked multiple times", () => {
      const mockCustomExpect = {
        extend: vi.fn(),
      };

      registerPlaywright(
        mockCustomExpect as unknown as typeof defaultPlaywrightExpect,
      );
      registerPlaywright(
        mockCustomExpect as unknown as typeof defaultPlaywrightExpect,
      );

      expect(mockCustomExpect.extend).toHaveBeenCalledTimes(2);
    });
  });

  describe("Error Handling & Guardrails", () => {
    it("should throw an error if customExpect is null", () => {
      expect(() => {
        registerPlaywright(null as unknown as typeof defaultPlaywrightExpect);
      }).toThrow();
    });

    it("should throw a TypeError if customExpect does not implement an extend function", () => {
      const invalidExpect = {} as unknown as typeof defaultPlaywrightExpect;

      expect(() => {
        registerPlaywright(invalidExpect);
      }).toThrow(TypeError);
    });
  });
});
