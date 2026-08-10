import { describe, expect, it } from "vitest";
import { parseHeadingLevel } from "./parse-heading-lever";

describe("parseHeadingLevel", () => {
  // ==========================================
  // 1. DIRECT NUMERIC INPUTS
  // ==========================================
  describe("direct numeric inputs", () => {
    it.each([
      [1, 1],
      [2, 2],
      [6, 6],
      [7, 7],
      [0, 0],
      [-1, -1],
    ])(
      "returns number %i directly when passed as a number type",
      (input, expected) => {
        expect(parseHeadingLevel(input)).toBe(expected);
      },
    );
  });

  // ==========================================
  // 2. STANDARD 'h' PREFIXED STRINGS
  // ==========================================
  describe("standard 'h' prefixed heading strings", () => {
    it.each([
      ["h1", 1],
      ["h2", 2],
      ["h3", 3],
      ["h4", 4],
      ["h5", 5],
      ["h6", 6],
    ])(
      "parses lowercase standard heading tag '%s' as %i",
      (input, expected) => {
        expect(parseHeadingLevel(input)).toBe(expected);
      },
    );

    it.each([
      ["H1", 1],
      ["H2", 2],
      ["H6", 6],
    ])(
      "parses uppercase heading tag '%s' case-insensitively as %i",
      (input, expected) => {
        expect(parseHeadingLevel(input)).toBe(expected);
      },
    );

    it.each([
      ["h0", 0],
      ["h7", 7],
      ["h12", 12],
      ["H99", 99],
    ])(
      "extracts out-of-bounds heading tag numbers from '%s' as %i",
      (input, expected) => {
        expect(parseHeadingLevel(input)).toBe(expected);
      },
    );

    it.each([
      ["h1-title", 1],
      ["H2_section_header", 2],
      ["h3.main-heading", 3],
      ["h4 2026 overview", 4],
    ])(
      "extracts the 'h' level from '%s' with trailing text/metadata as %i",
      (input, expected) => {
        expect(parseHeadingLevel(input)).toBe(expected);
      },
    );
  });

  // ==========================================
  // 3. FALLBACK DIGIT EXTRACTION (NON-'h' PREFIX)
  // ==========================================
  describe("fallback digit extraction from non-'h' strings", () => {
    it.each([
      ["section-2", 2],
      ["heading 3", 3],
      ["level: 4", 4],
      ["title-2026", 2026],
    ])(
      "extracts digits from descriptor string '%s' as %i",
      (input, expected) => {
        expect(parseHeadingLevel(input)).toBe(expected);
      },
    );

    it("extracts the FIRST sequence of digits when multiple numbers are present in a non-'h' string", () => {
      expect(parseHeadingLevel("section 2 item 5")).toBe(2);
      expect(parseHeadingLevel("header-3-version-2")).toBe(3);
    });
  });

  // ==========================================
  // 4. STRINGS WITHOUT DIGITS & INVALID INPUTS
  // ==========================================
  describe("strings without digits and non-numeric inputs", () => {
    it.each(["heading", "section", "main", "h", "H", "---", "!!!", "   "])(
      "returns null for string '%s' containing no digit sequence",
      (input) => {
        expect(parseHeadingLevel(input)).toBeNull();
      },
    );
  });

  // ==========================================
  // 5. FALSY & BOUNDARY VALUE EDGE CASES
  // ==========================================
  describe("falsy and boundary value edge cases", () => {
    it("returns null for an empty string", () => {
      expect(parseHeadingLevel("")).toBeNull();
    });

    it("returns null when passed null or undefined", () => {
      // @ts-expect-error Testing untyped JS caller
      expect(parseHeadingLevel(null)).toBeNull();
      // @ts-expect-error Testing untyped JS caller
      expect(parseHeadingLevel(undefined)).toBeNull();
    });
  });
});
