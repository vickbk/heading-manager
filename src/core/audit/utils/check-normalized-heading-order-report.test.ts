import { describe, expect, it } from "vitest";
import { HeadingDetail, RegionMapping } from "../modules/region/types";
import type { HeadingOrderError } from "../types";
import {
  checkNormalizedHeading,
  checkNormalizedHeadingReport,
} from "./check-normalized-heading-report";

function createHeading(
  numLevel: number,
  overrides: Partial<HeadingDetail> = {},
): HeadingDetail {
  return {
    level: `h${numLevel}`,
    numLevel,
    text: "",
    element: undefined as unknown as HTMLElement,
    ...overrides,
  };
}

function createRegion(
  detailedHeadings: HeadingDetail[] = [],
  overrides: Partial<RegionMapping> = {},
): RegionMapping {
  return {
    tagName: "main",
    headings: [],
    detailedHeadings,
    children: [],
    ...overrides,
  };
}

describe("checkNormalizedHeadingReport", () => {
  describe("default parameters", () => {
    it("returns a valid report when called without parameters", () => {
      const report = checkNormalizedHeadingReport();

      expect(report).toEqual({
        isValid: true,
        errors: [],
      });
    });

    it("uses H1 as the default hierarchy context", () => {
      const region = createRegion([createHeading(1)]);

      const report = checkNormalizedHeadingReport({
        region,
      });

      expect(report.isValid).toBe(true);
      expect(report.errors).toEqual([]);
    });

    it("uses H1 as the default context when the first heading is H2", () => {
      const region = createRegion([createHeading(2)]);

      const report = checkNormalizedHeadingReport({
        region,
      });

      expect(report.isValid).toBe(true);
      expect(report.errors).toEqual([]);
    });

    it("uses the region tag name to construct the default root path", () => {
      const region = createRegion([createHeading(1), createHeading(3)], {
        tagName: "article",
      });

      const report = checkNormalizedHeadingReport({
        region,
      });

      expect(report.errors[0].path).toBe("article[0] [heading 2]");
    });
  });

  describe("single-region traversal", () => {
    it("returns valid for a region with no headings", () => {
      const region = createRegion();

      const report = checkNormalizedHeadingReport({
        region,
      });

      expect(report.isValid).toBe(true);
      expect(report.errors).toEqual([]);
    });

    it("returns valid for sequential headings", () => {
      const region = createRegion([
        createHeading(1),
        createHeading(2),
        createHeading(3),
        createHeading(4),
      ]);

      const report = checkNormalizedHeadingReport({
        region,
      });

      expect(report.isValid).toBe(true);
      expect(report.errors).toEqual([]);
    });

    it("reports a skipped heading level", () => {
      const region = createRegion([createHeading(1), createHeading(3)]);

      const report = checkNormalizedHeadingReport({
        region,
      });

      expect(report.isValid).toBe(false);
      expect(report.errors).toHaveLength(1);
      expect(report.errors[0]).toMatchObject({
        actualLevel: 3,
        expectedMaxLevel: 2,
      });
    });

    it("reports multiple violations in the same region", () => {
      const region = createRegion([
        createHeading(1),
        createHeading(3),
        createHeading(5),
      ]);

      const report = checkNormalizedHeadingReport({
        region,
      });

      expect(report.isValid).toBe(false);
      expect(report.errors).toHaveLength(2);

      expect(report.errors.map((error) => error.actualLevel)).toEqual([3, 5]);
    });

    it("allows descending heading levels", () => {
      const region = createRegion([
        createHeading(3),
        createHeading(2),
        createHeading(1),
      ]);

      const report = checkNormalizedHeadingReport({
        region,
        level: 3,
      });

      expect(report.isValid).toBe(true);
      expect(report.errors).toEqual([]);
    });

    it("allows repeated heading levels", () => {
      const region = createRegion([
        createHeading(1),
        createHeading(2),
        createHeading(2),
        createHeading(2),
      ]);

      const report = checkNormalizedHeadingReport({
        region,
      });

      expect(report.isValid).toBe(true);
      expect(report.errors).toEqual([]);
    });
  });

  describe("explicit initial level override", () => {
    it("uses the explicitly supplied level instead of the default H1 context", () => {
      const region = createRegion([createHeading(4)]);

      const report = checkNormalizedHeadingReport({
        region,
        level: 3,
      });

      expect(report.isValid).toBe(true);
      expect(report.errors).toEqual([]);
    });

    it("reports a violation relative to an explicitly supplied level", () => {
      const region = createRegion([createHeading(5)]);

      const report = checkNormalizedHeadingReport({
        region,
        level: 2,
      });

      expect(report.isValid).toBe(false);
      expect(report.errors).toHaveLength(1);

      expect(report.errors[0]).toMatchObject({
        actualLevel: 5,
        expectedMaxLevel: 3,
      });
    });

    it("does not accidentally fall back to H1 when level is overridden", () => {
      const region = createRegion([createHeading(4)]);

      const report = checkNormalizedHeadingReport({
        region,
        level: 3,
      });

      expect(report.errors).toEqual([]);
    });

    it("allows a heading below the explicitly supplied context", () => {
      const region = createRegion([createHeading(2)]);

      const report = checkNormalizedHeadingReport({
        region,
        level: 5,
      });

      expect(report.isValid).toBe(true);
      expect(report.errors).toEqual([]);
    });
  });

  describe("nested regions", () => {
    it("passes the parent's final heading level to a child region", () => {
      const child = createRegion([createHeading(3)], {
        tagName: "section",
      });

      const root = createRegion([createHeading(1), createHeading(2)], {
        tagName: "main",
        children: [child],
      });

      const report = checkNormalizedHeadingReport({
        region: root,
      });

      expect(report.isValid).toBe(true);
      expect(report.errors).toEqual([]);
    });

    it("detects a skipped level when the child jumps from the parent's final level", () => {
      const child = createRegion([createHeading(4)], {
        tagName: "section",
      });

      const root = createRegion([createHeading(1), createHeading(2)], {
        tagName: "main",
        children: [child],
      });

      const report = checkNormalizedHeadingReport({
        region: root,
      });

      expect(report.isValid).toBe(false);
      expect(report.errors).toHaveLength(1);

      expect(report.errors[0]).toMatchObject({
        actualLevel: 4,
        expectedMaxLevel: 3,
        path: "main[0] > section[0]",
      });
    });

    it("inherits the parent's final level even when the parent has no heading in the child position", () => {
      const child = createRegion([createHeading(2)], {
        tagName: "section",
      });

      const root = createRegion([createHeading(1)], {
        children: [child],
      });

      const report = checkNormalizedHeadingReport({
        region: root,
      });

      expect(report.isValid).toBe(true);
      expect(report.errors).toEqual([]);
    });

    it("propagates context through multiple levels of nesting", () => {
      const article = createRegion([createHeading(4)], {
        tagName: "article",
      });

      const section = createRegion([createHeading(2)], {
        tagName: "section",
        children: [article],
      });

      const root = createRegion([createHeading(1)], {
        tagName: "main",
        children: [section],
      });

      const report = checkNormalizedHeadingReport({
        region: root,
      });

      expect(report.isValid).toBe(false);
      expect(report.errors).toHaveLength(1);

      expect(report.errors[0]).toMatchObject({
        actualLevel: 4,
        expectedMaxLevel: 3,
        path: "main[0] > section[0] > article[0]",
      });
    });

    it("uses the final heading level of each region before traversing its children", () => {
      const child = createRegion([createHeading(4)], {
        tagName: "section",
      });

      const root = createRegion(
        [createHeading(1), createHeading(2), createHeading(3)],
        {
          children: [child],
        },
      );

      const report = checkNormalizedHeadingReport({
        region: root,
      });

      expect(report.isValid).toBe(true);
      expect(report.errors).toEqual([]);
    });
  });

  describe("sibling region isolation", () => {
    it("does not allow one child region's final level to affect a sibling", () => {
      const firstChild = createRegion([createHeading(4)], {
        tagName: "section",
      });

      const secondChild = createRegion([createHeading(3)], {
        tagName: "section",
      });

      const root = createRegion([createHeading(1), createHeading(2)], {
        children: [firstChild, secondChild],
      });

      const report = checkNormalizedHeadingReport({
        region: root,
      });

      /*
       * Both children inherit H2 from the parent.
       *
       * H2 -> H4 is invalid.
       * H2 -> H3 is valid.
       *
       * If the first child's H4 leaked into the second child,
       * H4 -> H3 would incorrectly be evaluated as the context.
       */
      expect(report.isValid).toBe(false);
      expect(report.errors).toHaveLength(1);

      expect(report.errors[0]).toMatchObject({
        actualLevel: 4,
        expectedMaxLevel: 3,
        path: "main[0] > section[0]",
      });
    });

    it("gives every sibling the same parent context", () => {
      const children = [
        createRegion([createHeading(3)], {
          tagName: "section",
        }),
        createRegion([createHeading(3)], {
          tagName: "section",
        }),
        createRegion([createHeading(3)], {
          tagName: "section",
        }),
      ];

      const root = createRegion([createHeading(2)], {
        children,
      });

      const report = checkNormalizedHeadingReport({
        region: root,
      });

      expect(report.isValid).toBe(true);
      expect(report.errors).toEqual([]);
    });
  });

  describe("nested explicit level override", () => {
    it("uses the overridden level as the context for the root region", () => {
      const child = createRegion([createHeading(5)], {
        tagName: "section",
      });

      const root = createRegion([createHeading(4)], {
        tagName: "main",
        children: [child],
      });

      const report = checkNormalizedHeadingReport({
        region: root,
        level: 3,
      });

      expect(report.isValid).toBe(true);
      expect(report.errors).toEqual([]);
    });

    it("detects a child violation relative to an explicitly overridden root level", () => {
      const child = createRegion([createHeading(5)], {
        tagName: "section",
      });

      const root = createRegion([createHeading(4)], {
        children: [child],
      });

      const report = checkNormalizedHeadingReport({
        region: root,
        level: 2,
      });

      /*
       * Root:
       * H2 -> H4 = violation.
       *
       * Child inherits H4.
       * H4 -> H5 = valid.
       */
      expect(report.errors).toHaveLength(1);

      expect(report.errors[0]).toMatchObject({
        actualLevel: 4,
        expectedMaxLevel: 3,
      });
    });
  });

  describe("paths", () => {
    it("uses a supplied root path", () => {
      const region = createRegion([createHeading(1), createHeading(4)]);

      const report = checkNormalizedHeadingReport({
        region,
        path: "document > main[2]",
      });

      expect(report.errors[0].path).toBe("document > main[2] [heading 2]");
    });

    it("generates child paths using the child index", () => {
      const children = [
        createRegion([createHeading(3)], {
          tagName: "section",
        }),
        createRegion([createHeading(5)], {
          tagName: "article",
        }),
      ];

      const root = createRegion([createHeading(1)], {
        children,
      });

      const report = checkNormalizedHeadingReport({
        region: root,
      });

      expect(report.errors).toHaveLength(2);

      expect(report.errors[0].path).toBe("main[0] > section[0]");
      expect(report.errors[1].path).toBe("main[0] > article[1]");
    });

    it("includes the heading index when a region contains multiple headings", () => {
      const region = createRegion([createHeading(1), createHeading(4)], {
        tagName: "section",
      });

      const report = checkNormalizedHeadingReport({
        region,
      });

      expect(report.errors[0].path).toBe("section[0] [heading 2]");
    });
  });

  describe("normalized levels greater than H6", () => {
    it("accepts H6 to H7", () => {
      const region = createRegion([createHeading(6), createHeading(7)]);

      const report = checkNormalizedHeadingReport({
        region,
        level: 6,
      });

      expect(report.isValid).toBe(true);
      expect(report.errors).toEqual([]);
    });

    it("rejects H6 to H8", () => {
      const region = createRegion([createHeading(6), createHeading(8)]);

      const report = checkNormalizedHeadingReport({
        region,
        level: 6,
      });

      expect(report.isValid).toBe(false);
      expect(report.errors).toHaveLength(1);

      expect(report.errors[0]).toMatchObject({
        actualLevel: 8,
        expectedMaxLevel: 7,
      });
    });

    it("accepts sequential levels above H6 across nested regions", () => {
      const child = createRegion([createHeading(8)], {
        tagName: "section",
      });

      const root = createRegion([createHeading(6), createHeading(7)], {
        children: [child],
      });

      const report = checkNormalizedHeadingReport({
        region: root,
        level: 6,
      });

      expect(report.isValid).toBe(true);
      expect(report.errors).toEqual([]);
    });

    it("reports skipped levels above H6 across nested regions", () => {
      const child = createRegion([createHeading(9)], {
        tagName: "section",
      });

      const root = createRegion([createHeading(6), createHeading(7)], {
        children: [child],
      });

      const report = checkNormalizedHeadingReport({
        region: root,
        level: 6,
      });

      expect(report.isValid).toBe(false);
      expect(report.errors).toHaveLength(1);

      expect(report.errors[0]).toMatchObject({
        actualLevel: 9,
        expectedMaxLevel: 8,
        path: "main[0] > section[0]",
      });
    });
  });

  describe("legacy heading representation", () => {
    it("ignores the legacy headings array", () => {
      const region = createRegion([createHeading(1), createHeading(2)], {
        headings: ["h1", "h6"],
      });

      const report = checkNormalizedHeadingReport({
        region,
      });

      expect(report.isValid).toBe(true);
      expect(report.errors).toEqual([]);
    });

    it("does not infer hierarchy from a legacy heading when detailed headings are empty", () => {
      const region = createRegion([], {
        headings: ["h1", "h4"],
      });

      const report = checkNormalizedHeadingReport({
        region,
      });

      expect(report.isValid).toBe(true);
      expect(report.errors).toEqual([]);
    });

    it("uses numLevel even when the legacy level string disagrees", () => {
      const region = createRegion([
        createHeading(4, {
          level: "h2",
        }),
      ]);

      const report = checkNormalizedHeadingReport({
        region,
        level: 1,
      });

      expect(report.isValid).toBe(false);
      expect(report.errors[0]).toMatchObject({
        actualLevel: 4,
        heading: "h2",
      });
    });
  });

  describe("error accumulator", () => {
    it("uses the supplied error accumulator", () => {
      const errors: HeadingOrderError[] = [];

      const region = createRegion([createHeading(1), createHeading(4)]);

      const report = checkNormalizedHeadingReport({
        region,
        errors,
      });

      expect(report.errors).toBe(errors);
      expect(errors).toHaveLength(1);
    });

    it("preserves existing errors", () => {
      const existingError = {
        path: "existing",
        tagName: "main",
        heading: "h3",
        text: "",
        element: undefined,
        actualLevel: 3,
        expectedMaxLevel: 2,
        message: "Existing error",
      } as HeadingOrderError;

      const errors = [existingError];

      const report = checkNormalizedHeadingReport({
        region: createRegion([createHeading(1)]),
        errors,
      });

      expect(report.errors).toBe(errors);
      expect(report.errors).toHaveLength(1);
      expect(report.errors[0]).toBe(existingError);
      expect(report.isValid).toBe(false);
    });

    it("includes errors from both parent and child regions", () => {
      const child = createRegion([createHeading(6)], {
        tagName: "section",
      });

      const root = createRegion([createHeading(1), createHeading(4)], {
        children: [child],
      });

      const report = checkNormalizedHeadingReport({
        region: root,
      });

      /*
       * Root:
       * H1 -> H4 => error.
       *
       * Child inherits H4:
       * H4 -> H6 => error.
       */
      expect(report.isValid).toBe(false);
      expect(report.errors).toHaveLength(2);

      expect(report.errors.map((error) => error.actualLevel)).toEqual([4, 6]);
    });

    it("returns errors in depth-first traversal order", () => {
      const firstChild = createRegion([createHeading(4)], {
        tagName: "section",
      });

      const secondChild = createRegion([createHeading(5)], {
        tagName: "article",
      });

      const root = createRegion([createHeading(1), createHeading(3)], {
        children: [firstChild, secondChild],
      });

      const report = checkNormalizedHeadingReport({
        region: root,
      });

      expect(report.errors.map((error) => error.path)).toEqual([
        "main[0] [heading 2]",
        "main[0] > article[1]",
      ]);
    });
  });

  describe("deep trees", () => {
    it("correctly propagates the running level through a deep hierarchy", () => {
      const level4 = createRegion([createHeading(4)], {
        tagName: "div",
      });

      const level3 = createRegion([createHeading(3)], {
        tagName: "div",
        children: [level4],
      });

      const level2 = createRegion([createHeading(2)], {
        tagName: "div",
        children: [level3],
      });

      const root = createRegion([createHeading(1)], {
        tagName: "main",
        children: [level2],
      });

      const report = checkNormalizedHeadingReport({
        region: root,
      });

      expect(report.isValid).toBe(true);
      expect(report.errors).toEqual([]);
    });

    it("detects a violation deep in the tree", () => {
      const level4 = createRegion([createHeading(6)], {
        tagName: "article",
      });

      const level3 = createRegion([createHeading(3)], {
        tagName: "section",
        children: [level4],
      });

      const root = createRegion([createHeading(1)], {
        tagName: "main",
        children: [level3],
      });

      const report = checkNormalizedHeadingReport({
        region: root,
        level: 1,
      });

      expect(report.isValid).toBe(false);
      expect(report.errors).toHaveLength(2);

      expect(report.errors[0]).toMatchObject({
        actualLevel: 3,
        expectedMaxLevel: 2,
        path: "main[0] > section[0]",
      });

      expect(report.errors[1]).toMatchObject({
        actualLevel: 6,
        expectedMaxLevel: 4,
        path: "main[0] > section[0] > article[0]",
      });
    });
  });

  describe("empty and unusual regions", () => {
    it("handles an empty tag name", () => {
      const region = createRegion([createHeading(1), createHeading(3)], {
        tagName: "",
      });

      const report = checkNormalizedHeadingReport({
        region,
      });

      expect(report.isValid).toBe(false);
      expect(report.errors[0].path).toBe("[0] [heading 2]");
    });

    it("handles an explicitly supplied empty path", () => {
      const region = createRegion([createHeading(1), createHeading(3)]);

      const report = checkNormalizedHeadingReport({
        region,
        path: "",
      });

      expect(report.errors[0].path).toBe(" [heading 2]");
    });

    it("handles multiple children without headings in intermediate regions", () => {
      const leaf = createRegion([createHeading(3)], {
        tagName: "article",
      });

      const intermediate = createRegion([], {
        tagName: "section",
        children: [leaf],
      });

      const root = createRegion([createHeading(1), createHeading(2)], {
        children: [intermediate],
      });

      const report = checkNormalizedHeadingReport({
        region: root,
      });

      expect(report.isValid).toBe(true);
      expect(report.errors).toEqual([]);
    });
  });

  describe("validity calculation", () => {
    it("returns true when the error accumulator is empty", () => {
      const report = checkNormalizedHeadingReport({
        region: createRegion([createHeading(1), createHeading(2)]),
      });

      expect(report.isValid).toBe(true);
    });

    it("returns false when at least one error exists", () => {
      const report = checkNormalizedHeadingReport({
        region: createRegion([createHeading(1), createHeading(4)]),
      });

      expect(report.isValid).toBe(false);
    });

    it("returns false when only a pre-existing error is supplied", () => {
      const errors = [
        {
          path: "existing",
          tagName: "main",
          heading: "h3",
          text: "",
          element: undefined,
          actualLevel: 3,
          expectedMaxLevel: 2,
          message: "Existing error",
        } as HeadingOrderError,
      ];

      const report = checkNormalizedHeadingReport({
        region: createRegion(),
        errors,
      });

      expect(report.isValid).toBe(false);
    });
  });
});

