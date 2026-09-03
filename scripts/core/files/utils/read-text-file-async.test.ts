import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { readTextFileAsync } from "./read-text-file-async";

describe("readTextFileAsync", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "read-text-file-async-test-"),
    );
  });

  afterEach(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe("basic file reading & encodings", () => {
    it("should asynchronously read content from a file using a relative path within baseDir", async () => {
      const filePath = "async-sample.txt";
      const expectedContent = "Hello from readTextFileAsync!";
      await fs.writeFile(path.join(tempDir, filePath), expectedContent, "utf8");

      const result = await readTextFileAsync({
        filePath,
        baseDir: tempDir,
      });

      expect(result).toBe(expectedContent);
    });

    it("should read content from a file without baseDir specified", async () => {
      const fullPath = path.join(tempDir, "standalone-async.txt");
      const expectedContent = "Standalone async read test";
      await fs.writeFile(fullPath, expectedContent, "utf8");

      const result = await readTextFileAsync({
        filePath: fullPath,
      });

      expect(result).toBe(expectedContent);
    });

    it("should read nested directory files correctly", async () => {
      const relativePath = "nested/async/dir/structure/file.txt";
      const fullPath = path.join(tempDir, relativePath);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, "Async Nested Content", "utf8");

      const result = await readTextFileAsync({
        filePath: relativePath,
        baseDir: tempDir,
      });

      expect(result).toBe("Async Nested Content");
    });

    it("should handle empty text files", async () => {
      const filePath = "empty-async.txt";
      await fs.writeFile(path.join(tempDir, filePath), "", "utf8");

      const result = await readTextFileAsync({
        filePath,
        baseDir: tempDir,
      });

      expect(result).toBe("");
    });

    it("should handle multi-line string and unicode characters", async () => {
      const filePath = "unicode-async.txt";
      const content = "Line 1\nLine 2\n⚡ Async Unicode Test: 🚀 ⚛️ 🌐";
      await fs.writeFile(path.join(tempDir, filePath), content, "utf8");

      const result = await readTextFileAsync({
        filePath,
        baseDir: tempDir,
      });

      expect(result).toBe(content);
    });

    it("should respect non-utf8 encoding overrides (e.g., base64, hex, latin1)", async () => {
      const filePath = "encoded-async.txt";
      const originalText = "Hello Async World!";
      await fs.writeFile(path.join(tempDir, filePath), originalText, "utf8");

      const base64Result = await readTextFileAsync({
        filePath,
        baseDir: tempDir,
        encoding: "base64",
      });

      expect(base64Result).toBe(Buffer.from(originalText).toString("base64"));
    });

    it("should execute multiple parallel file reads concurrently", async () => {
      const files = Array.from({ length: 5 }, (_, i) => ({
        filePath: `parallel-read-${i}.txt`,
        content: `Async Parallel Read ${i}`,
      }));

      for (const file of files) {
        await fs.writeFile(
          path.join(tempDir, file.filePath),
          file.content,
          "utf8",
        );
      }

      const results = await Promise.all(
        files.map((file) =>
          readTextFileAsync({
            filePath: file.filePath,
            baseDir: tempDir,
          }),
        ),
      );

      for (let i = 0; i < files.length; i++) {
        expect(results[i]).toBe(files[i].content);
      }
    });
  });

  describe("baseDir & path traversal security", () => {
    it("should throw Access Denied error when attempting path traversal outside baseDir via ../", async () => {
      const resolvedBase = path.resolve(tempDir);

      await expect(
        readTextFileAsync({
          filePath: "../unauthorized.txt",
          baseDir: tempDir,
        }),
      ).rejects.toThrow(`Access denied: Target path outside "${resolvedBase}"`);
    });

    it("should throw Access Denied error when nested relative path resolves outside baseDir", async () => {
      const resolvedBase = path.resolve(tempDir);

      await expect(
        readTextFileAsync({
          filePath: "subfolder/../../forbidden.txt",
          baseDir: tempDir,
        }),
      ).rejects.toThrow(`Access denied: Target path outside "${resolvedBase}"`);
    });

    it("should throw Access Denied error when passing an absolute path outside baseDir", async () => {
      const resolvedBase = path.resolve(tempDir);
      const outsidePath = path.resolve(tempDir, "..", "outside.txt");

      await expect(
        readTextFileAsync({
          filePath: outsidePath,
          baseDir: tempDir,
        }),
      ).rejects.toThrow(`Access denied: Target path outside "${resolvedBase}"`);
    });

    it("should allow absolute paths if they resolve inside baseDir", async () => {
      const filePath = "allowed-async.txt";
      const fullPath = path.resolve(tempDir, filePath);
      const content = "Allowed Absolute Async Path Content";
      await fs.writeFile(fullPath, content, "utf8");

      const result = await readTextFileAsync({
        filePath: fullPath,
        baseDir: tempDir,
      });

      expect(result).toBe(content);
    });
  });

  describe("error handling & cause preservation", () => {
    it("should wrap missing file errors and preserve native ENOENT error in cause", async () => {
      const missingPath = path.resolve(tempDir, "non-existent-async.txt");

      try {
        await readTextFileAsync({ filePath: missingPath });
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

    it("should wrap directory read errors and preserve native EISDIR error in cause", async () => {
      const subDir = path.join(tempDir, "some-async-folder");
      await fs.mkdir(subDir);

      try {
        await readTextFileAsync({ filePath: subDir });
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

    it("should handle non-Error thrown values gracefully", async () => {
      const fullPath = path.join(tempDir, "string-error-async.txt");

      const readSpy = vi
        .spyOn(fs, "readFile")
        .mockRejectedValueOnce("Raw string async filesystem exception");

      try {
        await readTextFileAsync({ filePath: fullPath });
        expect.fail("Should have thrown an error");
      } catch (err: unknown) {
        const error = err as Error;

        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe(
          `[IO Error] Failed to read "${fullPath}": Raw string async filesystem exception`,
        );
        expect(error.cause).toBe("Raw string async filesystem exception");
      } finally {
        readSpy.mockRestore();
      }
    });
  });
});
