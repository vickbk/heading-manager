import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ReadmeSectionValidationResult } from "../../types";
import { HEADER_TEXT, handleReadmeCliError } from "../handle-readme-errors";
import { ReadmeValidationError } from "../readme-validation-error";

import * as filesModule from "@/scripts/core/files";

function createMockValidationResult(
  overrides: Partial<ReadmeSectionValidationResult> = {},
): ReadmeSectionValidationResult {
  return {
    isValid: false,
    foundSectionIds: ["identity"],
    missingRequiredSections: [],
    sections: [],
    diagnostics: [],
    ...overrides,
  };
}

describe("handleReadmeCliError (Integration)", () => {
  beforeEach(() => {
    vi.spyOn(filesModule, "createTextFileSync").mockReturnValue("");
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });
  describe("Single Error Types", () => {
    it("formats and returns a single ReadmeValidationError with HEADER_TEXT prefix", () => {
      const result = createMockValidationResult({
        missingRequiredSections: ["installation", "license"],
        diagnostics: [
          {
            code: "ordering-violation",
            message: "Section appeared out of order.",
            sectionId: "installation",
            line: 15,
          },
        ],
      });
      const error = new ReadmeValidationError(
        "./packages/core/README.md",
        result,
      );

      const output = handleReadmeCliError(error);

      const expectedBody =
        "[README Validation Failed] Path: ./packages/core/README.md\n" +
        "  Missing Required Sections:\n" +
        "    - installation\n" +
        "    - license\n" +
        "  Diagnostics:\n" +
        "    - [ordering-violation] Section appeared out of order. [section: installation] (line 15)";

      expect(output).toBe(`${HEADER_TEXT}\n\n${expectedBody}`);
    });

    it("passes standard Error through getErrorMessage and prepends HEADER_TEXT", () => {
      const error = new Error("EACCES: permission denied, open './README.md'");

      const output = handleReadmeCliError(error);

      expect(output.startsWith(`${HEADER_TEXT}\n\n`)).toBe(true);
      expect(output).toContain("EACCES: permission denied, open './README.md'");
    });

    it("handles primitive rejections cleanly under HEADER_TEXT prefix", () => {
      const output = handleReadmeCliError("Failed to resolve file path");

      expect(output).toBe(`${HEADER_TEXT}\n\nFailed to resolve file path`);
    });
  });

  describe("AggregateError Trees (Nested Unwrapping)", () => {
    it("unwraps a flat AggregateError containing mixed error types under HEADER_TEXT", () => {
      const readmeErr = new ReadmeValidationError(
        "./README.md",
        createMockValidationResult({
          missingRequiredSections: ["usage"],
        }),
      );
      const fsErr = new Error("ENOENT: no such file or directory");
      const stringErr = "Invalid CLI flags provided";

      const aggregate = new AggregateError([readmeErr, fsErr, stringErr]);

      const output = handleReadmeCliError(aggregate);

      expect(output.startsWith(`${HEADER_TEXT}\n\n`)).toBe(true);

      const body = output.replace(`${HEADER_TEXT}\n\n`, "");
      const expectedDivider = "\n\n" + "-".repeat(50) + "\n\n";
      const parts = body.split(expectedDivider);

      expect(parts).toHaveLength(3);
      expect(parts[0]).toBe(
        "[README Validation Failed] Path: ./README.md\n" +
          "  Missing Required Sections:\n" +
          "    - usage",
      );
      expect(parts[1]).toContain("ENOENT: no such file or directory");
      expect(parts[2]).toBe("Invalid CLI flags provided");
    });

    it("recursively unwraps deeply nested AggregateError trees maintaining depth order under HEADER_TEXT", () => {
      const readmeErr1 = new ReadmeValidationError(
        "./pkg-a/README.md",
        createMockValidationResult({
          missingRequiredSections: ["identity"],
        }),
      );
      const readmeErr2 = new ReadmeValidationError(
        "./pkg-b/README.md",
        createMockValidationResult({
          diagnostics: [
            {
              code: "empty-file" as "missing-required-section",
              message: "README file is empty.",
            },
          ],
        }),
      );
      const genericErr = new Error("Build step aborted");

      const innerAggregate = new AggregateError([readmeErr2, genericErr]);
      const outerAggregate = new AggregateError([readmeErr1, innerAggregate]);

      const output = handleReadmeCliError(outerAggregate);

      expect(output.startsWith(`${HEADER_TEXT}\n\n`)).toBe(true);

      const body = output.replace(`${HEADER_TEXT}\n\n`, "");
      const separator = "\n\n" + "-".repeat(50) + "\n\n";
      const blocks = body.split(separator);

      expect(blocks).toHaveLength(3);
      expect(blocks[0]).toContain("Path: ./pkg-a/README.md");
      expect(blocks[1]).toContain("Path: ./pkg-b/README.md");
      expect(blocks[2]).toContain("Build step aborted");
    });
  });

  describe("Edge Cases", () => {
    it("returns an empty string without printing HEADER_TEXT when given an empty AggregateError", () => {
      const output = handleReadmeCliError(new AggregateError([]));

      expect(output).toBe("");
      expect(output).not.toContain(HEADER_TEXT);
    });

    it("handles null and undefined error inputs gracefully under HEADER_TEXT prefix", () => {
      expect(handleReadmeCliError(null)).toBe(`${HEADER_TEXT}\n\nnull`);
      expect(handleReadmeCliError(undefined)).toBe(
        `${HEADER_TEXT}\n\nundefined`,
      );
    });
  });
});
