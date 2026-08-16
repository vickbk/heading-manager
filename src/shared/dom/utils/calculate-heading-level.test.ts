import { describe, expect, it } from "vitest";
import { HeadingLevel } from "../types";
import { calculateNextHeadingLevel } from "./calculate-heading-level";

describe("calculateNextHeadingLevel", () => {
  // ==========================================
  // 1. STANDARD PROGRESSION (hasH1 = true)
  // ==========================================
  describe("standard progression when hasH1 is true", () => {
    it.each<[HeadingLevel, HeadingLevel]>([
      [0, 1], // h1 -> h2
      [1, 2], // h2 -> h3
      [2, 3], // h3 -> h4
      [3, 4], // h4 -> h5
      [4, 5], // h5 -> h6
    ])(
      "increments 0-based index %i to %i when progressing to a deeper section",
      (currentLevel, expectedNextLevel) => {
        expect(calculateNextHeadingLevel(currentLevel, true)).toBe(
          expectedNextLevel,
        );
      },
    );

    it("defaults hasH1 parameter to true when omitted", () => {
      // @ts-expect-error Testing default parameter
      expect(calculateNextHeadingLevel(0)).toBe(0);
      // @ts-expect-error Testing default parameter
      expect(calculateNextHeadingLevel(3)).toBe(4);
    });
  });

  // ==========================================
  // 2. BOUNDARY CAPPING (UPPER LIMIT = 5 / H6)
  // ==========================================
  describe("upper boundary capping at index 5 (h6)", () => {
    it("caps the index at 5 (h6) and does not increment past index 5", () => {
      expect(calculateNextHeadingLevel(5, true)).toBe(5);
    });

    it("maintains index 5 even when hasH1 is false at boundary limit", () => {
      expect(calculateNextHeadingLevel(5, false)).toBe(5);
    });
  });

  // ==========================================
  // 3. NO-H1 SKIPPING LOGIC (hasH1 = false)
  // ==========================================
  describe("heading level retention and H1 keeping when hasH1 is false", () => {
    it("keeps H1 (index 0) at root context when has h1 is false", () => {
      expect(calculateNextHeadingLevel(0, false)).toBe(0);
    });

    it.each<[HeadingLevel]>([[1], [2], [3], [4]])(
      "retains current index %i without incrementing when inside nested sections where hasH1 is false",
      (level) => {
        expect(calculateNextHeadingLevel(level, false)).toBe(level + 1);
      },
    );
  });

  // ==========================================
  // 4. EXHAUSTIVE MATRIX VERIFICATION
  // ==========================================
  describe("exhaustive input-to-output matrix test", () => {
    const testCases: Array<{
      currentLevel: HeadingLevel;
      hasH1: boolean;
      expected: HeadingLevel;
    }> = [
      // Root context (currentLevel = 0)
      { currentLevel: 0, hasH1: true, expected: 1 },
      { currentLevel: 0, hasH1: false, expected: 0 },

      // Mid-level contexts (currentLevel = 1..4)
      { currentLevel: 1, hasH1: true, expected: 2 },
      { currentLevel: 1, hasH1: false, expected: 2 },
      { currentLevel: 2, hasH1: true, expected: 3 },
      { currentLevel: 2, hasH1: false, expected: 3 },
      { currentLevel: 3, hasH1: true, expected: 4 },
      { currentLevel: 3, hasH1: false, expected: 4 },
      { currentLevel: 4, hasH1: true, expected: 5 },
      { currentLevel: 4, hasH1: false, expected: 5 },

      // Max depth context (currentLevel = 5)
      { currentLevel: 5, hasH1: true, expected: 5 },
      { currentLevel: 5, hasH1: false, expected: 5 },
    ];

    it.each(testCases)(
      "maps level $currentLevel (hasH1: $hasH1) -> expected $expected",
      ({ currentLevel, hasH1, expected }) => {
        expect(calculateNextHeadingLevel(currentLevel, hasH1)).toBe(expected);
      },
    );
  });
});
