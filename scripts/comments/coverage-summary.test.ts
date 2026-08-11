import fs from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { generateCoverageSummary } from "./coverage-summary";
import * as coverageModule from "./modules/github-api";
import * as reportUtils from "./utils/report";

describe("generateCoverageSummary", () => {
  const MOCK_CUSTOM_PATH = "/custom/workspace/coverage/coverage-summary.json";
  const DEFAULT_EXPECTED_PATH = path.resolve(
    process.cwd(),
    "coverage/coverage-summary.json",
  );

  const mockReportResult = {
    totalPct: "89.5%",
    markdownSummary:
      "## 🧪 Test Coverage Summary\n| Metric | Coverage |\n| Statements | 89.5% |",
    commentBody: "<!-- coverage-comment -->",
  };

  beforeEach(() => {
    vi.restoreAllMocks();

    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  describe("Happy Path Execution (File Exists)", () => {
    it("should process report, output stdout, write step summary, and export env var when summary exists", () => {
      vi.spyOn(fs, "existsSync").mockReturnValue(true);
      vi.spyOn(reportUtils, "getReport").mockReturnValue(mockReportResult);
      const writeStepSummarySpy = vi
        .spyOn(coverageModule, "writeStepSummary")
        .mockImplementation(() => {});
      const exportGithubEnvSpy = vi
        .spyOn(coverageModule, "exportGithubEnv")
        .mockImplementation(() => {});

      generateCoverageSummary(MOCK_CUSTOM_PATH);

      expect(fs.existsSync).toHaveBeenCalledTimes(1);
      expect(fs.existsSync).toHaveBeenCalledWith(MOCK_CUSTOM_PATH);

      expect(reportUtils.getReport).toHaveBeenCalledTimes(1);
      expect(reportUtils.getReport).toHaveBeenCalledWith(MOCK_CUSTOM_PATH);

      expect(console.log).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith(
        mockReportResult.markdownSummary,
      );

      expect(writeStepSummarySpy).toHaveBeenCalledTimes(1);
      expect(writeStepSummarySpy).toHaveBeenCalledWith(
        mockReportResult.markdownSummary,
      );

      expect(exportGithubEnvSpy).toHaveBeenCalledTimes(1);
      expect(exportGithubEnvSpy).toHaveBeenCalledWith("TOTAL_PCT", "89.5%");

      expect(console.warn).not.toHaveBeenCalled();
    });
  });

  describe("Missing Coverage File Edge Cases", () => {
    it("should warn console and write step summary fallback when coverage file does not exist", () => {
      vi.spyOn(fs, "existsSync").mockReturnValue(false);
      const getReportSpy = vi.spyOn(reportUtils, "getReport");
      const writeStepSummarySpy = vi
        .spyOn(coverageModule, "writeStepSummary")
        .mockImplementation(() => {});
      const exportGithubEnvSpy = vi.spyOn(coverageModule, "exportGithubEnv");

      generateCoverageSummary(MOCK_CUSTOM_PATH);

      expect(fs.existsSync).toHaveBeenCalledWith(MOCK_CUSTOM_PATH);

      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.warn).toHaveBeenCalledWith(
        `[Coverage Script] No coverage file found at ${MOCK_CUSTOM_PATH}`,
      );

      expect(writeStepSummarySpy).toHaveBeenCalledTimes(1);
      expect(writeStepSummarySpy).toHaveBeenCalledWith(
        "No coverage summary file found.",
      );

      expect(getReportSpy).not.toHaveBeenCalled();
      expect(console.log).not.toHaveBeenCalled();
      expect(exportGithubEnvSpy).not.toHaveBeenCalled();
    });
  });

  describe("Path Resolution & Defaults", () => {
    it("should resolve to default coverage path when no parameter is provided", () => {
      const existsSpy = vi.spyOn(fs, "existsSync").mockReturnValue(true);
      const getReportSpy = vi
        .spyOn(reportUtils, "getReport")
        .mockReturnValue(mockReportResult);
      vi.spyOn(coverageModule, "writeStepSummary").mockImplementation(() => {});
      vi.spyOn(coverageModule, "exportGithubEnv").mockImplementation(() => {});

      generateCoverageSummary();

      expect(existsSpy).toHaveBeenCalledWith(DEFAULT_EXPECTED_PATH);
      expect(getReportSpy).toHaveBeenCalledWith(DEFAULT_EXPECTED_PATH);
    });

    it("should properly accept relative paths and resolve them against process.cwd()", () => {
      const relativePath = "./custom-dir/summary.json";

      const existsSpy = vi.spyOn(fs, "existsSync").mockReturnValue(true);
      const getReportSpy = vi
        .spyOn(reportUtils, "getReport")
        .mockReturnValue(mockReportResult);
      vi.spyOn(coverageModule, "writeStepSummary").mockImplementation(() => {});
      vi.spyOn(coverageModule, "exportGithubEnv").mockImplementation(() => {});

      generateCoverageSummary(relativePath);

      expect(existsSpy).toHaveBeenCalledWith(relativePath);
      expect(getReportSpy).toHaveBeenCalledWith(relativePath);
    });
  });

  describe("Boundary Output & Edge Cases", () => {
    it("should correctly handle zero percent coverage report outputs (0%)", () => {
      const zeroCoverageReport = {
        totalPct: "0%",
        markdownSummary: "## 🧪 Test Coverage Summary\n| Statements | 0% |",
        commentBody: "<!-- coverage-comment -->",
      };

      vi.spyOn(fs, "existsSync").mockReturnValue(true);
      vi.spyOn(reportUtils, "getReport").mockReturnValue(zeroCoverageReport);
      vi.spyOn(coverageModule, "writeStepSummary").mockImplementation(() => {});
      const exportGithubEnvSpy = vi
        .spyOn(coverageModule, "exportGithubEnv")
        .mockImplementation(() => {});

      generateCoverageSummary(MOCK_CUSTOM_PATH);

      expect(exportGithubEnvSpy).toHaveBeenCalledWith("TOTAL_PCT", "0%");
    });

    it("should correctly handle 100% perfect coverage report outputs", () => {
      const perfectReport = {
        totalPct: "100%",
        markdownSummary: "## 🧪 Test Coverage Summary\n| Statements | 100% |",
        commentBody: "<!-- coverage-comment -->",
      };

      vi.spyOn(fs, "existsSync").mockReturnValue(true);
      vi.spyOn(reportUtils, "getReport").mockReturnValue(perfectReport);
      vi.spyOn(coverageModule, "writeStepSummary").mockImplementation(() => {});
      const exportGithubEnvSpy = vi
        .spyOn(coverageModule, "exportGithubEnv")
        .mockImplementation(() => {});

      generateCoverageSummary(MOCK_CUSTOM_PATH);

      expect(exportGithubEnvSpy).toHaveBeenCalledWith("TOTAL_PCT", "100%");
    });
  });

  describe("Error Propagation", () => {
    it("should propagate errors thrown by getReport (e.g., malformed JSON inside coverage file)", () => {
      vi.spyOn(fs, "existsSync").mockReturnValue(true);
      vi.spyOn(reportUtils, "getReport").mockImplementation(() => {
        throw new SyntaxError("Unexpected token in JSON at position 0");
      });

      expect(() => generateCoverageSummary(MOCK_CUSTOM_PATH)).toThrow(
        SyntaxError,
      );
    });

    it("should propagate file system permission errors thrown during fs.existsSync check", () => {
      vi.spyOn(fs, "existsSync").mockImplementation(() => {
        throw new Error("EACCES: permission denied");
      });

      expect(() => generateCoverageSummary(MOCK_CUSTOM_PATH)).toThrow(
        "EACCES: permission denied",
      );
    });
  });

  describe("coverage-summary script", async () => {
    const originalArgv = process.argv;
    const defaultSummaryPath = path.resolve(
      process.cwd(),
      "coverage/coverage-summary.json",
    );

    let githubApi = await import("./modules/github-api");
    let reportModule = await import("./utils/report");
    let nodefs = await import("node:fs");
    beforeEach(async () => {
      vi.resetModules(); // Clears import cache for top-level code re-evaluation
      vi.restoreAllMocks();
      githubApi = await import("./modules/github-api");
      reportModule = await import("./utils/report");
      nodefs = await import("node:fs");
      vi.spyOn(console, "log").mockImplementation(() => {});
      vi.spyOn(console, "warn").mockImplementation(() => {});
    });

    afterEach(() => {
      process.argv = originalArgv;
      vi.clearAllMocks();
    });

    describe("generateCoverageSummary() function", () => {
      it("should warn and exit early when summary file does not exist", () => {
        vi.spyOn(fs, "existsSync").mockReturnValue(false);
        const writeStepSummarySpy = vi
          .spyOn(githubApi, "writeStepSummary")
          .mockImplementation(() => {});
        const getReportSpy = vi.spyOn(reportModule, "getReport");

        generateCoverageSummary("/custom/path/coverage.json");

        expect(fs.existsSync).toHaveBeenCalledWith(
          "/custom/path/coverage.json",
        );
        expect(console.warn).toHaveBeenCalledWith(
          "[Coverage Script] No coverage file found at /custom/path/coverage.json",
        );
        expect(writeStepSummarySpy).toHaveBeenCalledWith(
          "No coverage summary file found.",
        );
        expect(getReportSpy).not.toHaveBeenCalled();
      });

      it("should log markdown, write step summary, and export TOTAL_PCT when summary file exists", async () => {
        vi.spyOn(fs, "existsSync").mockReturnValue(true);
        vi.spyOn(reportModule, "getReport").mockReturnValue({
          totalPct: "88.5",
          markdownSummary: "### Coverage: 88.5%",
        } as ReturnType<typeof reportModule.getReport>);

        const writeStepSummarySpy = vi
          .spyOn(githubApi, "writeStepSummary")
          .mockImplementation(() => {});
        const exportGithubEnvSpy = vi
          .spyOn(githubApi, "exportGithubEnv")
          .mockImplementation(() => {});

        generateCoverageSummary("/custom/path/coverage.json");

        expect(reportModule.getReport).toHaveBeenCalledWith(
          "/custom/path/coverage.json",
        );
        expect(console.log).toHaveBeenCalledWith("### Coverage: 88.5%");
        expect(writeStepSummarySpy).toHaveBeenCalledWith("### Coverage: 88.5%");
        expect(exportGithubEnvSpy).toHaveBeenCalledWith("TOTAL_PCT", 88.5);
      });

      it("should fall back to default path when parameter is omitted", () => {
        const existsSpy = vi.spyOn(fs, "existsSync").mockReturnValue(false);
        vi.spyOn(githubApi, "writeStepSummary").mockImplementation(() => {});

        generateCoverageSummary();

        expect(existsSpy).toHaveBeenCalledWith(defaultSummaryPath);
      });
    });

    describe("Top-level execution (if block)", () => {
      it("should execute generateCoverageSummary when process.argv[1] contains 'coverage-summary'", async () => {
        process.argv = ["node", "/workspace/scripts/coverage-summary.ts"];

        vi.spyOn(fs, "existsSync").mockReturnValue(true);
        vi.spyOn(reportModule, "getReport").mockReturnValue({
          totalPct: "95.0",
          markdownSummary: "### Coverage: 95%",
        } as ReturnType<typeof reportModule.getReport>);

        const writeStepSummarySpy = vi
          .spyOn(githubApi, "writeStepSummary")
          .mockImplementation(() => {});
        const exportGithubEnvSpy = vi
          .spyOn(githubApi, "exportGithubEnv")
          .mockImplementation(() => {});

        // Dynamic import triggers top-level code execution
        await import("./coverage-summary");

        expect(fs.existsSync).toHaveBeenCalledWith(defaultSummaryPath);
        expect(writeStepSummarySpy).toHaveBeenCalledWith("### Coverage: 95%");
        expect(exportGithubEnvSpy).toHaveBeenCalledWith("TOTAL_PCT", "95.0");
      });

      it("should NOT execute generateCoverageSummary when process.argv[1] does not match", async () => {
        process.argv = ["node", "/workspace/scripts/different-script.ts"];

        const existsSpy = vi.spyOn(fs, "existsSync");

        await import("./coverage-summary");

        expect(existsSpy).not.toHaveBeenCalled();
      });
    });
  });
});
