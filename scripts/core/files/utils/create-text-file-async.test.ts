import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createTextFileAsync } from "./create-text-file-async";

describe("createTextFileAsync", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "create-text-file-async-test-"),
    );
  });

  afterEach(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe("file creation & content writing", () => {
    it("should asynchronously create a text file with specified content and return fullPath", async () => {
      const filePath = "async-test.txt";
      const content = "Async Hello World!";

      const result = await createTextFileAsync({
        filePath,
        content,
        baseDir: tempDir,
      });

      const expectedPath = path.resolve(tempDir, filePath);
      expect(result).toBe(expectedPath);

      const fileExists = await fs
        .access(result)
        .then(() => true)
        .catch(() => false);

      expect(fileExists).toBe(true);

      const readContent = await fs.readFile(result, "utf8");
      expect(readContent).toBe(content);
    });

    it("should recursively create nested subdirectories if they do not exist", async () => {
      const filePath = "async/deeply/nested/structure/output.txt";
      const content = "Async nested directory content";

      const result = await createTextFileAsync({
        filePath,
        content,
        baseDir: tempDir,
      });

      const readContent = await fs.readFile(result, "utf8");
      expect(readContent).toBe(content);
    });

    it("should handle empty string content correctly", async () => {
      const filePath = "empty-async.txt";

      const result = await createTextFileAsync({
        filePath,
        content: "",
        baseDir: tempDir,
      });

      const readContent = await fs.readFile(result, "utf8");
      expect(readContent).toBe("");
    });

    it("should correctly handle multi-line string and unicode content", async () => {
      const filePath = "unicode-async.txt";
      const content = "Line 1\nLine 2\n⚡ Async Special Characters: 🌐 ⚙️";

      const result = await createTextFileAsync({
        filePath,
        content,
        baseDir: tempDir,
      });

      const readContent = await fs.readFile(result, "utf8");
      expect(readContent).toBe(content);
    });

    it("should execute multiple parallel file creations without race conditions", async () => {
      const files = Array.from({ length: 5 }, (_, i) => ({
        filePath: `parallel/file-${i}.txt`,
        content: `Content for file ${i}`,
      }));

      const results = await Promise.all(
        files.map((file) =>
          createTextFileAsync({
            filePath: file.filePath,
            content: file.content,
            baseDir: tempDir,
          }),
        ),
      );

      for (let i = 0; i < files.length; i++) {
        const readContent = await fs.readFile(results[i], "utf8");
        expect(readContent).toBe(files[i].content);
      }
    });
  });

  describe("overwrite behavior", () => {
    it("should overwrite an existing file by default (overwrite = true)", async () => {
      const filePath = "overwrite-default-async.txt";

      await createTextFileAsync({
        filePath,
        content: "Initial Async Version",
        baseDir: tempDir,
      });

      const result = await createTextFileAsync({
        filePath,
        content: "Updated Async Version",
        baseDir: tempDir,
      });

      const readContent = await fs.readFile(result, "utf8");
      expect(readContent).toBe("Updated Async Version");
    });

    it("should overwrite an existing file when overwrite is explicitly true", async () => {
      const filePath = "overwrite-explicit-async.txt";

      await createTextFileAsync({
        filePath,
        content: "Version 1",
        baseDir: tempDir,
      });

      const result = await createTextFileAsync({
        filePath,
        content: "Version 2",
        baseDir: tempDir,
        overwrite: true,
      });

      const readContent = await fs.readFile(result, "utf8");
      expect(readContent).toBe("Version 2");
    });

    it("should reject with EEXIST error and preserve original file when overwrite is false and file exists", async () => {
      const filePath = "no-overwrite-async.txt";

      await createTextFileAsync({
        filePath,
        content: "Original Content",
        baseDir: tempDir,
      });

      await expect(
        createTextFileAsync({
          filePath,
          content: "New Attempted Content",
          baseDir: tempDir,
          overwrite: false,
        }),
      ).rejects.toThrow(/EEXIST/);

      const fullPath = path.resolve(tempDir, filePath);
      const readContent = await fs.readFile(fullPath, "utf8");
      expect(readContent).toBe("Original Content");
    });

    it("should write file successfully when overwrite is false and file does not exist", async () => {
      const filePath = "fresh-no-overwrite-async.txt";
      const content = "Brand New Async File";

      const result = await createTextFileAsync({
        filePath,
        content,
        baseDir: tempDir,
        overwrite: false,
      });

      const readContent = await fs.readFile(result, "utf8");
      expect(readContent).toBe(content);
    });
  });

  describe("path traversal & security validation", () => {
    it("should throw Access Denied error when attempting to traverse above baseDir using ../", async () => {
      const resolvedBase = path.resolve(tempDir);

      await expect(
        createTextFileAsync({
          filePath: "../malicious.txt",
          content: "data",
          baseDir: tempDir,
        }),
      ).rejects.toThrow(`Access denied: Target path outside "${resolvedBase}"`);
    });

    it("should throw Access Denied error when nested relative traversal resolves outside baseDir", async () => {
      const resolvedBase = path.resolve(tempDir);

      await expect(
        createTextFileAsync({
          filePath: "subfolder/../../outside.txt",
          content: "data",
          baseDir: tempDir,
        }),
      ).rejects.toThrow(`Access denied: Target path outside "${resolvedBase}"`);
    });

    it("should throw Access Denied error when passing an absolute path outside baseDir", async () => {
      const resolvedBase = path.resolve(tempDir);
      const forbiddenPath = path.resolve(tempDir, "..", "forbidden.txt");

      await expect(
        createTextFileAsync({
          filePath: forbiddenPath,
          content: "data",
          baseDir: tempDir,
        }),
      ).rejects.toThrow(`Access denied: Target path outside "${resolvedBase}"`);
    });

    it("should allow absolute paths if they resolve inside baseDir", async () => {
      const validAbsolutePath = path.resolve(
        tempDir,
        "allowed-absolute-async.txt",
      );
      const content = "Absolute path inside baseDir";

      const result = await createTextFileAsync({
        filePath: validAbsolutePath,
        content,
        baseDir: tempDir,
      });

      expect(result).toBe(validAbsolutePath);

      const readContent = await fs.readFile(result, "utf8");
      expect(readContent).toBe(content);
    });
  });
});
