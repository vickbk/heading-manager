import fs from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CoverageSummaryJson } from "../types";
import { COMMENT_IDENTIFIER, getReport } from "./report";

describe("getReport", () => {
  const MOCK_SUMMARY_DATA: CoverageSummaryJson = {
    total: {
      lines: { total: 100, covered: 90, skipped: 0, pct: 90 },
      statements: { total: 120, covered: 108, skipped: 0, pct: 90 },
      functions: { total: 20, covered: 18, skipped: 0, pct: 90 },
      branches: { total: 50, covered: 40, skipped: 0, pct: 80 },
    },
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("Exported Constants", () => {
    it("should export the correct COMMENT_IDENTIFIER string", () => {
      expect(COMMENT_IDENTIFIER).toBe("<!-- coverage-report-id -->");
    });
  });

  describe("Happy Path", () => {
    it("should generate coverage report with full GitHub action run link", () => {
      vi.spyOn(fs, "existsSync").mockReturnValue(true);
      vi.spyOn(fs, "readFileSync").mockReturnValue(
        JSON.stringify(MOCK_SUMMARY_DATA),
      );

      const result = getReport(
        "/custom/coverage-summary.json",
        "octocat/hello-world",
        "123456789",
      );

      expect(fs.existsSync).toHaveBeenCalledWith(
        "/custom/coverage-summary.json",
      );
      expect(fs.readFileSync).toHaveBeenCalledWith(
        "/custom/coverage-summary.json",
        "utf8",
      );

      expect(result.totalPct).toBe("90%");

      expect(result.markdownSummary).toContain("## 🧪 Test Coverage Summary");
      expect(result.markdownSummary).toContain(
        "### Total Statement Coverage: `90%`",
      );
      expect(result.markdownSummary).toContain(
        "| Statements | 90% (108/120) |",
      );
      expect(result.markdownSummary).toContain("| Branches | 80% (40/50) |");

      expect(result.commentBody).toContain(COMMENT_IDENTIFIER);
      expect(result.commentBody).toContain("## 🧪 Test Coverage Report");
      expect(result.commentBody).toContain(
        "**Overall Statement Coverage:** `90%`",
      );
      expect(result.commentBody).toContain(
        "https://github.com/octocat/hello-world/actions/runs/123456789",
      );
    });

    it("should resolve default summaryPath when no path parameter is provided", () => {
      const expectedDefaultPath = path.resolve(
        process.cwd(),
        "coverage/coverage-summary.json",
      );
      vi.spyOn(fs, "existsSync").mockReturnValue(true);
      vi.spyOn(fs, "readFileSync").mockReturnValue(
        JSON.stringify(MOCK_SUMMARY_DATA),
      );

      getReport();

      expect(fs.existsSync).toHaveBeenCalledWith(expectedDefaultPath);
      expect(fs.readFileSync).toHaveBeenCalledWith(expectedDefaultPath, "utf8");
    });
  });

  describe("GitHub Run URL Link Edge Cases", () => {
    it("should fallback runUrl to '#' when repository is undefined", () => {
      vi.spyOn(fs, "existsSync").mockReturnValue(true);
      vi.spyOn(fs, "readFileSync").mockReturnValue(
        JSON.stringify(MOCK_SUMMARY_DATA),
      );

      const result = getReport("/path/summary.json", undefined, "123456789");

      expect(result.commentBody).toContain("[Actions Step Summary](#)");
    });

    it("should fallback runUrl to '#' when runId is undefined", () => {
      vi.spyOn(fs, "existsSync").mockReturnValue(true);
      vi.spyOn(fs, "readFileSync").mockReturnValue(
        JSON.stringify(MOCK_SUMMARY_DATA),
      );

      const result = getReport(
        "/path/summary.json",
        "octocat/hello-world",
        undefined,
      );

      expect(result.commentBody).toContain("[Actions Step Summary](#)");
    });

    it("should fallback runUrl to '#' when repository and runId are both empty strings", () => {
      vi.spyOn(fs, "existsSync").mockReturnValue(true);
      vi.spyOn(fs, "readFileSync").mockReturnValue(
        JSON.stringify(MOCK_SUMMARY_DATA),
      );

      const result = getReport("/path/summary.json", "", "");

      expect(result.commentBody).toContain("[Actions Step Summary](#)");
    });
  });

  describe("File System & Payload Parsing Edge Cases", () => {
    it("should throw when summary JSON file does not exist", () => {
      vi.spyOn(fs, "existsSync").mockReturnValue(false);

      const targetPath = "/missing/coverage-summary.json";

      expect(() => getReport(targetPath)).toThrow(
        `[CoverageReport] Summary JSON file not found at: "${targetPath}"`,
      );
    });

    it("should propagate SyntaxError when JSON parsing fails", () => {
      vi.spyOn(fs, "existsSync").mockReturnValue(true);
      vi.spyOn(fs, "readFileSync").mockReturnValue("invalid { json");

      expect(() => getReport("/path/summary.json")).toThrow(SyntaxError);
    });

    it("should throw when JSON payload is missing the 'total' key", () => {
      vi.spyOn(fs, "existsSync").mockReturnValue(true);
      vi.spyOn(fs, "readFileSync").mockReturnValue(
        JSON.stringify({ otherData: {} }),
      );

      expect(() => getReport("/path/summary.json")).toThrow(
        "[CoverageReport] Invalid JSON structure: missing 'total' coverage node.",
      );
    });

    it("should throw when 'total' key evaluates to null", () => {
      vi.spyOn(fs, "existsSync").mockReturnValue(true);
      vi.spyOn(fs, "readFileSync").mockReturnValue(
        JSON.stringify({ total: null }),
      );

      expect(() => getReport("/path/summary.json")).toThrow(
        "[CoverageReport] Invalid JSON structure: missing 'total' coverage node.",
      );
    });
  });

  describe("Percentage & Numeric Edge Cases", () => {
    it("should handle floating-point percentage numbers properly", () => {
      const floatSummaryData: CoverageSummaryJson = {
        total: {
          lines: { total: 3, covered: 1, skipped: 0, pct: 33.33 },
          statements: { total: 3, covered: 1, skipped: 0, pct: 33.33 },
          functions: { total: 3, covered: 1, skipped: 0, pct: 33.33 },
          branches: { total: 3, covered: 1, skipped: 0, pct: 33.33 },
        },
      };

      vi.spyOn(fs, "existsSync").mockReturnValue(true);
      vi.spyOn(fs, "readFileSync").mockReturnValue(
        JSON.stringify(floatSummaryData),
      );

      const result = getReport("/path/summary.json");

      expect(result.totalPct).toBe("33.33%");
      expect(result.markdownSummary).toContain(
        "### Total Statement Coverage: `33.33%`",
      );
    });
  });
});
