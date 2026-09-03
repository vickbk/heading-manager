import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { readJsonFile } from "./read-json-file";
import * as readTextModule from "./read-text-file-async";

describe("readJsonFile", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("Happy Path Execution", () => {
    it("should parse valid JSON object content", async () => {
      const mockData = { name: "app-config", version: 1.0, active: true };
      vi.spyOn(readTextModule, "readTextFileAsync").mockResolvedValue(
        JSON.stringify(mockData),
      );

      const result = await readJsonFile<typeof mockData>({
        filePath: "config.json",
      });

      expect(result).toEqual(mockData);
    });

    it("should parse non-object JSON primitives and arrays", async () => {
      const spy = vi.spyOn(readTextModule, "readTextFileAsync");

      spy.mockResolvedValueOnce(JSON.stringify(["item1", "item2"]));
      await expect(
        readJsonFile<string[]>({ filePath: "list.json" }),
      ).resolves.toEqual(["item1", "item2"]);

      spy.mockResolvedValueOnce(JSON.stringify(42));
      await expect(
        readJsonFile<number>({ filePath: "number.json" }),
      ).resolves.toBe(42);

      spy.mockResolvedValueOnce(JSON.stringify(null));
      await expect(
        readJsonFile<null>({ filePath: "null.json" }),
      ).resolves.toBeNull();
    });

    it("should pass all options unaltered to readTextFileAsync", async () => {
      const spy = vi
        .spyOn(readTextModule, "readTextFileAsync")
        .mockResolvedValue("{}");

      const options = {
        filePath: "settings.json",
        baseDir: "/var/app/config",
        encoding: "utf8" as const,
      };

      await readJsonFile(options);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(options);
    });
  });

  describe("JSON Parsing Failures", () => {
    it("should format parse error with relative path when baseDir is omitted", async () => {
      const filePath = "invalid.json";
      const rawContent = "{ name: 'invalid JSON', }";
      vi.spyOn(readTextModule, "readTextFileAsync").mockResolvedValue(
        rawContent,
      );

      let parseError: Error | undefined;
      try {
        await readJsonFile({ filePath });
      } catch (err) {
        parseError = err as Error;
      }

      expect(parseError).toBeInstanceOf(Error);
      expect(parseError?.message).toContain(
        `[JSON Parse Error] Failed to parse JSON from "${filePath}":`,
      );
      expect(parseError?.cause).toBeInstanceOf(SyntaxError);
    });

    it("should format parse error with resolved absolute path when baseDir is provided", async () => {
      const baseDir = "/root/project";
      const filePath = "config/bad.json";
      const expectedFullPath = path.resolve(baseDir, filePath);

      vi.spyOn(readTextModule, "readTextFileAsync").mockResolvedValue(
        "invalid json content",
      );

      const promise = readJsonFile({ filePath, baseDir });

      await expect(promise).rejects.toThrow(
        `[JSON Parse Error] Failed to parse JSON from "${expectedFullPath}":`,
      );

      try {
        await promise;
      } catch (err: unknown) {
        expect((err as { cause: unknown })?.cause).toBeInstanceOf(SyntaxError);
      }
    });

    it("should handle empty file content parse failures", async () => {
      const filePath = "empty.json";
      vi.spyOn(readTextModule, "readTextFileAsync").mockResolvedValue("");

      const promise = readJsonFile({ filePath });

      await expect(promise).rejects.toThrow(
        `[JSON Parse Error] Failed to parse JSON from "${filePath}":`,
      );
    });
  });

  describe("I/O Error Propagation", () => {
    it("should allow readTextFileAsync errors to bubble up without wrapping", async () => {
      const ioError = new Error(
        '[IO Error] Failed to read "/missing.json": ENOENT: no such file',
      );
      vi.spyOn(readTextModule, "readTextFileAsync").mockRejectedValue(ioError);

      const promise = readJsonFile({ filePath: "missing.json" });

      await expect(promise).rejects.toThrow(ioError);
      await expect(promise).rejects.not.toThrow("[JSON Parse Error]");
    });
  });
});
