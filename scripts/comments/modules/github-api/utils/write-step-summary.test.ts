import fs from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { writeStepSummary } from "./write-step-summary";

describe("writeStepSummary", () => {
  const MOCK_SUMMARY_FILE = "/github/workspace/step_summary.md";

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("Happy Path", () => {
    it("should trim content and append with a trailing newline when GITHUB_STEP_SUMMARY is set", () => {
      vi.stubEnv("GITHUB_STEP_SUMMARY", MOCK_SUMMARY_FILE);
      const appendSpy = vi
        .spyOn(fs, "appendFileSync")
        .mockImplementation(() => {});

      writeStepSummary("## 🧪 Test Coverage Summary");

      expect(appendSpy).toHaveBeenCalledTimes(1);
      expect(appendSpy).toHaveBeenCalledWith(
        MOCK_SUMMARY_FILE,
        "## 🧪 Test Coverage Summary\n",
        "utf8",
      );
    });
  });

  describe("Environment Variable Handling", () => {
    it("should not invoke fs.appendFileSync when GITHUB_STEP_SUMMARY environment variable is undefined", () => {
      delete process.env.GITHUB_STEP_SUMMARY;
      const appendSpy = vi
        .spyOn(fs, "appendFileSync")
        .mockImplementation(() => {});

      writeStepSummary("No coverage summary file found.");

      expect(appendSpy).not.toHaveBeenCalled();
    });

    it("should not invoke fs.appendFileSync when GITHUB_STEP_SUMMARY evaluates to an empty string", () => {
      vi.stubEnv("GITHUB_STEP_SUMMARY", "");
      const appendSpy = vi
        .spyOn(fs, "appendFileSync")
        .mockImplementation(() => {});

      writeStepSummary("No coverage summary file found.");

      expect(appendSpy).not.toHaveBeenCalled();
    });
  });

  describe("Trimming & Formatting Edge Cases", () => {
    it("should trim leading and trailing spaces from input content", () => {
      vi.stubEnv("GITHUB_STEP_SUMMARY", MOCK_SUMMARY_FILE);
      const appendSpy = vi
        .spyOn(fs, "appendFileSync")
        .mockImplementation(() => {});

      writeStepSummary("   ### Padded Header   ");

      expect(appendSpy).toHaveBeenCalledWith(
        MOCK_SUMMARY_FILE,
        "### Padded Header\n",
        "utf8",
      );
    });

    it("should trim leading and trailing newlines while preserving internal markdown layout", () => {
      vi.stubEnv("GITHUB_STEP_SUMMARY", MOCK_SUMMARY_FILE);
      const appendSpy = vi
        .spyOn(fs, "appendFileSync")
        .mockImplementation(() => {});

      const rawMarkdown = `

| Metric | Coverage |
| :--- | :--- |
| Statements | 92.5% |

`;
      writeStepSummary(rawMarkdown);

      const expectedContent = `| Metric | Coverage |
| :--- | :--- |
| Statements | 92.5% |\n`;

      expect(appendSpy).toHaveBeenCalledWith(
        MOCK_SUMMARY_FILE,
        expectedContent,
        "utf8",
      );
    });

    it("should reduce an empty string input to a single trailing newline", () => {
      vi.stubEnv("GITHUB_STEP_SUMMARY", MOCK_SUMMARY_FILE);
      const appendSpy = vi
        .spyOn(fs, "appendFileSync")
        .mockImplementation(() => {});

      writeStepSummary("");

      expect(appendSpy).toHaveBeenCalledWith(MOCK_SUMMARY_FILE, "\n", "utf8");
    });

    it("should reduce a whitespace-only string input to a single trailing newline", () => {
      vi.stubEnv("GITHUB_STEP_SUMMARY", MOCK_SUMMARY_FILE);
      const appendSpy = vi
        .spyOn(fs, "appendFileSync")
        .mockImplementation(() => {});

      writeStepSummary("    \n\t  ");

      expect(appendSpy).toHaveBeenCalledWith(MOCK_SUMMARY_FILE, "\n", "utf8");
    });

    it("should correctly handle rich GitHub Flavored Markdown (badges, code blocks, tables, unicode)", () => {
      vi.stubEnv("GITHUB_STEP_SUMMARY", MOCK_SUMMARY_FILE);
      const appendSpy = vi
        .spyOn(fs, "appendFileSync")
        .mockImplementation(() => {});

      const complexMarkdown = `
# 📊 Test Results

> Status: **Passed** ✅

\`\`\`json
{ "statements": 100, "branches": 95 }
\`\`\`
`.trim();

      writeStepSummary(complexMarkdown);

      expect(appendSpy).toHaveBeenCalledWith(
        MOCK_SUMMARY_FILE,
        `${complexMarkdown}\n`,
        "utf8",
      );
    });
  });

  describe("File System Errors", () => {
    it("should allow fs.appendFileSync errors (e.g. ENOENT, EACCES) to propagate", () => {
      vi.stubEnv("GITHUB_STEP_SUMMARY", MOCK_SUMMARY_FILE);
      vi.spyOn(fs, "appendFileSync").mockImplementation(() => {
        throw new Error(
          "ENOENT: no such file or directory, open '/github/workspace/step_summary.md'",
        );
      });

      expect(() => writeStepSummary("Test content")).toThrow(
        "ENOENT: no such file or directory, open '/github/workspace/step_summary.md'",
      );
    });
  });
});
