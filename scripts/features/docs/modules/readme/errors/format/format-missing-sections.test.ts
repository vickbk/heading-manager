import { describe, expect, it } from "vitest";

import { ReadmeValidationError } from "../readme-validation-error";
import { formatMissingSectionsError } from "./format-missing-sections";

/**
 * Helper to construct a ReadmeValidationError with specific missingRequiredSections.
 */
function createMockValidationError(
  missingRequiredSections: string[],
): ReadmeValidationError {
  const mockResult = {
    isValid: false,
    foundSectionIds: [],
    missingRequiredSections,
    missingRecommendedSections: [],
    diagnostics: [],
    sections: [],
  };

  return new ReadmeValidationError("./README.md", mockResult);
}

describe("formatMissingSectionsError", () => {
  it("does not mutate lines when missingRequiredSections is empty", () => {
    const error = createMockValidationError([]);
    const lines: string[] = [];

    formatMissingSectionsError(error, lines);

    expect(lines).toEqual([]);
    expect(lines).toHaveLength(0);
  });

  it("formats and appends a single missing required section", () => {
    const error = createMockValidationError(["quick-start"]);
    const lines: string[] = [];

    formatMissingSectionsError(error, lines);

    expect(lines).toEqual([
      "  Missing Required Sections:",
      "    - quick-start",
    ]);
  });

  it("formats and appends multiple missing required sections in order", () => {
    const error = createMockValidationError([
      "identity",
      "installation",
      "license",
    ]);
    const lines: string[] = [];

    formatMissingSectionsError(error, lines);

    expect(lines).toEqual([
      "  Missing Required Sections:",
      "    - identity",
      "    - installation",
      "    - license",
    ]);
  });

  it("appends to an existing lines array without removing or overwriting prior entries", () => {
    const error = createMockValidationError(["usage"]);
    const lines: string[] = ["Header Line 1", "Header Line 2"];

    formatMissingSectionsError(error, lines);

    expect(lines).toEqual([
      "Header Line 1",
      "Header Line 2",
      "  Missing Required Sections:",
      "    - usage",
    ]);
  });

  describe("Edge Cases", () => {
    it("handles section IDs containing spaces, symbols, and special characters", () => {
      const error = createMockValidationError([
        "getting started",
        "api/v1-reference",
        "@scope/pkg-section",
      ]);
      const lines: string[] = [];

      formatMissingSectionsError(error, lines);

      expect(lines).toEqual([
        "  Missing Required Sections:",
        "    - getting started",
        "    - api/v1-reference",
        "    - @scope/pkg-section",
      ]);
    });

    it("handles duplicate section IDs in missingRequiredSections if present", () => {
      const error = createMockValidationError(["license", "license"]);
      const lines: string[] = [];

      formatMissingSectionsError(error, lines);

      expect(lines).toEqual([
        "  Missing Required Sections:",
        "    - license",
        "    - license",
      ]);
    });
  });
});
