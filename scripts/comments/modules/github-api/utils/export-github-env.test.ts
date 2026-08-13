import fs from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { exportGithubEnv } from "./export-github-env";

describe("exportGithubEnv", () => {
  const MOCK_ENV_FILE = "/github/workspace/env_file";

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("Happy Path", () => {
    it("should append formatted key-value pair with newline and utf8 encoding when GITHUB_ENV is set", () => {
      vi.stubEnv("GITHUB_ENV", MOCK_ENV_FILE);
      const appendSpy = vi
        .spyOn(fs, "appendFileSync")
        .mockImplementation(() => {});

      exportGithubEnv("TOTAL_PCT", "95.5%");

      expect(appendSpy).toHaveBeenCalledTimes(1);
      expect(appendSpy).toHaveBeenCalledWith(
        MOCK_ENV_FILE,
        "TOTAL_PCT=95.5%\n",
        "utf8",
      );
    });
  });

  describe("Environment Variable Handling", () => {
    it("should not invoke fs.appendFileSync when GITHUB_ENV environment variable is undefined", () => {
      delete process.env.GITHUB_ENV;
      const appendSpy = vi
        .spyOn(fs, "appendFileSync")
        .mockImplementation(() => {});

      exportGithubEnv("TOTAL_PCT", "95.5%");

      expect(appendSpy).not.toHaveBeenCalled();
    });

    it("should not invoke fs.appendFileSync when GITHUB_ENV evaluates to an empty string", () => {
      vi.stubEnv("GITHUB_ENV", "");
      const appendSpy = vi
        .spyOn(fs, "appendFileSync")
        .mockImplementation(() => {});

      exportGithubEnv("TOTAL_PCT", "95.5%");

      expect(appendSpy).not.toHaveBeenCalled();
    });
  });

  describe("Input Parameter Edge Cases", () => {
    it("should correctly handle an empty string key", () => {
      vi.stubEnv("GITHUB_ENV", MOCK_ENV_FILE);
      const appendSpy = vi
        .spyOn(fs, "appendFileSync")
        .mockImplementation(() => {});

      exportGithubEnv("", "value_only");

      expect(appendSpy).toHaveBeenCalledWith(
        MOCK_ENV_FILE,
        "=value_only\n",
        "utf8",
      );
    });

    it("should correctly handle an empty string value", () => {
      vi.stubEnv("GITHUB_ENV", MOCK_ENV_FILE);
      const appendSpy = vi
        .spyOn(fs, "appendFileSync")
        .mockImplementation(() => {});

      exportGithubEnv("EMPTY_VAL", "");

      expect(appendSpy).toHaveBeenCalledWith(
        MOCK_ENV_FILE,
        "EMPTY_VAL=\n",
        "utf8",
      );
    });

    it("should correctly handle both key and value as empty strings", () => {
      vi.stubEnv("GITHUB_ENV", MOCK_ENV_FILE);
      const appendSpy = vi
        .spyOn(fs, "appendFileSync")
        .mockImplementation(() => {});

      exportGithubEnv("", "");

      expect(appendSpy).toHaveBeenCalledWith(MOCK_ENV_FILE, "=\n", "utf8");
    });

    it("should preserve special characters, spaces, quotes, and JSON strings", () => {
      vi.stubEnv("GITHUB_ENV", MOCK_ENV_FILE);
      const appendSpy = vi
        .spyOn(fs, "appendFileSync")
        .mockImplementation(() => {});

      const complexValue =
        '{"pct": "100%", "status": "passed", "flags": ["--verbose"]}';
      exportGithubEnv("SUMMARY_JSON", complexValue);

      expect(appendSpy).toHaveBeenCalledWith(
        MOCK_ENV_FILE,
        `SUMMARY_JSON=${complexValue}\n`,
        "utf8",
      );
    });

    it("should handle multiline string values containing explicit newlines", () => {
      vi.stubEnv("GITHUB_ENV", MOCK_ENV_FILE);
      const appendSpy = vi
        .spyOn(fs, "appendFileSync")
        .mockImplementation(() => {});

      const multilineValue = "LINE_1\nLINE_2\nLINE_3";
      exportGithubEnv("MULTILINE_VAR", multilineValue);

      expect(appendSpy).toHaveBeenCalledWith(
        MOCK_ENV_FILE,
        "MULTILINE_VAR=LINE_1\nLINE_2\nLINE_3\n",
        "utf8",
      );
    });

    it("should correctly handle keys and values with unicode / emoji characters", () => {
      vi.stubEnv("GITHUB_ENV", MOCK_ENV_FILE);
      const appendSpy = vi
        .spyOn(fs, "appendFileSync")
        .mockImplementation(() => {});

      exportGithubEnv("REPORT_STATUS_🧪", "PASSED_✅");

      expect(appendSpy).toHaveBeenCalledWith(
        MOCK_ENV_FILE,
        "REPORT_STATUS_🧪=PASSED_✅\n",
        "utf8",
      );
    });
  });

  describe("File System Errors", () => {
    it("should allow fs.appendFileSync errors (e.g. EACCES, ENOENT) to propagate", () => {
      vi.stubEnv("GITHUB_ENV", MOCK_ENV_FILE);
      vi.spyOn(fs, "appendFileSync").mockImplementation(() => {
        throw new Error(
          "EACCES: permission denied, open '/github/workspace/env_file'",
        );
      });

      expect(() => exportGithubEnv("TOTAL_PCT", "95.5%")).toThrow(
        "EACCES: permission denied, open '/github/workspace/env_file'",
      );
    });
  });
});
