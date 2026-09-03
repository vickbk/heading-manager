import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createTextFileSync } from "./create-text-file-sync";

describe("createTextFile", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "create-text-file-test-"));
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe("file creation & content writing", () => {
    it("should create a text file with specified content and return fullPath", () => {
      const filePath = "test.txt";
      const content = "Hello World!";

      const result = createTextFileSync({
        filePath,
        content,
        baseDir: tempDir,
      });

      const expectedPath = path.resolve(tempDir, filePath);
      expect(result).toBe(expectedPath);
      expect(fs.existsSync(result)).toBe(true);
      expect(fs.readFileSync(result, "utf8")).toBe(content);
    });

    it("should recursively create nested subdirectories if they do not exist", () => {
      const filePath = "deeply/nested/folder/structure/output.txt";
      const content = "Nested directory content";

      const result = createTextFileSync({
        filePath,
        content,
        baseDir: tempDir,
      });

      expect(fs.existsSync(result)).toBe(true);
      expect(fs.readFileSync(result, "utf8")).toBe(content);
    });

    it("should handle empty string content correctly", () => {
      const filePath = "empty.txt";

      const result = createTextFileSync({
        filePath,
        content: "",
        baseDir: tempDir,
      });

      expect(fs.existsSync(result)).toBe(true);
      expect(fs.readFileSync(result, "utf8")).toBe("");
    });

    it("should correctly handle multi-line string and unicode content", () => {
      const filePath = "unicode.txt";
      const content = "Line 1\nLine 2\n🚀 Special Characters: ⚛️ ✅";

      const result = createTextFileSync({
        filePath,
        content,
        baseDir: tempDir,
      });

      expect(fs.readFileSync(result, "utf8")).toBe(content);
    });
  });

  describe("overwrite behavior", () => {
    it("should overwrite an existing file by default (overwrite = true)", () => {
      const filePath = "overwrite-default.txt";
      createTextFileSync({
        filePath,
        content: "Initial Version",
        baseDir: tempDir,
      });

      const result = createTextFileSync({
        filePath,
        content: "Updated Version",
        baseDir: tempDir,
      });

      expect(fs.readFileSync(result, "utf8")).toBe("Updated Version");
    });

    it("should overwrite an existing file when overwrite is explicitly true", () => {
      const filePath = "overwrite-explicit.txt";
      createTextFileSync({ filePath, content: "Version 1", baseDir: tempDir });

      const result = createTextFileSync({
        filePath,
        content: "Version 2",
        baseDir: tempDir,
        overwrite: true,
      });

      expect(fs.readFileSync(result, "utf8")).toBe("Version 2");
    });

    it("should throw EEXIST error and preserve original file when overwrite is false and file exists", () => {
      const filePath = "no-overwrite.txt";
      createTextFileSync({
        filePath,
        content: "Original Content",
        baseDir: tempDir,
      });

      expect(() => {
        createTextFileSync({
          filePath,
          content: "New Attempted Content",
          baseDir: tempDir,
          overwrite: false,
        });
      }).toThrow(/EEXIST/);

      const fullPath = path.resolve(tempDir, filePath);
      expect(fs.readFileSync(fullPath, "utf8")).toBe("Original Content");
    });

    it("should write file successfully when overwrite is false and file does not exist", () => {
      const filePath = "fresh-no-overwrite.txt";
      const content = "Brand New File";

      const result = createTextFileSync({
        filePath,
        content,
        baseDir: tempDir,
        overwrite: false,
      });

      expect(fs.readFileSync(result, "utf8")).toBe(content);
    });
  });

  describe("path traversal & security validation", () => {
    it("should throw Access Denied error when attempting to traverse above baseDir using ../", () => {
      const resolvedBase = path.resolve(tempDir);

      expect(() => {
        createTextFileSync({
          filePath: "../malicious.txt",
          content: "data",
          baseDir: tempDir,
        });
      }).toThrow(`Access denied: Target path outside "${resolvedBase}"`);
    });

    it("should throw Access Denied error when nested relative traversal resolves outside baseDir", () => {
      const resolvedBase = path.resolve(tempDir);

      expect(() => {
        createTextFileSync({
          filePath: "subfolder/../../outside.txt",
          content: "data",
          baseDir: tempDir,
        });
      }).toThrow(`Access denied: Target path outside "${resolvedBase}"`);
    });

    it("should throw Access Denied error when passing an absolute path outside baseDir", () => {
      const resolvedBase = path.resolve(tempDir);
      const forbiddenPath = path.resolve(tempDir, "..", "forbidden.txt");

      expect(() => {
        createTextFileSync({
          filePath: forbiddenPath,
          content: "data",
          baseDir: tempDir,
        });
      }).toThrow(`Access denied: Target path outside "${resolvedBase}"`);
    });

    it("should allow absolute paths if they resolve inside baseDir", () => {
      const validAbsolutePath = path.resolve(tempDir, "allowed-absolute.txt");
      const content = "Absolute path inside baseDir";

      const result = createTextFileSync({
        filePath: validAbsolutePath,
        content,
        baseDir: tempDir,
      });

      expect(result).toBe(validAbsolutePath);
      expect(fs.readFileSync(result, "utf8")).toBe(content);
    });
  });
});
