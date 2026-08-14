import { describe, expect, it } from "vitest";
import { CoverageMetric } from "../types";
import { formatRow } from "./format";

describe("formatRow", () => {
  describe("Standard Functionality", () => {
    it("should format a standard coverage metric row correctly", () => {
      const metric: CoverageMetric = {
        total: 100,
        covered: 85,
        skipped: 0,
        pct: 85,
      };

      const result = formatRow("Statements", metric);

      expect(result).toBe("| Statements | 85% (85/100) |");
    });

    it("should handle 100% coverage correctly", () => {
      const metric: CoverageMetric = {
        total: 42,
        covered: 42,
        skipped: 0,
        pct: 100,
      };

      const result = formatRow("Functions", metric);

      expect(result).toBe("| Functions | 100% (42/42) |");
    });

    it("should handle 0% coverage correctly", () => {
      const metric: CoverageMetric = {
        total: 25,
        covered: 0,
        skipped: 0,
        pct: 0,
      };

      const result = formatRow("Branches", metric);

      expect(result).toBe("| Branches | 0% (0/25) |");
    });
  });

  describe("Numeric Edge Cases", () => {
    it("should render floating point percentage values accurately", () => {
      const metric: CoverageMetric = {
        total: 33,
        covered: 10,
        skipped: 0,
        pct: 30.3,
      };

      const result = formatRow("Lines", metric);

      expect(result).toBe("| Lines | 30.3% (10/33) |");
    });

    it("should handle empty suites with zero total and zero covered", () => {
      const metric: CoverageMetric = {
        total: 0,
        covered: 0,
        skipped: 0,
        pct: 100,
      };

      const result = formatRow("Statements", metric);

      expect(result).toBe("| Statements | 100% (0/0) |");
    });

    it("should format large numeric counts correctly without scientific notation issues", () => {
      const metric: CoverageMetric = {
        total: 1_000_000,
        covered: 999_999,
        skipped: 0,
        pct: 99.99,
      };

      const result = formatRow("Expressions", metric);

      expect(result).toBe("| Expressions | 99.99% (999999/1000000) |");
    });
  });

  describe("Label and String Edge Cases", () => {
    it("should handle an empty string label", () => {
      const metric: CoverageMetric = {
        total: 10,
        covered: 5,
        skipped: 0,
        pct: 50,
      };

      const result = formatRow("", metric);

      expect(result).toBe("|  | 50% (5/10) |");
    });

    it("should preserve whitespace in labels", () => {
      const metric: CoverageMetric = {
        total: 10,
        covered: 5,
        skipped: 0,
        pct: 50,
      };

      const result = formatRow("  Custom Section  ", metric);

      expect(result).toBe("|   Custom Section   | 50% (5/10) |");
    });

    it("should format labels containing special characters and symbols", () => {
      const metric: CoverageMetric = {
        total: 15,
        covered: 12,
        skipped: 0,
        pct: 80,
      };

      const result = formatRow("Functions & Methods (Async/Sync)", metric);

      expect(result).toBe("| Functions & Methods (Async/Sync) | 80% (12/15) |");
    });

    it("should allow raw pipe characters in labels without escaping", () => {
      const metric: CoverageMetric = {
        total: 10,
        covered: 8,
        skipped: 0,
        pct: 80,
      };

      const result = formatRow("Statements | Core Module", metric);

      expect(result).toBe("| Statements | Core Module | 80% (8/10) |");
    });
  });
});
