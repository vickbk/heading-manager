import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

// Types
import type { HeadingOrderReport, RegionMapping } from "./types";

// Core Components & Context
import { createRegion } from "./components/create-region";
import { Heading } from "./components/heading";
import { HeadingFragment } from "./components/heading-fragment";
import { Main } from "./components/main";

// Verification Helpers
import {
  checkHeadingOrder,
  checkHeadingOrderReport,
  drawRegion,
} from "./utils";

// Landmark regions created via createRegion factory
const Section = createRegion<HTMLElement>("section");
const Article = createRegion<HTMLElement>("article");
const Aside = createRegion<HTMLElement>("aside");
const Nav = createRegion<HTMLElement>("nav");

describe("Heading System Integration Test Suite", () => {
  // =========================================================================
  // 1. HAPPY PATH: FULL PIPELINE INTEGRATION
  // =========================================================================
  describe("Happy Path & Full Pipeline Validation", () => {
    it("renders a valid sequential hierarchy and passes checkHeadingOrderReport", () => {
      const { container } = render(
        <Main pageHasH1={false} data-testid="root-main">
          <Heading>Main Application Title</Heading>

          <Section data-testid="section-1">
            <Heading>Section 1: Overview</Heading>

            <Article data-testid="article-1">
              <Heading>Article 1.1: Deep Dive</Heading>
            </Article>
          </Section>

          <Aside data-testid="aside-1">
            <Heading>Sidebar Information</Heading>
          </Aside>
        </Main>,
      );

      const mainEl = screen.getByTestId("root-main");
      const mapping: RegionMapping = drawRegion(mainEl);

      // Verify DOM tree extracted by drawRegion
      expect(mapping.tagName).toBe("main");
      expect(mapping.headings).toEqual(["h1"]);
      expect(mapping.children).toHaveLength(2); // section and aside

      // Run assertion report
      const report: HeadingOrderReport = checkHeadingOrderReport(mapping);

      expect(report.isValid).toBe(true);
      expect(report.errors).toHaveLength(0);
      expect(checkHeadingOrder(mapping)).toBe(true);
    });

    it("integrates HeadingFragment seamlessly without breaking drawRegion tree structure", () => {
      const { container } = render(
        <Main pageHasH1={false} data-testid="root-main">
          <Heading>Document Header</Heading>

          {/* HeadingFragment steps down heading level without adding a DOM node */}
          <HeadingFragment>
            <Heading>Sub-heading via Fragment</Heading>

            <Section>
              <Heading>Nested Section Heading</Heading>
            </Section>
          </HeadingFragment>
        </Main>,
      );

      const mainEl = screen.getByTestId("root-main");
      const mapping = drawRegion(mainEl);

      // DOM contains h1, h2, and a section child containing h3
      expect(mapping.headings).toEqual(["h1", "h2"]);
      expect(mapping.children).toHaveLength(1);
      expect(mapping.children[0].headings).toEqual(["h3"]);

      const report = checkHeadingOrderReport(mapping);
      expect(report.isValid).toBe(true);
    });
  });

  // =========================================================================
  // 2. SYSTEM FLOW FLAWS & ARCHITECTURAL PITFALLS
  // =========================================================================
  describe("System Flow Flaws & Architectural Edge Cases", () => {
    /**
     * FLAW 1: Main Component Default (pageHasH1 = true)
     * In main.tsx, pageHasH1 defaults to true. Calling useHeading(true) causes
     * calculateNextHeadingLevel(0, true) to return 1 (H2) instead of 0 (H1).
     * This forces the top-level <Heading> inside <Main> to render as <h2>!
     */
    it("FLAW 1: Demonstrates that default <Main> omits <h1> and starts at <h2>", () => {
      render(
        <Main data-testid="default-main">
          <Heading>Page Title</Heading>
          <Section>
            <Heading>Section Title</Heading>
          </Section>
        </Main>,
      );

      const mainEl = screen.getByTestId("default-main");
      const mapping = drawRegion(mainEl);

      // Main rendered <h2> instead of <h1>
      expect(mapping.headings).toEqual(["h2"]);
      expect(mapping.children[0].headings).toEqual(["h3"]);

      // Querying by role confirms no H1 exists in the document
      expect(screen.queryByRole("heading", { level: 1 })).toBeNull();
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
        "Page Title",
      );
    });

    /**
     * FLAW 2: Skipping Heading Levels via HeadingFragment Override
     * When HeadingFragment explicitly sets level={3} (H4) inside an H1 scope,
     * checkHeadingOrderReport detects the gap (H1 -> H4) and returns detailed errors.
     */
    it("FLAW 2: Detects level skipping via HeadingFragment override and generates detailed errors", () => {
      render(
        <Main pageHasH1={false} data-testid="root-main">
          <Heading>Root H1</Heading>

          {/* Jump directly to level 3 (H4) */}
          <HeadingFragment level={3}>
            <Section data-testid="skipped-section">
              <Heading>Skipped H4 Title</Heading>
            </Section>
          </HeadingFragment>
        </Main>,
      );

      const mainEl = screen.getByTestId("root-main");
      const mapping = drawRegion(mainEl);
      const report = checkHeadingOrderReport(mapping);

      expect(report.isValid).toBe(false);
      expect(report.errors).toHaveLength(1);

      const error = report.errors[0];
      expect(error.actualLevel).toBe(5);
      expect(error.expectedMaxLevel).toBe(2);
      expect(error.text).toBe("Skipped H4 Title");
      expect(error.path).toBe("main[0] > section[0]");
      expect(error.message).toContain(
        'Heading level skipped at main[0] > section[0] ("Skipped H4 Title"): context level is H1, expected maximum H2, but found H5.',
      );
    });
  });

  // =========================================================================
  // 3. WAI-ARIA LANDMARKS & REGION IDENTIFIERS
  // =========================================================================
  describe("ARIA Role Identification & Path Resolution", () => {
    it("identifies explicit ARIA landmark roles and formats path strings correctly in reports", () => {
      render(
        <div role="main" data-testid="aria-main">
          <Heading>Main Role Title</Heading>

          <div role="navigation">
            {/* Level skipped: H1 -> H3 */}
            <HeadingFragment level={2}>
              <Heading>Nav Header</Heading>
            </HeadingFragment>
          </div>
        </div>,
      );

      const rootEl = screen.getByTestId("aria-main");
      const mapping = drawRegion(rootEl);

      // getRegionIdentifier should tag element with role attribute
      expect(mapping.tagName).toBe('div[role="main"]');
      expect(mapping.children[0].tagName).toBe('div[role="navigation"]');

      const report = checkHeadingOrderReport(mapping);

      expect(report.isValid).toBe(false);
      expect(report.errors[0].path).toBe(
        'div[role="main"][0] > div[role="navigation"][0]',
      );
    });
  });

  // =========================================================================
  // 4. RICH METADATA & DOM REFERENCES (`detailedHeadings`)
  // =========================================================================
  describe("Detailed Heading Metadata", () => {
    it("extracts text content and live DOM node references into report errors", () => {
      render(
        <Main pageHasH1={false} data-testid="root-main">
          <Heading>Valid Root Title</Heading>
          <HeadingFragment level={4}>
            <Section>
              <Heading>Faulty Deep Heading</Heading>
            </Section>
          </HeadingFragment>
        </Main>,
      );

      const mainEl = screen.getByTestId("root-main");
      const mapping = drawRegion(mainEl);
      const report = checkHeadingOrderReport(mapping);

      expect(report.isValid).toBe(false);
      const error = report.errors[0];

      // Verify DOM element reference is attached
      expect(error.element).toBeInstanceOf(HTMLElement);
      expect((error.element as HTMLElement).tagName.toLowerCase()).toBe("h6");
      expect(error.text).toBe("Faulty Deep Heading");
    });
  });

  // =========================================================================
  // 5. EDGE CASES: MAXIMUM DEPTH CLAMPING & ISOLATED BRANCHES
  // =========================================================================
  describe("Edge Cases & Complex Trees", () => {
    it("handles maximum depth clamping at H6 without throwing invalid hierarchy errors", () => {
      render(
        <Main pageHasH1={false} data-testid="root-main">
          <Heading>Level 1 (H1)</Heading>
          <Section>
            <Heading>Level 2 (H2)</Heading>
            <Section>
              <Heading>Level 3 (H3)</Heading>
              <Section>
                <Heading>Level 4 (H4)</Heading>
                <Section>
                  <Heading>Level 5 (H5)</Heading>
                  <Section>
                    <Heading>Level 6 (H6)</Heading>
                    <Section>
                      {/* Overflow beyond level 6 stays clamped at H6 */}
                      <Heading>Overflow Level (Clamped H6)</Heading>
                    </Section>
                  </Section>
                </Section>
              </Section>
            </Section>
          </Section>
        </Main>,
      );

      const mainEl = screen.getByTestId("root-main");
      const mapping = drawRegion(mainEl);
      const report = checkHeadingOrderReport(mapping);

      // Going H6 -> H6 is valid (diff is 0 <= 1)
      expect(report.isValid).toBe(true);
      expect(report.errors).toHaveLength(0);
    });

    it("isolates context levels between sibling landmark branches", () => {
      render(
        <Main pageHasH1={false} data-testid="root-main">
          <Heading>App Root</Heading>

          {/* Branch A: Nest 2 levels down (H1 -> H2 -> H3) */}
          <Section>
            <Heading>Branch A (H2)</Heading>
            <Article>
              <Heading>Branch A Child (H3)</Heading>
            </Article>
          </Section>

          {/* Branch B: Sibling to Branch A, must reset back to H2 context */}
          <Aside>
            <Heading>Branch B (H2)</Heading>
          </Aside>
        </Main>,
      );

      const mainEl = screen.getByTestId("root-main");
      const mapping = drawRegion(mainEl);
      const report = checkHeadingOrderReport(mapping);

      expect(report.isValid).toBe(true);
      expect(mapping.children[0].headings).toEqual(["h2"]);
      expect(mapping.children[0].children[0].headings).toEqual(["h3"]);
      expect(mapping.children[1].headings).toEqual(["h2"]);
    });

    it("validates sequential heading progression (H1 -> H2 -> H3 -> H3 -> H4) across mixed main-flow elements and nested section landmarks", () => {
      render(
        <Main pageHasH1={false} data-testid="root-element">
          <Heading>Main heading</Heading>
          <HeadingFragment>
            <Heading>H2 heading</Heading>
            <Section>
              <Heading>H3 heading</Heading>
            </Section>
            <HeadingFragment>
              <Heading>H3 heading</Heading>
              <HeadingFragment>
                <Heading>H4 heading</Heading>
              </HeadingFragment>
            </HeadingFragment>
          </HeadingFragment>
        </Main>,
      );

      const main = screen.getByTestId("root-element");
      const region = drawRegion(main);
      const report = checkHeadingOrderReport(region);

      expect(report.isValid).toBe(true);
      expect(screen.getByRole("heading", { level: 1 }).innerText).toBe(
        "Main heading",
      );
    });
  });
});
