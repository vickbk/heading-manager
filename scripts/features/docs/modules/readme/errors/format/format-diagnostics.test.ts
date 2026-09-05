// scripts/features/docs/utils/orchestration/formatters/format-diagnostics.test.ts
import { describe, expect, it } from "vitest";

import { ReadmeSectionValidationResult } from "../../types";
import { ReadmeValidationError } from "../readme-validation-error";
import { formatDiagnostics } from "./format-diagnostics";

type Diagnostic = {
  code: string;
  sectionId?: string;
  line?: number;
  message: string;
};

/**
 * Helper to construct a ReadmeValidationError with specific diagnostics.
 */
function createMockValidationError(
  diagnostics: Diagnostic[],
): ReadmeValidationError {
  const mockResult = {
    isValid: false,
    foundSectionIds: [],
    missingRequiredSections: [],
    missingRecommendedSections: [],
    diagnostics,
    sections: [],
  } as ReadmeSectionValidationResult;

  return new ReadmeValidationError("./README.md", mockResult);
}

describe("formatDiagnostics", () => {
  it("does not mutate lines array when diagnostics array is empty", () => {
    const error = createMockValidationError([]);
    const lines: string[] = [];

    formatDiagnostics(error, lines);

    expect(lines).toEqual([]);
    expect(lines).toHaveLength(0);
  });

  it("formats a diagnostic with only code and message (no sectionId or line)", () => {
    const diagnostics: Diagnostic[] = [
      {
        code: "invalid-header-syntax",
        message: "Header contains invalid trailing syntax.",
      },
    ];
    const error = createMockValidationError(diagnostics);
    const lines: string[] = [];

    formatDiagnostics(error, lines);

    expect(lines).toEqual([
      "  Diagnostics:",
      "    - [invalid-header-syntax] Header contains invalid trailing syntax.",
    ]);
  });

  it("formats a diagnostic with sectionId only", () => {
    const diagnostics: Diagnostic[] = [
      {
        code: "missing-section",
        message: "Required section is missing.",
        sectionId: "installation",
      },
    ];
    const error = createMockValidationError(diagnostics);
    const lines: string[] = [];

    formatDiagnostics(error, lines);

    expect(lines).toEqual([
      "  Diagnostics:",
      "    - [missing-section] Required section is missing. [section: installation]",
    ]);
  });

  it("formats a diagnostic with line number only", () => {
    const diagnostics: Diagnostic[] = [
      {
        code: "syntax-error",
        message: "Malformed Markdown list item.",
        line: 14,
      },
    ];
    const error = createMockValidationError(diagnostics);
    const lines: string[] = [];

    formatDiagnostics(error, lines);

    expect(lines).toEqual([
      "  Diagnostics:",
      "    - [syntax-error] Malformed Markdown list item. (line 14)",
    ]);
  });

  it("formats a diagnostic with both sectionId and line number in correct order", () => {
    const diagnostics: Diagnostic[] = [
      {
        code: "ordering-violation",
        message: "Section appeared out of order according to contract.",
        sectionId: "license",
        line: 88,
      },
    ];
    const error = createMockValidationError(diagnostics);
    const lines: string[] = [];

    formatDiagnostics(error, lines);

    expect(lines).toEqual([
      "  Diagnostics:",
      "    - [ordering-violation] Section appeared out of order according to contract. [section: license] (line 88)",
    ]);
  });

  it("formats multiple diagnostics sequentially in array order", () => {
    const diagnostics: Diagnostic[] = [
      {
        code: "duplicate-heading",
        message: "Duplicate section heading detected.",
        sectionId: "usage",
        line: 10,
      },
      {
        code: "empty-section",
        message: "Section content cannot be empty.",
        sectionId: "contributing",
        line: 25,
      },
    ];
    const error = createMockValidationError(diagnostics);
    const lines: string[] = [];

    formatDiagnostics(error, lines);

    expect(lines).toEqual([
      "  Diagnostics:",
      "    - [duplicate-heading] Duplicate section heading detected. [section: usage] (line 10)",
      "    - [empty-section] Section content cannot be empty. [section: contributing] (line 25)",
    ]);
  });

  it("appends diagnostic output to an existing populated lines array", () => {
    const diagnostics: Diagnostic[] = [
      {
        code: "bad-format",
        message: "Incorrect heading level.",
      },
    ];
    const error = createMockValidationError(diagnostics);
    const lines: string[] = ["Existing Header 1", "Existing Header 2"];

    formatDiagnostics(error, lines);

    expect(lines).toEqual([
      "Existing Header 1",
      "Existing Header 2",
      "  Diagnostics:",
      "    - [bad-format] Incorrect heading level.",
    ]);
  });

  describe("Edge Cases", () => {
    it("handles line: 0 correctly (treats as falsy and omits line output)", () => {
      const diagnostics: Diagnostic[] = [
        {
          code: "file-start-error",
          message: "Frontmatter error.",
          line: 0,
        },
      ];
      const error = createMockValidationError(diagnostics);
      const lines: string[] = [];

      formatDiagnostics(error, lines);

      expect(lines).toEqual([
        "  Diagnostics:",
        "    - [file-start-error] Frontmatter error.",
      ]);
    });

    it("handles empty string sectionId (treats as falsy and omits section output)", () => {
      const diagnostics: Diagnostic[] = [
        {
          code: "unknown-error",
          message: "Generic failure.",
          sectionId: "",
        },
      ];
      const error = createMockValidationError(diagnostics);
      const lines: string[] = [];

      formatDiagnostics(error, lines);

      expect(lines).toEqual([
        "  Diagnostics:",
        "    - [unknown-error] Generic failure.",
      ]);
    });

    it("handles special characters and symbols inside code, message, and sectionId", () => {
      const diagnostics: Diagnostic[] = [
        {
          code: "ERR_CODE@123",
          message: "Failed parsing path 'src/foo/bar.ts' (details: <null>).",
          sectionId: "@scope/pkg#readme",
          line: 404,
        },
      ];
      const error = createMockValidationError(diagnostics);
      const lines: string[] = [];

      formatDiagnostics(error, lines);

      expect(lines).toEqual([
        "  Diagnostics:",
        "    - [ERR_CODE@123] Failed parsing path 'src/foo/bar.ts' (details: <null>). [section: @scope/pkg#readme] (line 404)",
      ]);
    });
  });
});
