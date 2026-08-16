import { describe, expect, it } from "vitest";
import type { RegionMapping } from "../types";
import { resolveHeadingDetail } from "./resolve-heading-details";

describe("resolveHeadingDetail", () => {
  // ==========================================
  // 1. RICH DETAILED HEADINGS RESOLUTION
  // ==========================================
  describe("detailedHeadings resolution", () => {
    it("resolves full detailedHeading object with string level, text, and DOM element", () => {
      const mockElement = { id: "hero-heading" };
      const node: RegionMapping = {
        tagName: "section",
        detailedHeadings: [
          {
            level: "h2",
            text: "Main Features",
            element: mockElement,
          },
        ],
        headings: ["h2"],
        children: [],
      };

      const result = resolveHeadingDetail(node);

      expect(result).toEqual({
        rawHeading: "h2",
        parsedLevel: 2,
        text: "Main Features",
        element: mockElement,
      });
    });

    it("converts numeric level values to string rawHeading and correctly parses level", () => {
      const node: RegionMapping = {
        tagName: "article",
        detailedHeadings: [{ level: 3, text: "Sub Section" }],
        children: [],
        headings: ["h3"],
      };

      const result = resolveHeadingDetail(node);

      expect(result).toEqual({
        rawHeading: "3",
        parsedLevel: 3,
        text: "Sub Section",
        element: undefined,
      });
    });

    it("handles detailedHeadings where optional text and element are omitted", () => {
      const node: RegionMapping = {
        tagName: "div",
        detailedHeadings: [{ level: "h1" }],
        children: [],
        headings: ["h1"],
      };

      const result = resolveHeadingDetail(node);

      expect(result).toEqual({
        rawHeading: "h1",
        parsedLevel: 1,
        text: undefined,
        element: undefined,
      });
    });

    it("resolves only the FIRST item when detailedHeadings contains multiple entries", () => {
      const node: RegionMapping = {
        tagName: "main",
        detailedHeadings: [
          { level: "h1", text: "Primary Heading" },
          { level: "h2", text: "Secondary Heading" },
        ],
        children: [],
        headings: ["h1", "h2"],
      };

      const result = resolveHeadingDetail(node);

      expect(result?.rawHeading).toBe("h1");
      expect(result?.text).toBe("Primary Heading");
    });
  });

  // ==========================================
  // 2. PRECEDENCE RULES
  // ==========================================
  describe("precedence rules", () => {
    it("prioritizes detailedHeadings over legacy headings when both exist", () => {
      const node: RegionMapping = {
        tagName: "header",
        headings: ["h3"],
        detailedHeadings: [{ level: "h1", text: "Priority Heading" }],
        children: [],
      };

      const result = resolveHeadingDetail(node);

      expect(result).toEqual({
        rawHeading: "h1",
        parsedLevel: 1,
        text: "Priority Heading",
        element: undefined,
      });
    });
  });

  // ==========================================
  // 3. LEGACY HEADINGS FALLBACK
  // ==========================================
  describe("legacy headings fallback", () => {
    it("falls back to legacy headings array when detailedHeadings is omitted", () => {
      const node: RegionMapping = {
        tagName: "section",
        headings: ["h2"],
        children: [],
      };

      const result = resolveHeadingDetail(node);

      expect(result).toEqual({
        rawHeading: "h2",
        parsedLevel: 2,
      });
      expect(result?.text).toBeUndefined();
      expect(result?.element).toBeUndefined();
    });

    it("falls back to legacy headings when detailedHeadings is an empty array", () => {
      const node: RegionMapping = {
        tagName: "section",
        detailedHeadings: [],
        headings: ["h4"],
        children: [],
      };

      const result = resolveHeadingDetail(node);

      expect(result).toEqual({
        rawHeading: "h4",
        parsedLevel: 4,
      });
    });

    it("resolves only the FIRST item when legacy headings contains multiple entries", () => {
      const node: RegionMapping = {
        tagName: "div",
        headings: ["h2", "h3", "h4"],
        children: [],
      };

      const result = resolveHeadingDetail(node);

      expect(result?.rawHeading).toBe("h2");
      expect(result?.parsedLevel).toBe(2);
    });
  });

  // ==========================================
  // 4. EMPTY / MISSING HEADINGS
  // ==========================================
  describe("empty and missing headings", () => {
    it("returns null when neither detailedHeadings nor headings are defined", () => {
      const node: RegionMapping = {
        tagName: "div",
        children: [],
        headings: [],
      };

      expect(resolveHeadingDetail(node)).toBeNull();
    });

    it("returns null when both detailedHeadings and headings are empty arrays", () => {
      const node: RegionMapping = {
        tagName: "div",
        detailedHeadings: [],
        headings: [],
        children: [],
      };

      expect(resolveHeadingDetail(node)).toBeNull();
    });
  });

  // ==========================================
  // 5. UNPARSEABLE AND OUT-OF-BOUNDS LEVELS
  // ==========================================
  describe("unparseable and out-of-bounds levels", () => {
    it("preserves rawHeading and sets parsedLevel to null when level is unparseable", () => {
      const node: RegionMapping = {
        tagName: "section",
        detailedHeadings: [{ level: "invalid-tag", text: "Broken Title" }],
        children: [],
        headings: ["invalid-tag"],
      };

      const result = resolveHeadingDetail(node);

      expect(result).toEqual({
        rawHeading: "invalid-tag",
        parsedLevel: null,
        text: "Broken Title",
        element: undefined,
      });
    });

    it("correctly resolves out-of-bounds levels (e.g. h7)", () => {
      const node: RegionMapping = {
        tagName: "div",
        detailedHeadings: [{ level: "h7", text: "Too Deep" }],
        children: [],
        headings: ["h7"],
      };

      const result = resolveHeadingDetail(node);

      expect(result).toEqual({
        rawHeading: "h7",
        parsedLevel: 7,
        text: "Too Deep",
        element: undefined,
      });
    });
  });
});
