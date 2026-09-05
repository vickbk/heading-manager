// scripts/features/docs/utils/errors/readme-validation-error.test.ts
import { describe, expect, it } from "vitest";
import type { ReadmeSectionValidationResult } from "../types";
import { ReadmeValidationError } from "./readme-validation-error";

describe("ReadmeValidationError", () => {
  const createMockResult = (
    diagnosticCount: number,
  ): ReadmeSectionValidationResult => ({
    isValid: false,
    diagnostics: Array.from({ length: diagnosticCount }, (_, index) => ({
      code: "missing-required-section",
      sectionId: `section-${index}`,
      expectedHeading: `Heading ${index}`,
      message: `Missing section ${index}`,
    })),
    foundSectionIds: [],
    missingRequiredSections: [`section-0`],
    sections: [],
  });

  describe("Inheritance and Instance Checks", () => {
    it("should correctly inherit from the standard Error class", () => {
      const mockResult = createMockResult(1);
      const error = new ReadmeValidationError("README.md", mockResult);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ReadmeValidationError);
      expect(error.name).toBe("ReadmeValidationError");
    });
  });

  describe("Property Initialization & Access", () => {
    it("should retain exact references to path and result objects", () => {
      const filePath = "docs/architecture/README.md";
      const mockResult = createMockResult(2);

      const error = new ReadmeValidationError(filePath, mockResult);

      expect(error.path).toBe(filePath);
      expect(error.result).toBe(mockResult);
      expect(error.result.diagnostics).toHaveLength(2);
    });
  });

  describe("Error Message Formatting", () => {
    it("should format the error message correctly for a single diagnostic issue", () => {
      const mockResult = createMockResult(1);
      const error = new ReadmeValidationError(
        "packages/core/README.md",
        mockResult,
      );

      expect(error.message).toBe(
        'README validation failed for "packages/core/README.md" with 1 diagnostic issue(s).',
      );
    });

    it("should format the error message correctly for multiple diagnostic issues", () => {
      const mockResult = createMockResult(4);
      const error = new ReadmeValidationError("README.md", mockResult);

      expect(error.message).toBe(
        'README validation failed for "README.md" with 4 diagnostic issue(s).',
      );
    });

    it("should format correctly even if instantiated with 0 diagnostics", () => {
      const mockResult = createMockResult(0);
      const error = new ReadmeValidationError("EMPTY.md", mockResult);

      expect(error.message).toBe(
        'README validation failed for "EMPTY.md" with 0 diagnostic issue(s).',
      );
    });
  });

  describe("Stack Trace & Native Mechanics", () => {
    it("should capture a valid stack trace", () => {
      const mockResult = createMockResult(1);
      const error = new ReadmeValidationError("README.md", mockResult);

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain("ReadmeValidationError");
    });

    it("should handle environments where Error.captureStackTrace is missing", () => {
      const originalCaptureStackTrace = Error.captureStackTrace;
      // @ts-expect-error mutating global V8 stack trace helper for test
      delete Error.captureStackTrace;

      try {
        const mockResult = createMockResult(1);
        const error = new ReadmeValidationError("README.md", mockResult);

        expect(error).toBeInstanceOf(ReadmeValidationError);
        expect(error.message).toBe(
          'README validation failed for "README.md" with 1 diagnostic issue(s).',
        );
      } finally {
        Error.captureStackTrace = originalCaptureStackTrace;
      }
    });
  });

  describe("Exception Throwing & Catching", () => {
    it("should preserve instance properties when caught in a try/catch block", () => {
      const mockResult = createMockResult(3);

      try {
        throw new ReadmeValidationError("src/README.md", mockResult);
      } catch (err) {
        expect(err instanceof ReadmeValidationError).toBe(true);

        if (err instanceof ReadmeValidationError) {
          expect(err.path).toBe("src/README.md");
          expect(err.result.diagnostics).toHaveLength(3);
          expect(err.result.diagnostics[0].code).toBe(
            "missing-required-section",
          );
        }
      }
    });
  });
});