describe("checkNormalizedHeading", () => {
  it("returns true for a valid normalized heading tree", () => {
    const region = createRegion([
      createHeading(1),
      createHeading(2),
      createHeading(3),
    ]);

    expect(
      checkNormalizedHeading({
        region,
      }),
    ).toBe(true);
  });

  it("returns false for an invalid normalized heading tree", () => {
    const region = createRegion([createHeading(1), createHeading(3)]);

    expect(
      checkNormalizedHeading({
        region,
      }),
    ).toBe(false);
  });

  it("respects an explicitly overridden level", () => {
    const region = createRegion([createHeading(4)]);

    expect(
      checkNormalizedHeading({
        region,
        level: 3,
      }),
    ).toBe(true);

    expect(
      checkNormalizedHeading({
        region,
        level: 2,
      }),
    ).toBe(false);
  });

  it("validates nested regions", () => {
    const child = createRegion([createHeading(5)], {
      tagName: "section",
    });

    const root = createRegion([createHeading(1), createHeading(2)], {
      children: [child],
    });

    expect(
      checkNormalizedHeading({
        region: root,
      }),
    ).toBe(false);
  });

  it("allows normalized levels greater than H6 when sequential", () => {
    const region = createRegion([
      createHeading(6),
      createHeading(7),
      createHeading(8),
    ]);

    expect(
      checkNormalizedHeading({
        region,
        level: 6,
      }),
    ).toBe(true);
  });

  it("rejects skipped normalized levels greater than H6", () => {
    const region = createRegion([createHeading(6), createHeading(8)]);

    expect(
      checkNormalizedHeading({
        region,
      }),
    ).toBe(false);
  });
});
