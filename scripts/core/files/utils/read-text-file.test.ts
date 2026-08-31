import fs from "node:fs/promises";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { readTextFile } from "./read-text-file";

describe("readTextFile", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("Happy Path Execution", () => {
    it("should read UTF-8 file content successfully", async () => {
      const mockContent = "# Documentation Title\n\nSome content here.";
      vi.spyOn(fs, "readFile").mockResolvedValue(mockContent);

      const result = await readTextFile("/path/to/README.md");

      expect(result).toBe(mockContent);
      expect(fs.readFile).toHaveBeenCalledTimes(1);
      expect(fs.readFile).toHaveBeenCalledWith("/path/to/README.md", "utf-8");
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
      const enoentError = new Error(
        "ENOENT: no such file or directory, open 'missing.md'",
      );
      vi.spyOn(fs, "readFile").mockRejectedValue(enoentError);

      const promise = readTextFile("missing.md");

      await expect(promise).rejects.toThrow(
        "[IO Error] Failed to read \"missing.md\": ENOENT: no such file or directory, open 'missing.md'",
      );
      await expect(promise).rejects.toHaveProperty("cause", enoentError);
    });

    it("should format EACCES (permission denied) errors and preserve original cause", async () => {
      const eaccesError = new Error(
        "EACCES: permission denied, open '/protected/file.txt'",
      );
      vi.spyOn(fs, "readFile").mockRejectedValue(eaccesError);

      const promise = readTextFile("/protected/file.txt");

      await expect(promise).rejects.toThrow(
        "[IO Error] Failed to read \"/protected/file.txt\": EACCES: permission denied, open '/protected/file.txt'",
      );
      await expect(promise).rejects.toHaveProperty("cause", eaccesError);
    });

    it("should format EISDIR (is a directory) errors and preserve original cause", async () => {
      const eisdirError = new Error(
        "EISDIR: illegal operation on a directory, read",
      );
      vi.spyOn(fs, "readFile").mockRejectedValue(eisdirError);

      const promise = readTextFile("/some/directory");

      await expect(promise).rejects.toThrow(
        '[IO Error] Failed to read "/some/directory": EISDIR: illegal operation on a directory, read',
      );
      await expect(promise).rejects.toHaveProperty("cause", eisdirError);
    });
  });

  describe("Non-Standard Thrown Values", () => {
    it("should safely format raw string exceptions and attach string cause", async () => {
      const rawStringError = "Disk read failure string";
      vi.spyOn(fs, "readFile").mockRejectedValue(rawStringError);

      const promise = readTextFile("test.txt");

      await expect(promise).rejects.toThrow(
        '[IO Error] Failed to read "test.txt": Disk read failure string',
      );
      await expect(promise).rejects.toHaveProperty("cause", rawStringError);
    });

    it("should safely format null rejections and attach null cause", async () => {
      vi.spyOn(fs, "readFile").mockRejectedValue(null);

      const promise = readTextFile("test.txt");

      await expect(promise).rejects.toThrow(
        '[IO Error] Failed to read "test.txt": null',
      );
      await expect(promise).rejects.toHaveProperty("cause", null);
    });
  });
});
