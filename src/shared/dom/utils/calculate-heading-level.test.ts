import { describe, expect, it } from "vitest";
import { calculateNextHeadingLevel } from "./calculate-heading-level";

describe("calculateNextHeadingLevel", () => {
  // ==========================================
  // 1. STANDARD PROGRESSION (hasH1 = true)
  // ==========================================
  describe("standard progression when hasH1 is true", () => {
    it.each([
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

    it.each([[1], [2], [3], [4]])(
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
      currentLevel: number;
      hasH1: boolean;
      expected: number;
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

  describe("calculateNextHeadingLevel - h6Clamp", () => {
    describe("default behavior", () => {
      it("clamps H6 when h6Clamp is omitted", () => {
        expect(calculateNextHeadingLevel(5, true)).toBe(5);
      });

      it("preserves the default clamp behavior for a level below H6", () => {
        expect(calculateNextHeadingLevel(4, true)).toBe(5);
      });
    });

    describe("h6Clamp=true", () => {
      it("clamps H6 when the current level is H6", () => {
        expect(calculateNextHeadingLevel(5, true, true)).toBe(5);
      });

      it("does not clamp levels below H6", () => {
        expect(calculateNextHeadingLevel(0, true, true)).toBe(1);
        expect(calculateNextHeadingLevel(1, true, true)).toBe(2);
        expect(calculateNextHeadingLevel(2, true, true)).toBe(3);
        expect(calculateNextHeadingLevel(3, true, true)).toBe(4);
        expect(calculateNextHeadingLevel(4, true, true)).toBe(5);
      });

      it("does not alter the first-heading behavior", () => {
        expect(calculateNextHeadingLevel(0, false, true)).toBe(0);
      });
    });

    describe("h6Clamp=false", () => {
      it("allows the normalized level to advance beyond H6", () => {
        expect(calculateNextHeadingLevel(5, true, false)).toBe(6);
      });

      it("allows the normalized level to continue beyond H7", () => {
        expect(calculateNextHeadingLevel(6, true, false)).toBe(7);
      });

      it("allows arbitrary normalized levels beyond H6", () => {
        expect(calculateNextHeadingLevel(7, true, false)).toBe(8);
        expect(calculateNextHeadingLevel(8, true, false)).toBe(9);
        expect(calculateNextHeadingLevel(9, true, false)).toBe(10);
      });

      it("does not clamp any level when disabled", () => {
        for (const currentLevel of [5, 6, 7, 8, 9, 10]) {
          expect(calculateNextHeadingLevel(currentLevel, true, false)).toBe(
            currentLevel + 1,
          );
        }
      });

      it("does not alter the first-heading behavior", () => {
        expect(calculateNextHeadingLevel(0, false, false)).toBe(0);
      });
    });

    describe("h6Clamp boundary", () => {
      it("distinguishes H6 clamping from normalized H7", () => {
        expect(calculateNextHeadingLevel(5, true, true)).toBe(5);
        expect(calculateNextHeadingLevel(5, true, false)).toBe(6);
      });

      it("only applies the clamp at level 5", () => {
        expect(calculateNextHeadingLevel(4, true, true)).toBe(5);
        expect(calculateNextHeadingLevel(4, true, false)).toBe(5);
      });

      it("does not repeatedly clamp already-beyond-H6 normalized levels", () => {
        expect(calculateNextHeadingLevel(6, true, true)).toBe(7);
        expect(calculateNextHeadingLevel(7, true, true)).toBe(8);
      });
    });

    describe("h6Clamp and hasH1 interaction", () => {
      it("returns H1 for the first heading regardless of h6Clamp", () => {
        expect(calculateNextHeadingLevel(0, false, true)).toBe(0);
        expect(calculateNextHeadingLevel(0, false, false)).toBe(0);
      });

      it("advances normally from H1 when h6Clamp is enabled", () => {
        expect(calculateNextHeadingLevel(0, true, true)).toBe(1);
      });

      it("advances normally from H1 when h6Clamp is disabled", () => {
        expect(calculateNextHeadingLevel(0, true, false)).toBe(1);
      });
    });
  });
});
