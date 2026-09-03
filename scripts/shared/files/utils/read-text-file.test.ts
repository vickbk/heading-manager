import fs from "node:fs/promises";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { readTextFile } from "./read-text-file";

describe("readTextFile", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("Happy Path Execution", () => {
    it("should read UTF-8 file content successfully", async () => {
      const filePath = "/path/to/README.md";
      const resolvedPath = path.resolve(filePath);
      const mockContent = "# Documentation Title\n\nSome content here.";

      vi.spyOn(fs, "readFile").mockResolvedValue(mockContent);

      const result = await readTextFile(filePath);

      expect(result).toBe(mockContent);
      expect(fs.readFile).toHaveBeenCalledTimes(1);
      expect(fs.readFile).toHaveBeenCalledWith(resolvedPath, {
        encoding: "utf8",
      });
    });

    it("should handle empty file contents cleanly", async () => {
      vi.spyOn(fs, "readFile").mockResolvedValue("");

      const result = await readTextFile("empty.txt");

      expect(result).toBe("");
    });

    it("should properly return non-ASCII and UTF-8 multibyte characters", async () => {
      const unicodeContent =
        "🚀 Project README — French: Bonjour, Kiswahili: Jambo";
      vi.spyOn(fs, "readFile").mockResolvedValue(unicodeContent);

      const result = await readTextFile("unicode.txt");

      expect(result).toBe(unicodeContent);
    });
  });

  describe("Standard Node.js I/O Errors", () => {
    it("should format ENOENT (file not found) errors and preserve original cause", async () => {
      const filePath = "missing.md";
      const resolvedPath = path.resolve(filePath);
      const enoentError = new Error(
        "ENOENT: no such file or directory, open 'missing.md'",
      );
      vi.spyOn(fs, "readFile").mockRejectedValue(enoentError);

      const promise = readTextFile(filePath);

      await expect(promise).rejects.toThrow(
        `[IO Error] Failed to read "${resolvedPath}": ENOENT: no such file or directory, open 'missing.md'`,
      );
      await expect(promise).rejects.toHaveProperty("cause", enoentError);
    });

    it("should format EACCES (permission denied) errors and preserve original cause", async () => {
      const filePath = "/protected/file.txt";
      const resolvedPath = path.resolve(filePath);
      const eaccesError = new Error(
        "EACCES: permission denied, open '/protected/file.txt'",
      );
      vi.spyOn(fs, "readFile").mockRejectedValue(eaccesError);

      const promise = readTextFile(filePath);

      await expect(promise).rejects.toThrow(
        `[IO Error] Failed to read "${resolvedPath}": EACCES: permission denied, open '/protected/file.txt'`,
      );
      await expect(promise).rejects.toHaveProperty("cause", eaccesError);
    });

    it("should format EISDIR (is a directory) errors and preserve original cause", async () => {
      const filePath = "/some/directory";
      const resolvedPath = path.resolve(filePath);
      const eisdirError = new Error(
        "EISDIR: illegal operation on a directory, read",
      );
      vi.spyOn(fs, "readFile").mockRejectedValue(eisdirError);

      const promise = readTextFile(filePath);

      await expect(promise).rejects.toThrow(
        `[IO Error] Failed to read "${resolvedPath}": EISDIR: illegal operation on a directory, read`,
      );
      await expect(promise).rejects.toHaveProperty("cause", eisdirError);
    });
  });

  describe("Non-Standard Thrown Values", () => {
    it("should safely format raw string exceptions and attach string cause", async () => {
      const filePath = "test.txt";
      const resolvedPath = path.resolve(filePath);
      const rawStringError = "Disk read failure string";
      vi.spyOn(fs, "readFile").mockRejectedValue(rawStringError);

      const promise = readTextFile(filePath);

      await expect(promise).rejects.toThrow(
        `[IO Error] Failed to read "${resolvedPath}": Disk read failure string`,
      );
      await expect(promise).rejects.toHaveProperty("cause", rawStringError);
    });

    it("should safely format non-Error object rejections and attach the original object", async () => {
      const filePath = "test.txt";
      const resolvedPath = path.resolve(filePath);
      const objectError = { code: "EUNKNOWN", detail: "object failure" };
      vi.spyOn(fs, "readFile").mockRejectedValue(objectError);

      const promise = readTextFile(filePath);

      await expect(promise).rejects.toThrow(
        `[IO Error] Failed to read "${resolvedPath}": [object Object]`,
      );
      await expect(promise).rejects.toHaveProperty("cause", objectError);
    });

    it("should safely format null rejections and attach null cause", async () => {
      const filePath = "test.txt";
      const resolvedPath = path.resolve(filePath);
      vi.spyOn(fs, "readFile").mockRejectedValue(null);

      const promise = readTextFile(filePath);

      await expect(promise).rejects.toThrow(
        `[IO Error] Failed to read "${resolvedPath}": null`,
      );
      await expect(promise).rejects.toHaveProperty("cause", null);
    });
  });
});
