import { beforeEach, describe, expect, it, vi } from "vitest";

import * as errorsModule from "@/scripts/core/errors";
import * as formatModule from "./format/format-readme-validation-error";
import { ReadmeValidationError } from "./readme-validation-error";
import { unwrapReadmeErrorMessages } from "./unwrap-readme-errors-messages";

function createMockValidationError(path: string): ReadmeValidationError {
  const mockResult = {
    isValid: false,
    foundSectionIds: [],
    missingRequiredSections: ["identity"],
    diagnostics: [],
    sections: [],
  };

  return new ReadmeValidationError(path, mockResult);
}

describe("unwrapReadmeErrorMessages", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("Single Direct Errors", () => {
    it("formats a single ReadmeValidationError using formatReadmeValidationError", () => {
      const formatSpy = vi
        .spyOn(formatModule, "formatReadmeValidationError")
        .mockReturnValue("[Formatted README Error]");
      const getErrorMessageSpy = vi.spyOn(errorsModule, "getErrorMessage");

      const error = createMockValidationError("./README.md");
      const result = unwrapReadmeErrorMessages(error);

      expect(formatSpy).toHaveBeenCalledTimes(1);
      expect(formatSpy).toHaveBeenCalledWith(error);
      expect(getErrorMessageSpy).not.toHaveBeenCalled();
      expect(result).toEqual(["[Formatted README Error]"]);
    });

    it("delegates standard Error instances directly to getErrorMessage", () => {
      const formatSpy = vi.spyOn(formatModule, "formatReadmeValidationError");
      const getErrorMessageSpy = vi
        .spyOn(errorsModule, "getErrorMessage")
        .mockReturnValue("Normalized FS Error");

      const error = new Error("File not found");
      const result = unwrapReadmeErrorMessages(error);

      expect(getErrorMessageSpy).toHaveBeenCalledTimes(1);
      expect(getErrorMessageSpy).toHaveBeenCalledWith(error);
      expect(formatSpy).not.toHaveBeenCalled();
      expect(result).toEqual(["Normalized FS Error"]);
    });

    it("delegates primitive error values (string, null, undefined) to getErrorMessage", () => {
      const getErrorMessageSpy = vi
        .spyOn(errorsModule, "getErrorMessage")
        .mockImplementation((err) => String(err));

      expect(unwrapReadmeErrorMessages("String rejection")).toEqual([
        "String rejection",
      ]);
      expect(unwrapReadmeErrorMessages(null)).toEqual(["null"]);
      expect(unwrapReadmeErrorMessages(undefined)).toEqual(["undefined"]);
      expect(unwrapReadmeErrorMessages(404)).toEqual(["404"]);

      expect(getErrorMessageSpy).toHaveBeenCalledTimes(4);
    });
  });

  describe("Flat AggregateError", () => {
    it("unwraps a flat AggregateError containing multiple ReadmeValidationErrors", () => {
      vi.spyOn(formatModule, "formatReadmeValidationError").mockImplementation(
        (err) => `[Formatted: ${err.path}]`,
      );

      const error1 = createMockValidationError("./pkg-a/README.md");
      const error2 = createMockValidationError("./pkg-b/README.md");
      const aggregate = new AggregateError([error1, error2]);

      const result = unwrapReadmeErrorMessages(aggregate);

      expect(result).toEqual([
        "[Formatted: ./pkg-a/README.md]",
        "[Formatted: ./pkg-b/README.md]",
      ]);
    });

    it("unwraps a flat AggregateError containing mixed error types", () => {
      vi.spyOn(formatModule, "formatReadmeValidationError").mockReturnValue(
        "[README Error]",
      );
      vi.spyOn(errorsModule, "getErrorMessage").mockImplementation((err) =>
        err instanceof Error ? err.message : String(err),
      );

      const readmeError = createMockValidationError("./README.md");
      const stdError = new Error("Disk full");
      const stringError = "Permission denied";

      const aggregate = new AggregateError([
        readmeError,
        stdError,
        stringError,
      ]);
      const result = unwrapReadmeErrorMessages(aggregate);

      expect(result).toEqual([
        "[README Error]",
        "Disk full",
        "Permission denied",
      ]);
    });
  });

  describe("Nested AggregateError Trees", () => {
    it("recursively unwraps deeply nested AggregateErrors in depth-first order", () => {
      vi.spyOn(formatModule, "formatReadmeValidationError").mockImplementation(
        (err) => `[README: ${err.path}]`,
      );
      vi.spyOn(errorsModule, "getErrorMessage").mockImplementation((err) =>
        err instanceof Error ? err.message : String(err),
      );

      const err1 = createMockValidationError("./pkg-1/README.md");
      const err2 = new Error("Generic IO error");
      const err3 = createMockValidationError("./pkg-2/README.md");
      const err4 = "Fatal exit";

      const innerAggregate2 = new AggregateError([err3, err4]);
      const innerAggregate1 = new AggregateError([err2, innerAggregate2]);
      const topAggregate = new AggregateError([err1, innerAggregate1]);

      const result = unwrapReadmeErrorMessages(topAggregate);

      expect(result).toEqual([
        "[README: ./pkg-1/README.md]",
        "Generic IO error",
        "[README: ./pkg-2/README.md]",
        "Fatal exit",
      ]);
    });
  });

  describe("Edge Cases", () => {
    it("returns an empty array when given an empty AggregateError", () => {
      const emptyAggregate = new AggregateError([]);
      const result = unwrapReadmeErrorMessages(emptyAggregate);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it("returns an empty array when given nested empty AggregateErrors", () => {
      const nestedEmpty = new AggregateError([
        new AggregateError([]),
        new AggregateError([new AggregateError([])]),
      ]);

      const result = unwrapReadmeErrorMessages(nestedEmpty);

      expect(result).toEqual([]);
    });
  });
});
