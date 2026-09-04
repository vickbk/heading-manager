import { describe, expect, it } from "vitest";

import { isNotFoundError } from "./is-not-found-error";

describe("isNotFoundError", () => {
  describe("Non-Error Primitives & Plain Objects", () => {
    it.each([
      ["null", null],
      ["undefined", undefined],
      ["string matching ENOENT", "ENOENT"],
      ["number", 404],
      ["boolean", false],
      ["symbol", Symbol("ENOENT")],
      ["plain object with ENOENT code", { code: "ENOENT" }],
      ["plain object with ENOENT message", { message: "ENOENT" }],
    ])("should return false for non-Error input: %s", (_, input) => {
      expect(isNotFoundError(input)).toBe(false);
    });
  });

  describe("Error Message Matching", () => {
    it("should return true when Error message starts with 'ENOENT'", () => {
      const err = new Error(
        "ENOENT: no such file or directory, open '.dump/log.txt'",
      );
      expect(isNotFoundError(err)).toBe(true);
    });

    it("should return true when 'ENOENT' appears anywhere inside the message", () => {
      const err = new Error("Failed to read log file due to ENOENT condition");
      expect(isNotFoundError(err)).toBe(true);
    });

    it("should return false when Error message contains other error codes like 'EACCES'", () => {
      const err = new Error("EACCES: permission denied, open '.dump/log.txt'");
      expect(isNotFoundError(err)).toBe(false);
    });

    it("should return false for an empty Error message", () => {
      const err = new Error();
      expect(isNotFoundError(err)).toBe(false);
    });
  });

  describe("Error Cause Matching (`err.cause`)", () => {
    it("should return true when err.cause has code 'ENOENT' even if message lacks 'ENOENT'", () => {
      const err = new Error("File read failed", {
        cause: { code: "ENOENT" },
      });

      expect(isNotFoundError(err)).toBe(true);
    });

    it("should return false when err.cause has a code other than 'ENOENT'", () => {
      const err = new Error("File read failed", {
        cause: { code: "EISDIR" },
      });

      expect(isNotFoundError(err)).toBe(false);
    });

    it("should handle non-object cause values gracefully", () => {
      const errWithNullCause = new Error("Failed", { cause: null });
      const errWithStringCause = new Error("Failed", { cause: "ENOENT" });
      const errWithNumberCause = new Error("Failed", { cause: 404 });

      expect(isNotFoundError(errWithNullCause)).toBe(false);
      expect(isNotFoundError(errWithStringCause)).toBe(false);
      expect(isNotFoundError(errWithNumberCause)).toBe(false);
    });

    it("should return false when cause object lacks a 'code' property", () => {
      const err = new Error("Failed", {
        cause: { status: 404, path: "./dump" },
      });

      expect(isNotFoundError(err)).toBe(false);
    });
  });

  describe("Error Subclasses & Inheritance", () => {
    class CustomFileError extends Error {
      constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = "CustomFileError";
      }
    }

    it("should return true for CustomFileError subclasses matching ENOENT message", () => {
      const err = new CustomFileError("ENOENT file missing");
      expect(isNotFoundError(err)).toBe(true);
    });

    it("should return true for CustomFileError subclasses matching cause.code", () => {
      const err = new CustomFileError("Operation failed", { code: "ENOENT" });
      expect(isNotFoundError(err)).toBe(true);
    });

    it("should return false for CustomFileError subclasses without ENOENT match", () => {
      const err = new CustomFileError("Timeout error");
      expect(isNotFoundError(err)).toBe(false);
    });
  });
});
