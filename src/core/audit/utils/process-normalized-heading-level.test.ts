import { describe, expect, it } from "vitest";
import { HeadingDetail, RegionMapping } from "../modules/region/types";
import type { HeadingOrderError, ProcessHeadingLevelParams } from "../types";
import { processNormalizedHeadingLevel } from "./process-normalized-heading-level";

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

function createParams(
  detailedHeadings: HeadingDetail[] = [],
  overrides: Partial<ProcessHeadingLevelParams> = {},
): ProcessHeadingLevelParams {
  return {
    level: 1,
    region: createRegion(detailedHeadings),
    path: "main[0]",
    errors: [],
    ...overrides,
  };
}

describe("processNormalizedHeadingLevel", () => {
  describe("empty regions", () => {
    it("returns the initial level when the region contains no headings", () => {
      const params = createParams();

      const result = processNormalizedHeadingLevel(params);

      expect(result).toBe(1);
      expect(params.errors).toEqual([]);
    });

    it("preserves a custom initial level when the region contains no headings", () => {
      const params = createParams([], {
        level: 4,
      });

      const result = processNormalizedHeadingLevel(params);

      expect(result).toBe(4);
      expect(params.errors).toEqual([]);
    });

    it("does not inspect the legacy headings collection", () => {
      const params = createParams([], {
        region: createRegion([], {
          headings: ["h1", "h4"],
        }),
      });

      const result = processNormalizedHeadingLevel(params);

      expect(result).toBe(1);
      expect(params.errors).toEqual([]);
    });
  });

  describe("valid hierarchy", () => {
    it("accepts a single heading one level above the context", () => {
      const params = createParams([createHeading(2)]);

      const result = processNormalizedHeadingLevel(params);

      expect(result).toBe(2);
      expect(params.errors).toEqual([]);
    });

    it("accepts sequential heading levels", () => {
      const params = createParams([
        createHeading(1),
        createHeading(2),
        createHeading(3),
        createHeading(4),
      ]);

      const result = processNormalizedHeadingLevel(params);

      expect(result).toBe(4);
      expect(params.errors).toEqual([]);
    });

    it("accepts headings that remain at the same level", () => {
      const params = createParams([
        createHeading(2),
        createHeading(2),
        createHeading(2),
      ]);

      const result = processNormalizedHeadingLevel(params);

      expect(result).toBe(2);
      expect(params.errors).toEqual([]);
    });

    it("accepts descending heading levels", () => {
      const params = createParams([
        createHeading(1),
        createHeading(2),
        createHeading(3),
        createHeading(2),
        createHeading(1),
      ]);

      const result = processNormalizedHeadingLevel(params);

      expect(result).toBe(1);
      expect(params.errors).toEqual([]);
    });

    it("accepts a heading level increase of exactly one", () => {
      const params = createParams([createHeading(4), createHeading(5)], {
        level: 3,
      });

      const result = processNormalizedHeadingLevel(params);

      expect(result).toBe(5);
      expect(params.errors).toEqual([]);
    });

    it("allows a heading to return to a previously used level", () => {
      const params = createParams([
        createHeading(1),
        createHeading(2),
        createHeading(3),
        createHeading(2),
        createHeading(3),
      ]);

      const result = processNormalizedHeadingLevel(params);

      expect(result).toBe(3);
      expect(params.errors).toEqual([]);
    });
  });

  describe("skipped heading levels", () => {
    it("reports H1 to H3 as a skipped level", () => {
      const params = createParams([createHeading(1), createHeading(3)]);

      const result = processNormalizedHeadingLevel(params);

      expect(result).toBe(3);
      expect(params.errors).toHaveLength(1);

      expect(params.errors[0]).toMatchObject({
        actualLevel: 3,
        expectedMaxLevel: 2,
      });
    });

    it("reports H2 to H4 as a skipped level", () => {
      const params = createParams([createHeading(2), createHeading(4)]);

      const result = processNormalizedHeadingLevel(params);

      expect(result).toBe(4);
      expect(params.errors).toHaveLength(1);

      expect(params.errors[0]).toMatchObject({
        actualLevel: 4,
        expectedMaxLevel: 3,
      });
    });

    it("reports H1 to H6 as a skipped level", () => {
      const params = createParams([createHeading(1), createHeading(6)]);

      processNormalizedHeadingLevel(params);

      expect(params.errors).toHaveLength(1);

      expect(params.errors[0]).toMatchObject({
        actualLevel: 6,
        expectedMaxLevel: 2,
      });
    });

    it("reports multiple independent skipped levels", () => {
      const params = createParams([
        createHeading(1),
        createHeading(3),
        createHeading(5),
      ]);

      const result = processNormalizedHeadingLevel(params);

      expect(result).toBe(5);
      expect(params.errors).toHaveLength(2);

      expect(params.errors[0]).toMatchObject({
        actualLevel: 3,
        expectedMaxLevel: 2,
      });

      expect(params.errors[1]).toMatchObject({
        actualLevel: 5,
        expectedMaxLevel: 4,
      });
    });

    it("continues processing after reporting a skipped level", () => {
      const params = createParams([
        createHeading(1),
        createHeading(4),
        createHeading(5),
      ]);

      const result = processNormalizedHeadingLevel(params);

      expect(result).toBe(5);
      expect(params.errors).toHaveLength(1);

      expect(params.errors[0].actualLevel).toBe(4);
    });

    it("uses the skipped heading as the new running context", () => {
      const params = createParams([
        createHeading(1),
        createHeading(4),
        createHeading(6),
      ]);

      const result = processNormalizedHeadingLevel(params);

      expect(result).toBe(6);
      expect(params.errors).toHaveLength(2);

      expect(params.errors[0]).toMatchObject({
        actualLevel: 4,
        expectedMaxLevel: 2,
      });

      expect(params.errors[1]).toMatchObject({
        actualLevel: 6,
        expectedMaxLevel: 5,
      });
    });
  });

  describe("initial hierarchy context", () => {
    it("uses the supplied level as the initial context", () => {
      const params = createParams([createHeading(4)], {
        level: 3,
      });

      const result = processNormalizedHeadingLevel(params);

      expect(result).toBe(4);
      expect(params.errors).toEqual([]);
    });

    it("reports a violation relative to the supplied level", () => {
      const params = createParams([createHeading(5)], {
        level: 2,
      });

      const result = processNormalizedHeadingLevel(params);

      expect(result).toBe(5);
      expect(params.errors).toHaveLength(1);

      expect(params.errors[0]).toMatchObject({
        actualLevel: 5,
        expectedMaxLevel: 3,
      });
    });

    it("allows a heading to descend below the supplied context", () => {
      const params = createParams([createHeading(2)], {
        level: 5,
      });

      const result = processNormalizedHeadingLevel(params);

      expect(result).toBe(2);
      expect(params.errors).toEqual([]);
    });

    it("preserves the supplied context until the first heading is processed", () => {
      const params = createParams([createHeading(6)], {
        level: 5,
      });

      processNormalizedHeadingLevel(params);

      expect(params.errors).toEqual([]);
    });
  });

  describe("levels greater than H6", () => {
    it("accepts H7 when the current context is H6", () => {
      const params = createParams([createHeading(6), createHeading(7)], {
        level: 6,
      });

      const result = processNormalizedHeadingLevel(params);

      expect(result).toBe(7);
      expect(params.errors).toEqual([]);
    });

    it("reports H8 after H6 as a skipped level", () => {
      const params = createParams([createHeading(6), createHeading(8)], {
        level: 6,
      });

      const result = processNormalizedHeadingLevel(params);

      expect(result).toBe(8);
      expect(params.errors).toHaveLength(1);

      expect(params.errors[0]).toMatchObject({
        actualLevel: 8,
        expectedMaxLevel: 7,
      });
    });

    it("reports H10 after H7 as a skipped level", () => {
      const params = createParams([createHeading(7), createHeading(10)], {
        level: 7,
      });

      const result = processNormalizedHeadingLevel(params);

      expect(result).toBe(10);
      expect(params.errors).toHaveLength(1);

      expect(params.errors[0]).toMatchObject({
        actualLevel: 10,
        expectedMaxLevel: 8,
      });
    });

    it("allows arbitrarily high levels when they progress sequentially", () => {
      const params = createParams(
        [
          createHeading(7),
          createHeading(8),
          createHeading(9),
          createHeading(10),
          createHeading(11),
        ],
        { level: 7 },
      );

      const result = processNormalizedHeadingLevel(params);

      expect(result).toBe(11);
      expect(params.errors).toEqual([]);
    });

    it("does not clamp normalized levels to H6", () => {
      const params = createParams([createHeading(6), createHeading(7)], {
        level: 6,
      });

      processNormalizedHeadingLevel(params);

      expect(params.errors).toEqual([]);
    });
  });

  describe("numeric normalization semantics", () => {
    it("uses numLevel as the authoritative heading level", () => {
      const params = createParams([
        createHeading(3, {
          level: "h1",
        }),
      ]);

      const result = processNormalizedHeadingLevel(params);

      expect(result).toBe(3);
      expect(params.errors).toMatchObject([
        {
          actualLevel: 3,
          expectedMaxLevel: 2,
          heading: "h1",
        },
      ]);
    });

    it("does not parse the level string to determine hierarchy", () => {
      const params = createParams([
        createHeading(2, {
          level: "not-a-heading-level",
        }),
      ]);

      const result = processNormalizedHeadingLevel(params);

      expect(result).toBe(2);
      expect(params.errors).toEqual([]);
    });

    it("uses numLevel even when the level string contains a different numeric level", () => {
      const params = createParams([
        createHeading(4, {
          level: "h2",
        }),
      ]);

      const result = processNormalizedHeadingLevel(params);

      expect(result).toBe(4);
      expect(params.errors).toHaveLength(1);

      expect(params.errors[0]).toMatchObject({
        heading: "h2",
        actualLevel: 4,
      });
    });
  });

  describe("heading text", () => {
    it("includes heading text in the violation message", () => {
      const params = createParams([
        createHeading(1, {
          text: "Page title",
        }),
        createHeading(4, {
          text: "Important section",
        }),
      ]);

      processNormalizedHeadingLevel(params);

      expect(params.errors[0].message).toContain('("Important section")');
    });

    it("does not append a text label when heading text is empty", () => {
      const params = createParams([createHeading(1), createHeading(4)]);

      processNormalizedHeadingLevel(params);

      expect(params.errors[0].message).toBe(
        "Heading level skipped at main[0] [heading 2]: " +
          "context level is H1, " +
          "expected maximum H2, " +
          "but found H4.",
      );
    });

    it("preserves heading text in the error metadata", () => {
      const params = createParams([
        createHeading(1),
        createHeading(4, {
          text: "Section heading",
        }),
      ]);

      processNormalizedHeadingLevel(params);

      expect(params.errors[0].text).toBe("Section heading");
    });
  });

  describe("error paths", () => {
    it("uses the region path directly when there is one heading", () => {
      const params = createParams([createHeading(4)], {
        path: "main[0] > section[0]",
      });

      processNormalizedHeadingLevel(params);

      expect(params.errors[0].path).toBe("main[0] > section[0]");
    });

    it("adds a heading index when there are multiple headings", () => {
      const params = createParams([createHeading(1), createHeading(4)], {
        path: "main[0] > section[0]",
      });

      processNormalizedHeadingLevel(params);

      expect(params.errors[0].path).toBe("main[0] > section[0] [heading 2]");
    });

    it("uses the correct index for later headings", () => {
      const params = createParams([
        createHeading(1),
        createHeading(2),
        createHeading(5),
      ]);

      processNormalizedHeadingLevel(params);

      expect(params.errors[0].path).toBe("main[0] [heading 3]");
    });

    it("uses the supplied region tag name in errors", () => {
      const params = createParams([createHeading(1), createHeading(4)], {
        region: createRegion([createHeading(1), createHeading(4)], {
          tagName: "section",
        }),
      });

      processNormalizedHeadingLevel(params);

      expect(params.errors[0].tagName).toBe("section");
    });
  });

  describe("error metadata", () => {
    it("preserves the normalized heading level as actualLevel", () => {
      const params = createParams([createHeading(1), createHeading(5)]);

      processNormalizedHeadingLevel(params);

      expect(params.errors[0].actualLevel).toBe(5);
    });

    it("reports the maximum permitted next level", () => {
      const params = createParams([createHeading(2), createHeading(6)]);

      processNormalizedHeadingLevel(params);

      expect(params.errors[0].expectedMaxLevel).toBe(3);
    });

    it("preserves the original heading level representation", () => {
      const params = createParams([
        createHeading(1),
        createHeading(4, {
          level: "h4",
        }),
      ]);

      processNormalizedHeadingLevel(params);

      expect(params.errors[0].heading).toBe("h4");
    });

    it("preserves the heading DOM element", () => {
      const element = {} as HTMLElement;

      const params = createParams([
        createHeading(1),
        createHeading(4, {
          element,
        }),
      ]);

      processNormalizedHeadingLevel(params);

      expect(params.errors[0].element).toBe(element);
    });

    it("produces the complete expected error message", () => {
      const params = createParams([
        createHeading(1),
        createHeading(4, {
          text: "Deep section",
        }),
      ]);

      processNormalizedHeadingLevel(params);

      expect(params.errors[0].message).toBe(
        'Heading level skipped at main[0] [heading 2] ("Deep section"): ' +
          "context level is H1, " +
          "expected maximum H2, " +
          "but found H4.",
      );
    });
  });

  describe("error accumulator", () => {
    it("preserves existing errors", () => {
      const existingError: HeadingOrderError = {
        path: "existing",
        tagName: "main",
        heading: "h3",
        text: "",
        element: undefined,
        actualLevel: 3,
        expectedMaxLevel: 2,
        message: "Existing error",
      };

      const errors = [existingError];

      const params = createParams([createHeading(1)], {
        errors,
      });

      const result = processNormalizedHeadingLevel(params);

      expect(result).toBe(1);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toBe(existingError);
    });

    it("appends new errors to the existing accumulator", () => {
      const existingError: HeadingOrderError = {
        path: "existing",
        tagName: "main",
        heading: "h3",
        text: "",
        element: undefined,
        actualLevel: 3,
        expectedMaxLevel: 2,
        message: "Existing error",
      };

      const errors = [existingError];

      const params = createParams([createHeading(1), createHeading(4)], {
        errors,
      });

      processNormalizedHeadingLevel(params);

      expect(errors).toHaveLength(2);
      expect(errors[0]).toBe(existingError);
      expect(errors[1].actualLevel).toBe(4);
    });

    it("accumulates multiple new errors in traversal order", () => {
      const params = createParams([
        createHeading(1),
        createHeading(4),
        createHeading(6),
        createHeading(9),
      ]);

      processNormalizedHeadingLevel(params);

      expect(params.errors).toHaveLength(3);

      expect(params.errors.map((error) => error.actualLevel)).toEqual([
        4, 6, 9,
      ]);

      expect(params.errors.map((error) => error.expectedMaxLevel)).toEqual([
        2, 5, 7,
      ]);
    });
  });

  describe("sparse heading collections", () => {
    it("still detects a skipped level after a missing heading entry", () => {
      const headings: HeadingDetail[] = [];

      headings[0] = createHeading(1);
      headings[2] = createHeading(3);

      const params = createParams(headings);

      const result = processNormalizedHeadingLevel(params);

      expect(result).toBe(3);
      expect(params.errors).toHaveLength(1);

      expect(params.errors[0]).toMatchObject({
        actualLevel: 3,
        expectedMaxLevel: 2,
      });
    });

    it("continues processing after a missing heading entry", () => {
      const headings: HeadingDetail[] = [];

      headings[0] = createHeading(1);
      headings[2] = createHeading(4);

      const params = createParams(headings);

      const result = processNormalizedHeadingLevel(params);

      expect(result).toBe(4);
      expect(params.errors).toHaveLength(1);

      expect(params.errors[0]).toMatchObject({
        actualLevel: 4,
        expectedMaxLevel: 2,
      });
    });
  });

  describe("zero and negative normalized levels", () => {
    it("accepts zero as a numeric hierarchy level", () => {
      const params = createParams([createHeading(0), createHeading(1)]);

      const result = processNormalizedHeadingLevel(params);

      expect(result).toBe(1);
      expect(params.errors).toEqual([]);
    });

    it("accepts a negative level as a numeric hierarchy level", () => {
      const params = createParams([createHeading(-2), createHeading(-1)]);

      const result = processNormalizedHeadingLevel(params);

      expect(result).toBe(-1);
      expect(params.errors).toEqual([]);
    });

    it("reports a jump from a negative level when it exceeds one", () => {
      const params = createParams([createHeading(-3), createHeading(-1)]);

      const result = processNormalizedHeadingLevel(params);

      expect(result).toBe(-1);
      expect(params.errors).toHaveLength(1);

      expect(params.errors[0]).toMatchObject({
        actualLevel: -1,
        expectedMaxLevel: -2,
      });
    });
  });

  describe("fractional normalized levels", () => {
    it("allows a fractional increase of exactly one", () => {
      const params = createParams([createHeading(1.5), createHeading(2.5)]);

      const result = processNormalizedHeadingLevel(params);

      expect(result).toBe(2.5);
      expect(params.errors).toEqual([]);
    });

    it("reports a fractional increase greater than one", () => {
      const params = createParams([createHeading(1.5), createHeading(3)]);

      const result = processNormalizedHeadingLevel(params);

      expect(result).toBe(3);
      expect(params.errors).toHaveLength(1);

      expect(params.errors[0]).toMatchObject({
        actualLevel: 3,
        expectedMaxLevel: 2.5,
      });
    });
  });

  describe("running level semantics", () => {
    it("uses each processed heading as the context for the next heading", () => {
      const params = createParams([
        createHeading(1),
        createHeading(4),
        createHeading(5),
      ]);

      processNormalizedHeadingLevel(params);

      expect(params.errors).toHaveLength(1);

      expect(params.errors[0]).toMatchObject({
        actualLevel: 4,
        expectedMaxLevel: 2,
      });
    });

    it("updates the running level even when a heading produces an error", () => {
      const params = createParams([
        createHeading(1),
        createHeading(5),
        createHeading(6),
      ]);

      const result = processNormalizedHeadingLevel(params);

      expect(result).toBe(6);
      expect(params.errors).toHaveLength(1);

      expect(params.errors[0].actualLevel).toBe(5);
    });

    it("returns the last processed normalized heading level", () => {
      const params = createParams([
        createHeading(1),
        createHeading(3),
        createHeading(2),
        createHeading(7),
      ]);

      const result = processNormalizedHeadingLevel(params);

      expect(result).toBe(7);
    });
  });

  describe("runtime edge cases", () => {
    it("preserves Infinity as a normalized level", () => {
      const params = createParams([createHeading(Infinity)]);

      const result = processNormalizedHeadingLevel(params);

      expect(result).toBe(Infinity);
      expect(params.errors).toHaveLength(1);
      expect(params.errors[0].actualLevel).toBe(Infinity);
    });

    it("does not report NaN as a skipped level", () => {
      const params = createParams([
        createHeading(1),
        createHeading(Number.NaN),
      ]);

      const result = processNormalizedHeadingLevel(params);

      expect(result).toBeNaN();
      expect(params.errors).toEqual([]);
    });
  });
});
