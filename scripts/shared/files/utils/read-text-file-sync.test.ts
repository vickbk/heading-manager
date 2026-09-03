import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { readTextFileSync } from "./read-text-file-sync";

describe("readTextFileSync", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(
      path.join(os.tmpdir(), "read-text-file-sync-test-"),
    );
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe("basic file reading & encodings", () => {
    it("should read content from a file using a relative path within baseDir", () => {
      const filePath = "sample.txt";
      const expectedContent = "Hello from readTextFileSync!";
      fs.writeFileSync(path.join(tempDir, filePath), expectedContent, "utf8");

      const result = readTextFileSync({
        filePath,
        baseDir: tempDir,
      });

      expect(result).toBe(expectedContent);
    });

    it("should read content from a file without baseDir specified", () => {
      const fullPath = path.join(tempDir, "standalone.txt");
      const expectedContent = "Standalone read test";
      fs.writeFileSync(fullPath, expectedContent, "utf8");

      const result = readTextFileSync({
        filePath: fullPath,
      });

      expect(result).toBe(expectedContent);
    });

    it("should read nested directory files correctly", () => {
      const relativePath = "nested/dir/structure/file.txt";
      const fullPath = path.join(tempDir, relativePath);
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      fs.writeFileSync(fullPath, "Nested Content", "utf8");

      const result = readTextFileSync({
        filePath: relativePath,
        baseDir: tempDir,
      });

      expect(result).toBe("Nested Content");
    });

    it("should handle empty text files", () => {
      const filePath = "empty.txt";
      fs.writeFileSync(path.join(tempDir, filePath), "", "utf8");

      const result = readTextFileSync({
        filePath,
        baseDir: tempDir,
      });

      expect(result).toBe("");
    });

    it("should handle multi-line string and unicode characters", () => {
      const filePath = "unicode.txt";
      const content = "Line 1\nLine 2\n⚡ Unicode Test: 🚀 ⚛️ 🌐";
      fs.writeFileSync(path.join(tempDir, filePath), content, "utf8");

      const result = readTextFileSync({
        filePath,
        baseDir: tempDir,
      });

      expect(result).toBe(content);
    });

    it("should respect non-utf8 encoding overrides (e.g., base64, hex, latin1)", () => {
      const filePath = "encoded.txt";
      const originalText = "Hello World!";
      fs.writeFileSync(path.join(tempDir, filePath), originalText, "utf8");

      const base64Result = readTextFileSync({
        filePath,
        baseDir: tempDir,
        encoding: "base64",
      });

      expect(base64Result).toBe(Buffer.from(originalText).toString("base64"));
    });
  });

  describe("baseDir & path traversal security", () => {
    it("should throw Access Denied error when attempting path traversal outside baseDir via ../", () => {
      const resolvedBase = path.resolve(tempDir);

      expect(() => {
        readTextFileSync({
          filePath: "../unauthorized.txt",
          baseDir: tempDir,
        });
      }).toThrow(
        `[IO Error] Access denied: Target path outside "${resolvedBase}"`,
      );
    });

    it("should throw Access Denied error when nested relative path resolves outside baseDir", () => {
      const resolvedBase = path.resolve(tempDir);

      expect(() => {
        readTextFileSync({
          filePath: "subfolder/../../forbidden.txt",
          baseDir: tempDir,
        });
      }).toThrow(
        `[IO Error] Access denied: Target path outside "${resolvedBase}"`,
      );
    });

    it("should throw Access Denied error when passing an absolute path outside baseDir", () => {
      const resolvedBase = path.resolve(tempDir);
      const outsidePath = path.resolve(tempDir, "..", "outside.txt");

      expect(() => {
        readTextFileSync({
          filePath: outsidePath,
          baseDir: tempDir,
        });
      }).toThrow(
        `[IO Error] Access denied: Target path outside "${resolvedBase}"`,
      );
    });

    it("should allow absolute paths if they resolve inside baseDir", () => {
      const filePath = "allowed.txt";
      const fullPath = path.resolve(tempDir, filePath);
      const content = "Allowed Absolute Path Content";
      fs.writeFileSync(fullPath, content, "utf8");

      const result = readTextFileSync({
        filePath: fullPath,
        baseDir: tempDir,
      });

      expect(result).toBe(content);
    });
  });

  describe("error handling & cause preservation", () => {
    it("should wrap missing file errors and preserve native ENOENT error in cause", () => {
      const missingPath = path.resolve(tempDir, "non-existent.txt");

      try {
        readTextFileSync({ filePath: missingPath });
        expect.fail("Should have thrown an error");
      } catch (err: unknown) {
        const error = err as Error & { cause?: { code?: string } };

        expect(error).toBeInstanceOf(Error);
        expect(error.message).toContain(
          `[IO Error] Failed to read "${missingPath}"`,
        );
        expect(error.cause).toBeDefined();
        expect(error.cause?.code).toBe("ENOENT");
      }
    });

    it("should wrap directory read errors and preserve native EISDIR error in cause", () => {
      const subDir = path.join(tempDir, "some-folder");
      fs.mkdirSync(subDir);

      try {
        readTextFileSync({ filePath: subDir });
        expect.fail("Should have thrown an error");
      } catch (err: unknown) {
        const error = err as Error & { cause?: { code?: string } };

        expect(error).toBeInstanceOf(Error);
        expect(error.message).toContain(
          `[IO Error] Failed to read "${subDir}"`,
        );
        expect(error.cause).toBeDefined();
        expect(error.cause?.code).toBe("EISDIR");
      }
    });

    it("should handle non-Error thrown values gracefully", () => {
      const fullPath = path.join(tempDir, "string-error.txt");

      // Mock fs.readFileSync to throw a plain string instead of an Error object
      const readSpy = vi
        .spyOn(fs, "readFileSync")
        .mockImplementationOnce(() => {
          throw "Raw string filesystem exception";
        });

      try {
        readTextFileSync({ filePath: fullPath });
        expect.fail("Should have thrown an error");
      } catch (err: unknown) {
        const error = err as Error;

        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe(
          `[IO Error] Failed to read "${fullPath}": Raw string filesystem exception`,
        );
        expect(error.cause).toBe("Raw string filesystem exception");
      } finally {
        readSpy.mockRestore();
      }
    });
  });
});
