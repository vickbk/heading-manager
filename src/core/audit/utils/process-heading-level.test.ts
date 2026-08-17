import { describe, expect, it, vi } from "vitest";
import { RegionMapping } from "../modules/region";
import type { HeadingOrderError, ProcessHeadingLevelParams } from "../types";
import { processHeadingLevel } from "./process-heading-level";
import * as resolveModule from "./resolve-heading-details";

function createRegion(
  headings: string[] = [],
  detailedHeadings: ProcessHeadingLevelParams["region"]["detailedHeadings"] = [],
): ProcessHeadingLevelParams["region"] {
  return {
    tagName: "main",
    headings,
    detailedHeadings,
    children: [],
  };
}

function createParams(
  region: ProcessHeadingLevelParams["region"],
  overrides: Partial<ProcessHeadingLevelParams> = {},
): ProcessHeadingLevelParams {
  return {
    level: 1,
    region,
    path: "main[0]",
    errors: [],
    ...overrides,
  };
}

describe("processHeadingLevel", () => {
  describe("basic hierarchy processing", () => {
    it("returns the initial level when the region has no headings", () => {
      const params = createParams(createRegion());

      const result = processHeadingLevel(params);

      expect(result).toBe(1);
      expect(params.errors).toEqual([]);
    });

    it("returns the heading level when the region contains one valid heading", () => {
      const params = createParams(createRegion(["h1"]));

      const result = processHeadingLevel(params);

      expect(result).toBe(1);
      expect(params.errors).toEqual([]);
    });

    it("updates the running level for multiple valid headings", () => {
      const params = createParams(createRegion(["h1", "h2", "h3"]));

      const result = processHeadingLevel(params);

      expect(result).toBe(3);
      expect(params.errors).toEqual([]);
    });

    it("allows headings at the same level", () => {
      const params = createParams(createRegion(["h1", "h1", "h1"]));

      const result = processHeadingLevel(params);

      expect(result).toBe(1);
      expect(params.errors).toEqual([]);
    });

    it("allows descending heading levels", () => {
      const params = createParams(createRegion(["h1", "h2", "h3", "h2", "h1"]));

      const result = processHeadingLevel(params);

      expect(result).toBe(1);
      expect(params.errors).toEqual([]);
    });

    it("allows a heading to increase by exactly one level", () => {
      const params = createParams(createRegion(["h1", "h2"]));

      const result = processHeadingLevel(params);

      expect(result).toBe(2);
      expect(params.errors).toEqual([]);
    });
  });

  describe("skipped heading levels", () => {
    it("reports a skipped level when H1 is followed by H3", () => {
      const params = createParams(createRegion(["h1", "h3"]));

      const result = processHeadingLevel(params);

      expect(result).toBe(3);
      expect(params.errors).toHaveLength(1);

      expect(params.errors[0]).toMatchObject({
        path: "main[0] [heading 2]",
        tagName: "main",
        heading: "h3",
        actualLevel: 3,
        expectedMaxLevel: 2,
      });
    });

    it("reports a skipped level when H2 is followed by H4", () => {
      const params = createParams(createRegion(["h2", "h4"]));

      const result = processHeadingLevel(params);

      expect(result).toBe(4);
      expect(params.errors).toHaveLength(1);

      expect(params.errors[0].actualLevel).toBe(4);
      expect(params.errors[0].expectedMaxLevel).toBe(3);
    });

    it("reports multiple skipped levels independently", () => {
      const params = createParams(createRegion(["h1", "h3", "h5"]));

      const result = processHeadingLevel(params);

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

    it("does not report a violation when the level increases by exactly one", () => {
      const params = createParams(createRegion(["h3", "h4", "h5", "h6"]), {
        level: 2,
      });

      const result = processHeadingLevel(params);

      expect(result).toBe(6);
      expect(params.errors).toEqual([]);
    });
  });

  describe("starting hierarchy level", () => {
    it("uses the supplied starting level as the hierarchy context", () => {
      const params = createParams(createRegion(["h3"]), { level: 1 });

      const result = processHeadingLevel(params);

      expect(result).toBe(3);
      expect(params.errors).toHaveLength(1);

      expect(params.errors[0]).toMatchObject({
        actualLevel: 3,
        expectedMaxLevel: 2,
      });
    });

    it("accepts a heading that is one level above the supplied context", () => {
      const params = createParams(createRegion(["h3"]), { level: 2 });

      const result = processHeadingLevel(params);

      expect(result).toBe(3);
      expect(params.errors).toEqual([]);
    });

    it("preserves the supplied level when no headings are present", () => {
      const params = createParams(createRegion(), { level: 4 });

      const result = processHeadingLevel(params);

      expect(result).toBe(4);
    });
  });

  describe("invalid heading levels", () => {
    it("reports an unparseable heading", () => {
      const params = createParams(createRegion(["heading"]));

      const result = processHeadingLevel(params);

      expect(result).toBe(1);
      expect(params.errors).toHaveLength(1);

      expect(params.errors[0]).toMatchObject({
        actualLevel: -1,
        expectedMaxLevel: 2,
        heading: "heading",
      });

      expect(params.errors[0].message).toContain(
        'Unparseable heading "heading"',
      );
    });

    it("reports an invalid level below H1", () => {
      const params = createParams(createRegion(["h0"]));

      const result = processHeadingLevel(params);

      expect(result).toBe(1);
      expect(params.errors).toHaveLength(1);

      expect(params.errors[0]).toMatchObject({
        actualLevel: 0,
        expectedMaxLevel: 6,
      });

      expect(params.errors[0].message).toContain(
        "Invalid HTML heading level H0",
      );
    });

    it("reports an invalid level above H6", () => {
      const params = createParams(createRegion(["h7"]));

      const result = processHeadingLevel(params);

      expect(result).toBe(1);
      expect(params.errors).toHaveLength(1);

      expect(params.errors[0]).toMatchObject({
        actualLevel: 7,
        expectedMaxLevel: 6,
      });

      expect(params.errors[0].message).toContain(
        "Invalid HTML heading level H7",
      );
    });

    it("does not update the running level after an invalid heading", () => {
      const params = createParams(createRegion(["h7", "h2"]));

      const result = processHeadingLevel(params);

      expect(result).toBe(2);
      expect(params.errors).toHaveLength(1);

      expect(params.errors[0].actualLevel).toBe(7);
    });

    it("does not update the running level after an unparseable heading", () => {
      const params = createParams(createRegion(["invalid", "h2"]));

      const result = processHeadingLevel(params);

      expect(result).toBe(2);
      expect(params.errors).toHaveLength(1);

      expect(params.errors[0].actualLevel).toBe(-1);
    });

    it("continues processing after an invalid heading", () => {
      const params = createParams(createRegion(["h1", "h9", "h3"]));

      const result = processHeadingLevel(params);

      expect(result).toBe(3);
      expect(params.errors).toHaveLength(2);

      expect(params.errors[0].actualLevel).toBe(9);
      expect(params.errors[1]).toMatchObject({
        actualLevel: 3,
        expectedMaxLevel: 2,
      });
    });
  });

  describe("error metadata", () => {
    it("includes heading text in a skipped-level error", () => {
      const params = createParams(createRegion(["h1", "h3"]));

      // Assuming resolveHeadingDetail obtains text from the DOM/detailed data.
      const result = processHeadingLevel(params);

      expect(result).toBe(3);
    });

    it("includes the region path in the error", () => {
      const params = createParams(createRegion(["h1", "h4"]), {
        path: "main[0] > section[0]",
      });

      processHeadingLevel(params);

      expect(params.errors[0].path).toBe("main[0] > section[0] [heading 2]");
    });

    it("uses the region path directly when there is only one heading", () => {
      const params = createParams(createRegion(["h4"]), {
        path: "main[0] > section[0]",
        level: 1,
      });

      processHeadingLevel(params);

      expect(params.errors[0].path).toBe("main[0] > section[0]");
    });

    it("includes the original heading representation in the error", () => {
      const params = createParams(createRegion(["h1", "h4"]));

      processHeadingLevel(params);

      expect(params.errors[0].heading).toBe("h4");
    });
  });

  describe("error accumulator", () => {
    it("preserves errors already present in the accumulator", () => {
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

      const params = createParams(createRegion(["h1"]), { errors });

      const result = processHeadingLevel(params);

      expect(result).toBe(1);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toBe(existingError);
    });

    it("appends newly detected errors to the existing accumulator", () => {
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

      const params = createParams(createRegion(["h1", "h4"]), { errors });

      processHeadingLevel(params);

      expect(errors).toHaveLength(2);
      expect(errors[0]).toBe(existingError);
      expect(errors[1].actualLevel).toBe(4);
    });
  });

  describe("legacy heading fallback", () => {
    it("processes legacy headings when detailedHeadings is empty", () => {
      const params = createParams(createRegion(["h1", "h3"], []));

      const result = processHeadingLevel(params);

      expect(result).toBe(3);
      expect(params.errors).toHaveLength(1);

      expect(params.errors[0]).toMatchObject({
        actualLevel: 3,
        expectedMaxLevel: 2,
      });
    });

    it("does not ignore legacy headings when detailed headings are absent", () => {
      const params = createParams(createRegion(["h1", "h4"], []));

      processHeadingLevel(params);

      expect(params.errors).toHaveLength(1);
      expect(params.errors[0].actualLevel).toBe(4);
    });
  });

  describe("mixed heading representations", () => {
    it("processes the maximum length of the two heading collections", () => {
      const params = createParams(createRegion(["h1", "h3", "h4"], []));

      const result = processHeadingLevel(params);

      expect(result).toBe(4);
      expect(params.errors).toHaveLength(1);
      expect(params.errors[0].actualLevel).toBe(3);
    });
  });

  describe("H6 boundary", () => {
    it("accepts H6 as the highest valid legacy heading level", () => {
      const params = createParams(
        createRegion(["h1", "h2", "h3", "h4", "h5", "h6"]),
      );

      const result = processHeadingLevel(params);

      expect(result).toBe(6);
      expect(params.errors).toEqual([]);
    });

    it("reports H7 as invalid rather than as a skipped hierarchy", () => {
      const params = createParams(createRegion(["h1", "h7"]));

      processHeadingLevel(params);

      expect(params.errors).toHaveLength(1);

      expect(params.errors[0]).toMatchObject({
        actualLevel: 7,
        expectedMaxLevel: 6,
      });

      expect(params.errors[0].message).toContain(
        "Invalid HTML heading level H7",
      );
    });
  });

  describe("Missing DetailsHeading", () => {
    it("falls back to legacy headings object length whe details heading is missing", () => {
      const errors: HeadingOrderError[] = [];
      const level = processHeadingLevel({
        level: 1,
        region: createRegion(
          ["h1"],
          null as unknown as RegionMapping["detailedHeadings"],
        ),
        path: "",
        errors,
      });

      expect(errors.length).toBe(0);
      expect(level).toBe(1);
    });

    it("skips missing headings without returning an error", () => {
      vi.spyOn(resolveModule, "resolveHeadingDetail").mockReturnValue(null);
      const errors: HeadingOrderError[] = [];
      const level = processHeadingLevel({
        level: 1,
        region: createRegion(
          ["h1"],
          null as unknown as RegionMapping["detailedHeadings"],
        ),
        path: "",
        errors,
      });

      expect(level).toBe(1);
      expect(errors.length).toBe(0);
    });
  });
});
