import { describe, expect, it } from "vitest";
import { RegionMapping } from "../modules/region";
import { HeadingOrderError } from "../types";
import {
  checkHeadingOrder,
  checkHeadingOrderReport,
} from "./check-heading-order-report";

describe("checkHeadingOrderReport", () => {
  // ==========================================
  // 1. RICH DETAILED HEADINGS (TEXT & DOM)
  // ==========================================
  describe("detailedHeadings support", () => {
    it("validates a sequential hierarchy using rich detailedHeadings", () => {
      const tree: RegionMapping = {
        tagName: "main",
        detailedHeadings: [
          { level: "h1", numLevel: 1, text: "Welcome to Dashboard" },
        ],
        headings: ["h1"],
        children: [
          {
            tagName: "section",
            detailedHeadings: [
              { level: "h2", numLevel: 2, text: "Analytics Overview" },
            ],
            children: [],
            headings: ["h2"],
          },
        ],
      };

      const report = checkHeadingOrderReport(tree);

      expect(report.isValid).toBe(true);
      expect(report.errors).toHaveLength(0);
    });

    it("supports numerical level values in detailedHeadings (e.g., level: 2)", () => {
      const tree: RegionMapping = {
        tagName: "main",
        detailedHeadings: [{ level: "h1", numLevel: 1, text: "Main Title" }],
        headings: ["h1"],
        children: [
          {
            tagName: "section",
            detailedHeadings: [
              { level: "h2", numLevel: 2, text: "Sub Section" },
            ],
            children: [],
            headings: ["h2"],
          },
        ],
      };

      const report = checkHeadingOrderReport(tree);
      expect(report.isValid).toBe(true);
    });

    it("attaches inner text and element references to error objects on failure", () => {
      const mockElement = { id: "sec-4" };

      const tree: RegionMapping = {
        tagName: "main",
        detailedHeadings: [{ level: "h1", numLevel: 1, text: "Hero Header" }],
        headings: ["h1"],
        children: [
          {
            tagName: "section",
            detailedHeadings: [
              {
                level: "h4",
                numLevel: 4,
                text: "Enterprise Features",
                element: mockElement,
              },
            ],
            headings: ["h4"],
            children: [],
          },
        ],
      };

      const report = checkHeadingOrderReport(tree);

      expect(report.isValid).toBe(false);
      expect(report.errors).toHaveLength(1);

      const error = report.errors[0];
      expect(error.text).toBe("Enterprise Features");
      expect(error.element).toBe(mockElement);
      expect(error.actualLevel).toBe(4);
      expect(error.expectedMaxLevel).toBe(2);
      expect(error.path).toBe("main[0] > section[0]");
      expect(error.message).toContain('"Enterprise Features"');
    });
  });

  // ==========================================
  // 2. LEGACY HEADINGS FALLBACK
  // ==========================================
  describe("legacy headings array fallback", () => {
    it("falls back to legacy string headings array when detailedHeadings is omitted", () => {
      const tree: RegionMapping = {
        tagName: "main",
        headings: ["h1"],
        detailedHeadings: [],
        children: [
          {
            tagName: "section",
            headings: ["h2"],
            detailedHeadings: [],
            children: [],
          },
        ],
      };

      const report = checkHeadingOrderReport(tree);
      expect(report.isValid).toBe(true);
    });

    it("prioritizes detailedHeadings over legacy headings if both are provided", () => {
      const tree: RegionMapping = {
        tagName: "main",
        headings: ["h3"], // Invalid legacy level if used first
        detailedHeadings: [
          { level: "h1", numLevel: 1, text: "Priority Heading" },
        ],
        children: [],
      };

      const report = checkHeadingOrderReport(tree);
      expect(report.isValid).toBe(true);
      expect(report.errors).toHaveLength(0);
    });
  });

  // ==========================================
  // 3. ERROR MESSAGE FORMATTING
  // ==========================================
  describe("error message formatting", () => {
    it("formats skipped heading error with inner text label", () => {
      const tree: RegionMapping = {
        tagName: "main",
        detailedHeadings: [{ level: "h1", numLevel: 1, text: "Page Title" }],
        headings: ["h1"],
        children: [
          {
            tagName: "section",
            detailedHeadings: [
              { level: "h3", numLevel: 3, text: "Skipped Section" },
            ],
            children: [],
            headings: ["h3"],
          },
        ],
      };

      const report = checkHeadingOrderReport(tree);

      expect(report.errors[0].message).toBe(
        'Heading level skipped at main[0] > section[0] ("Skipped Section"): context level is H1, expected maximum H2, but found H3.',
      );
    });

    it("formats skipped heading error without text label when text is missing", () => {
      const tree: RegionMapping = {
        tagName: "main",
        headings: ["h1"],
        detailedHeadings: [],
        children: [
          {
            tagName: "section",
            headings: ["h3"],
            detailedHeadings: [],
            children: [],
          },
        ],
      };

      const report = checkHeadingOrderReport(tree);

      expect(report.errors[0].message).toBe(
        "Heading level skipped at main[0] > section[0]: context level is H1, expected maximum H2, but found H3.",
      );
    });

    it("formats out-of-bounds error for H7+ with heading text", () => {
      const tree: RegionMapping = {
        tagName: "main",
        detailedHeadings: [
          { level: "h7", numLevel: 7, text: "Too Deep Title" },
        ],
        children: [],
        headings: ["h7"],
      };

      const report = checkHeadingOrderReport(tree);

      expect(report.errors[0]).toEqual({
        path: "main[0]",
        tagName: "main",
        heading: "h7",
        text: "Too Deep Title",
        element: undefined,
        actualLevel: 7,
        expectedMaxLevel: 6,
        message:
          'Invalid HTML heading level H7 ("Too Deep Title") at main[0]. Heading level must be between H1 and H6.',
      });
    });

    it("formats unparseable heading tag string error", () => {
      const tree: RegionMapping = {
        tagName: "main",
        headings: ["invalid-tag"],
        detailedHeadings: [],
        children: [],
      };

      const report = checkHeadingOrderReport(tree);

      expect(report.errors[0]).toEqual({
        path: "main[0]",
        tagName: "main",
        heading: "invalid-tag",
        text: undefined,
        element: undefined,
        actualLevel: -1,
        expectedMaxLevel: 2,
        message:
          'Unparseable heading "invalid-tag" at main[0]. Must contain a valid heading level (1-6).',
      });
    });
  });

  // ==========================================
  // 4. TREE PROGRESSION & ACCUMULATION
  // ==========================================
  describe("tree traversal & error accumulation", () => {
    it("accumulates multiple errors across different sibling branches", () => {
      const tree: RegionMapping = {
        tagName: "main",
        headings: ["h1"],
        detailedHeadings: [],
        children: [
          // Branch 1: Invalid skip H1 -> H3
          {
            tagName: "section",
            detailedHeadings: [{ level: "h3", numLevel: 3, text: "Branch A" }],
            children: [],
            headings: ["h3"],
          },
          // Branch 2: Invalid skip H1 -> H4
          {
            tagName: "section",
            detailedHeadings: [{ level: "h4", numLevel: 4, text: "Branch B" }],
            children: [],
            headings: ["h4"],
          },
        ],
      };

      const report = checkHeadingOrderReport(tree);

      expect(report.isValid).toBe(false);
      expect(report.errors).toHaveLength(2);
      expect(report.errors[0].path).toBe("main[0] > section[0]");
      expect(report.errors[1].path).toBe("main[0] > section[1]");
    });

    it("allows returning to higher level parent headings (e.g., H3 back to H2)", () => {
      const tree: RegionMapping = {
        tagName: "main",
        headings: ["h1"],
        detailedHeadings: [],
        children: [
          {
            tagName: "section",
            headings: ["h2"],
            detailedHeadings: [],
            children: [
              {
                tagName: "article",
                headings: ["h3"],
                detailedHeadings: [],
                children: [],
              },
            ],
          },
          // Sibling section going back up to H2
          {
            tagName: "section",
            headings: ["h2"],
            detailedHeadings: [],
            children: [],
          },
        ],
      };

      const report = checkHeadingOrderReport(tree);
      expect(report.isValid).toBe(true);
    });

    it("correctly evaluates boolean helper checkHeadingOrder", () => {
      const validTree: RegionMapping = {
        tagName: "main",
        headings: ["h1"],
        detailedHeadings: [],
        children: [
          {
            tagName: "section",
            headings: ["h2"],
            detailedHeadings: [],
            children: [],
          },
        ],
      };

      const invalidTree: RegionMapping = {
        tagName: "main",
        headings: ["h1"],
        detailedHeadings: [],
        children: [
          {
            tagName: "section",
            headings: ["h4"],
            detailedHeadings: [],
            children: [],
          },
        ],
      };

      expect(checkHeadingOrder(validTree)).toBe(true);
      expect(checkHeadingOrder(invalidTree)).toBe(false);
    });
  });

  // ==========================================
  // NULL / UNDEFINED REGION GUARD
  // ==========================================
  describe("null or undefined region handling", () => {
    it("returns isValid: true with an empty errors array when region is null or undefined", () => {
      // @ts-expect-error Testing runtime JS bypass
      const nullReport = checkHeadingOrderReport(null);
      expect(nullReport).toEqual({ isValid: true, errors: [] });

      // @ts-expect-error Testing runtime JS bypass
      const undefinedReport = checkHeadingOrderReport(undefined);
      expect(undefinedReport).toEqual({ isValid: true, errors: [] });
    });

    it("preserves existing accumulated errors when encountering a null region", () => {
      const existingError: HeadingOrderError = {
        path: "main[0]",
        tagName: "main",
        heading: "h4",
        actualLevel: 4,
        expectedMaxLevel: 2,
        message: "Previous heading error",
      };

      // @ts-expect-error Testing runtime null input with accumulator
      const report = checkHeadingOrderReport(null, 1, "", [existingError]);

      expect(report.isValid).toBe(false);
      expect(report.errors).toEqual([existingError]);
    });
  });
});
