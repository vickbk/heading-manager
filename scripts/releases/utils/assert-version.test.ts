import { normalizePath } from "@/scripts/shared/normalize-path";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { assertVersionMatch } from "./assert-version";

describe("assertVersionMatch", () => {
  const DEFAULT_CWD = "/project/root";
  const DEFAULT_PKG_PATH = normalizePath(
    path.resolve(DEFAULT_CWD, "package.json"),
    false,
  );

  let existsSyncSpy: ReturnType<typeof vi.spyOn>;
  let readFileSyncSpy: ReturnType<typeof vi.spyOn>;
  let cwdSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    cwdSpy = vi.spyOn(process, "cwd").mockReturnValue(DEFAULT_CWD);
    existsSyncSpy = vi.spyOn(fs, "existsSync");
    readFileSyncSpy = vi.spyOn(fs, "readFileSync");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Path Resolution & Default Parameters", () => {
    it("uses process.cwd() and path.resolve to locate package.json by default", () => {
      existsSyncSpy.mockReturnValue(true);
      readFileSyncSpy.mockReturnValue(JSON.stringify({ version: "1.0.0" }));

      assertVersionMatch("1.0.0");

      expect(cwdSpy).toHaveBeenCalled();
      expect(existsSyncSpy).toHaveBeenCalledWith(DEFAULT_PKG_PATH);
      expect(readFileSyncSpy).toHaveBeenCalledWith(DEFAULT_PKG_PATH, "utf8");
    });

    it("respects a custom packageJsonPath argument when provided", () => {
      const customPath = "/custom/location/package.json";
      existsSyncSpy.mockReturnValue(true);
      readFileSyncSpy.mockReturnValue(JSON.stringify({ version: "1.0.0" }));

      assertVersionMatch("1.0.0", customPath);

      expect(existsSyncSpy).toHaveBeenCalledWith(customPath);
      expect(readFileSyncSpy).toHaveBeenCalledWith(customPath, "utf8");
    });
  });

  describe("File System Guard & Schema Validation", () => {
    it("throws an error if package.json does not exist at target path", () => {
      existsSyncSpy.mockReturnValue(false);

      expect(() => assertVersionMatch("1.0.0")).toThrowError(
        `package.json not found at ${DEFAULT_PKG_PATH}`,
      );
      expect(readFileSyncSpy).not.toHaveBeenCalled();
    });

    it("throws a SyntaxError if package.json contains invalid JSON", () => {
      existsSyncSpy.mockReturnValue(true);
      readFileSyncSpy.mockReturnValue("{ invalid json: ");

      expect(() => assertVersionMatch("1.0.0")).toThrowError(SyntaxError);
    });

    it("throws an error if package.json is missing the 'version' property", () => {
      existsSyncSpy.mockReturnValue(true);
      readFileSyncSpy.mockReturnValue(JSON.stringify({ name: "my-package" }));

      expect(() => assertVersionMatch("1.0.0")).toThrowError(
        `Missing "version" field in ${DEFAULT_PKG_PATH}`,
      );
    });

    it("throws an error if package.json 'version' field is an empty string", () => {
      existsSyncSpy.mockReturnValue(true);
      readFileSyncSpy.mockReturnValue(JSON.stringify({ version: "" }));

      expect(() => assertVersionMatch("1.0.0")).toThrow(
        `Missing "version" field in ${DEFAULT_PKG_PATH}`,
      );
    });
  });

  describe("Version Comparison & Matching Logic", () => {
    it("returns targetVersion when standard semver tags match exactly", () => {
      existsSyncSpy.mockReturnValue(true);
      readFileSyncSpy.mockReturnValue(JSON.stringify({ version: "1.2.3" }));

      const result = assertVersionMatch("1.2.3");

      expect(result).toBe("1.2.3");
    });

    it("returns targetVersion when prerelease versions match", () => {
      existsSyncSpy.mockReturnValue(true);
      readFileSyncSpy.mockReturnValue(
        JSON.stringify({ version: "0.2.0-beta.1" }),
      );

      const result = assertVersionMatch("0.2.0-beta.1");

      expect(result).toBe("0.2.0-beta.1");
    });

    it("handles tags with 'v' prefixes via internal resolveVersionTag logic", () => {
      existsSyncSpy.mockReturnValue(true);
      readFileSyncSpy.mockReturnValue(JSON.stringify({ version: "0.2.0" }));

      // Assuming resolveVersionTag normalizes 'v0.2.0' to '0.2.0'
      const result = assertVersionMatch("v0.2.0");

      expect(result).toBe("0.2.0");
    });
  });

  describe("Version Mismatch Blockers", () => {
    it("throws a version mismatch error when patch versions differ", () => {
      existsSyncSpy.mockReturnValue(true);
      readFileSyncSpy.mockReturnValue(JSON.stringify({ version: "1.0.0" }));

      expect(() => assertVersionMatch("1.0.1")).toThrowError(
        /Version mismatch blocker!/,
      );
    });

    it("throws a version mismatch error when prerelease tags differ", () => {
      existsSyncSpy.mockReturnValue(true);
      readFileSyncSpy.mockReturnValue(
        JSON.stringify({ version: "0.2.0-beta.1" }),
      );

      expect(() => assertVersionMatch("0.2.0-beta.2")).toThrowError(
        /Version mismatch blocker!/,
      );
    });

    it("formats the mismatch error string with git tag and package.json versions", () => {
      existsSyncSpy.mockReturnValue(true);
      readFileSyncSpy.mockReturnValue(
        JSON.stringify({ version: "0.2.0-beta.1" }),
      );

      expect(() => assertVersionMatch("0.2.1-beta.1")).toThrowError(
        `\nVersion mismatch blocker!\n` +
          `  - Git Tag Version:   "0.2.1-beta.1"\n` +
          `  - package.json:     "0.2.0-beta.1"\n` +
          `Please ensure package.json version matches the release tag before publishing.`,
      );
    });
  });
});
