// scripts/features/docs/utils/orchestration/formatters/format-readme-validation-error.test.ts
import { describe, expect, it } from "vitest";

import { ReadmeSectionValidationResult } from "../../types";
import { ReadmeValidationError } from "../readme-validation-error";
import { formatReadmeValidationError } from "./format-readme-validation-error";

/**
 * Helper to construct a ReadmeValidationError instance with custom path and result overrides.
 */
function createMockValidationError(
  path: string,
  resultOverrides: Partial<ReadmeSectionValidationResult> = {},
): ReadmeValidationError {
  const mockResult = {
    isValid: false,
    foundSectionIds: [],
    missingRequiredSections: [],
    diagnostics: [],
    sections: [],
    ...resultOverrides,
  };

  return new ReadmeValidationError(path, mockResult);
}

describe("formatReadmeValidationError", () => {
  it("formats error header only when there are no missing sections or diagnostics", () => {
    const error = createMockValidationError("./README.md");
    const formatted = formatReadmeValidationError(error);

    expect(formatted).toBe("[README Validation Failed] Path: ./README.md");
  });

  it("formats error with missing required sections block only", () => {
    const error = createMockValidationError("./packages/core/README.md", {
      missingRequiredSections: ["quick-start", "installation"],
    });

    const formatted = formatReadmeValidationError(error);

    expect(formatted).toBe(
      "[README Validation Failed] Path: ./packages/core/README.md\n" +
        "  Missing Required Sections:\n" +
        "    - quick-start\n" +
        "    - installation",
    );
  });

  it("formats error with diagnostics block only", () => {
    const error = createMockValidationError("./README.md", {
      diagnostics: [
        {
          code: "syntax-error" as "missing-required-section",
          message: "Invalid markdown heading syntax.",
          line: 12,
        },
      ],
    });

    const formatted = formatReadmeValidationError(error);

    expect(formatted).toBe(
      "[README Validation Failed] Path: ./README.md\n" +
        "  Diagnostics:\n" +
        "    - [syntax-error] Invalid markdown heading syntax. (line 12)",
    );
  });

  it("combines missing required sections and diagnostics in correct sequential order", () => {
    const error = createMockValidationError("./README.md", {
      missingRequiredSections: ["license"],
      diagnostics: [
        {
          code: "bad-ordering" as "missing-required-section",
          message: "Section out of order.",
          sectionId: "usage",
          line: 45,
        },
      ],
    });

    const formatted = formatReadmeValidationError(error);

    expect(formatted).toBe(
      "[README Validation Failed] Path: ./README.md\n" +
        "  Missing Required Sections:\n" +
        "    - license\n" +
        "  Diagnostics:\n" +
        "    - [bad-ordering] Section out of order. [section: usage] (line 45)",
    );
  });

  describe("Edge Cases", () => {
    it("handles empty string path cleanly", () => {
      const error = createMockValidationError("");
      const formatted = formatReadmeValidationError(error);

      expect(formatted).toBe("[README Validation Failed] Path: ");
    });

    it("handles paths with spaces, windows-style backslashes, and special symbols", () => {
      const path = "C:\\Users\\Dev Project\\pkg @scope\\README.md";
      const error = createMockValidationError(path);
      const formatted = formatReadmeValidationError(error);

      expect(formatted).toBe(`[README Validation Failed] Path: ${path}`);
    });

    it("correctly joins all formatted lines using single newline characters", () => {
      const error = createMockValidationError("./README.md", {
        missingRequiredSections: ["identity"],
        diagnostics: [
          {
            code: "E01" as "missing-required-section",
            message: "Error message 1",
          },
          {
            code: "E02" as "missing-required-section",
            message: "Error message 2",
          },
        ],
      });

      const formatted = formatReadmeValidationError(error);
      const lines = formatted.split("\n");

      expect(lines).toHaveLength(6);
      expect(lines[0]).toBe("[README Validation Failed] Path: ./README.md");
      expect(lines[1]).toBe("  Missing Required Sections:");
      expect(lines[2]).toBe("    - identity");
      expect(lines[3]).toBe("  Diagnostics:");
      expect(lines[4]).toBe("    - [E01] Error message 1");
      expect(lines[5]).toBe("    - [E02] Error message 2");
    });
  });
});
