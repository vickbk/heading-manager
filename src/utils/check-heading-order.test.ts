import { describe, expect, it } from "vitest";
import { checkHeadingOrder } from "./check-heading-order";

describe("checkHeadingOrder", () => {
  // ==========================================
  // 1. VALID HEADING HIERARCHIES
  // ==========================================
  describe("valid heading hierarchies", () => {
    it("returns true for a standard sequential progression (H1 -> H2 -> H3)", () => {
      const tree = {
        tagName: "main",
        headings: ["h1"],
        children: [
          {
            tagName: "section",
            headings: ["h2"],
            children: [
              {
                tagName: "article",
                headings: ["h3"],
                children: [],
              },
            ],
          },
        ],
      };

      expect(checkHeadingOrder(tree)).toBe(true);
    });

    it("returns true for sibling regions at the same heading level (H2 -> H2)", () => {
      const tree = {
        tagName: "main",
        headings: ["h1"],
        children: [
          {
            tagName: "section",
            headings: ["h2"],
            children: [],
          },
          {
            tagName: "section",
            headings: ["h2"],
            children: [],
          },
        ],
      };

      expect(checkHeadingOrder(tree)).toBe(true);
    });

    it("returns true when jumping back up to higher parent levels (H3 -> H1 or H3 -> H2)", () => {
      const tree = {
        tagName: "main",
        headings: ["h1"],
        children: [
          {
            tagName: "section",
            headings: ["h2"],
            children: [
              {
                tagName: "article",
                headings: ["h3"],
                children: [],
              },
            ],
          },
          // Jumping back from H3 inside section to H2 sibling
          {
            tagName: "section",
            headings: ["h2"],
            children: [],
          },
        ],
      };

      expect(checkHeadingOrder(tree)).toBe(true);
    });

    it("returns true for deep valid nesting down to H6", () => {
      const tree = {
        tagName: "div",
        headings: ["h1"],
        children: [
          {
            tagName: "div",
            headings: ["h2"],
            children: [
              {
                tagName: "div",
                headings: ["h3"],
                children: [
                  {
                    tagName: "div",
                    headings: ["h4"],
                    children: [
                      {
                        tagName: "div",
                        headings: ["h5"],
                        children: [
                          {
                            tagName: "div",
                            headings: ["h6"],
                            children: [],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      expect(checkHeadingOrder(tree)).toBe(true);
    });
  });

  // ==========================================
  // 2. INVALID HEADING HIERARCHIES
  // ==========================================
  describe("invalid heading hierarchies", () => {
    it("returns false when skipping a heading level (e.g., H1 -> H3)", () => {
      const tree = {
        tagName: "main",
        headings: ["h1"],
        children: [
          {
            tagName: "section",
            headings: ["h3"], // Skipped H2
            children: [],
          },
        ],
      };

      expect(checkHeadingOrder(tree)).toBe(false);
    });

    it("returns false when jumping deeper by more than 1 level (e.g., H2 -> H5)", () => {
      const tree = {
        tagName: "main",
        headings: ["h1"],
        children: [
          {
            tagName: "section",
            headings: ["h2"],
            children: [
              {
                tagName: "article",
                headings: ["h5"], // Skipped H3 and H4
                children: [],
              },
            ],
          },
        ],
      };

      expect(checkHeadingOrder(tree)).toBe(false);
    });

    it("returns false if any single node in a multi-branch tree violates hierarchy", () => {
      const tree = {
        tagName: "main",
        headings: ["h1"],
        children: [
          // Branch 1: Valid
          {
            tagName: "section",
            headings: ["h2"],
            children: [],
          },
          // Branch 2: Invalid (H1 -> H4)
          {
            tagName: "section",
            headings: ["h4"],
            children: [],
          },
        ],
      };

      expect(checkHeadingOrder(tree)).toBe(false);
    });
  });

  // ==========================================
  // 3. REGIONS WITHOUT HEADINGS
  // ==========================================
  describe("regions without headings", () => {
    it("inherits context level when a region has no headings", () => {
      const tree = {
        tagName: "main",
        headings: ["h1"],
        children: [
          {
            tagName: "div", // Wrapper container without heading
            headings: [],
            children: [
              {
                tagName: "section",
                headings: ["h2"], // Valid child of H1 context
                children: [],
              },
            ],
          },
        ],
      };

      expect(checkHeadingOrder(tree)).toBe(true);
    });

    it("detects invalid skip even across heading-less wrapper regions", () => {
      const tree = {
        tagName: "main",
        headings: ["h1"],
        children: [
          {
            tagName: "div", // Wrapper container without heading (inherits H1)
            headings: [],
            children: [
              {
                tagName: "section",
                headings: ["h4"], // Invalid skip H1 -> H4 through wrapper
                children: [],
              },
            ],
          },
        ],
      };

      expect(checkHeadingOrder(tree)).toBe(false);
    });
  });

  // ==========================================
  // 4. PARSING & HEADING FORMAT EDGE CASES
  // ==========================================
  describe("heading tag string parsing edge cases", () => {
    it("handles uppercase heading tags (e.g., 'H1', 'H2')", () => {
      const tree = {
        tagName: "main",
        headings: ["H1"],
        children: [
          {
            tagName: "section",
            headings: ["H2"],
            children: [],
          },
        ],
      };

      expect(checkHeadingOrder(tree)).toBe(true);
    });

    it("correctly parses heading tag when strings contain extra digits or words", () => {
      const tree = {
        tagName: "main",
        headings: ["h1-main-2026"], // Should parse level 1, not 2026
        children: [
          {
            tagName: "section",
            headings: ["h2-section"],
            children: [],
          },
        ],
      };

      expect(checkHeadingOrder(tree)).toBe(true);
    });

    it("returns false if heading level is out of bounds (e.g., H7)", () => {
      const tree = {
        tagName: "main",
        headings: ["h1"],
        children: [
          {
            tagName: "section",
            headings: ["h7"], // HTML only defines H1-H6
            children: [],
          },
        ],
      };

      expect(checkHeadingOrder(tree)).toBe(false);
    });
  });

  // ==========================================
  // 5. EMPTY AND BOUNDARY INPUTS
  // ==========================================
  describe("empty and boundary inputs", () => {
    it("returns true for a single root node with no children", () => {
      const tree = {
        tagName: "main",
        headings: ["h1"],
        children: [],
      };

      expect(checkHeadingOrder(tree)).toBe(true);
    });

    it("returns true for null/undefined region gracefully", () => {
      // @ts-expect-error Testing runtime untyped JS caller
      expect(checkHeadingOrder(null)).toBe(true);
      // @ts-expect-error Testing runtime untyped JS caller
      expect(checkHeadingOrder(undefined)).toBe(true);
    });
  });

  describe("out-of-bounds & out-of-order heading levels", () => {
    // ==========================================
    // 1. OUT-OF-BOUNDS TAGS (H0, H7+)
    // ==========================================
    describe("out-of-bounds tags (below H1 or above H6)", () => {
      it("rejects headings higher than H6 (e.g., H7)", () => {
        const tree = {
          tagName: "main",
          headings: ["h1"],
          children: [
            {
              tagName: "section",
              headings: ["h7"],
              children: [],
            },
          ],
        };

        expect(checkHeadingOrder(tree)).toBe(false);
      });

      it("rejects headings lower than H1 (e.g., H0)", () => {
        const tree = {
          tagName: "main",
          headings: ["h0"],
          children: [],
        };

        expect(checkHeadingOrder(tree)).toBe(false);
      });

      it("rejects multi-digit out-of-bounds levels (e.g., H12 or H99)", () => {
        const tree = {
          tagName: "div",
          headings: ["h1"],
          children: [
            {
              tagName: "article",
              headings: ["h12"],
              children: [],
            },
          ],
        };

        expect(checkHeadingOrder(tree)).toBe(false);
      });

      it("rejects out-of-bounds levels with attached string metadata (e.g., 'h7-section')", () => {
        const tree = {
          tagName: "section",
          headings: ["h7-section-title"],
          children: [],
        };

        expect(checkHeadingOrder(tree)).toBe(false);
      });
    });

    // ==========================================
    // 2. OUT-OF-ORDER HIERARCHY SKIPS
    // ==========================================
    describe("out-of-order sequence progression", () => {
      it("rejects skipping 1 level forward (e.g., H1 directly to H3)", () => {
        const tree = {
          tagName: "main",
          headings: ["h1"],
          children: [
            {
              tagName: "section",
              headings: ["h3"], // Skipped H2
              children: [],
            },
          ],
        };

        expect(checkHeadingOrder(tree)).toBe(false);
      });

      it("rejects multi-level forward jumps (e.g., H2 directly to H6)", () => {
        const tree = {
          tagName: "main",
          headings: ["h1"],
          children: [
            {
              tagName: "section",
              headings: ["h2"],
              children: [
                {
                  tagName: "article",
                  headings: ["h6"], // Skipped H3, H4, H5
                  children: [],
                },
              ],
            },
          ],
        };

        expect(checkHeadingOrder(tree)).toBe(false);
      });
    });
  });
});
