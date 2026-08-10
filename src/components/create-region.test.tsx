import { render, screen } from "@testing-library/react";
import { createRef, useContext } from "react";
import { describe, expect, it } from "vitest";
import { HeadingCtx } from "../hooks/use-heading";
import { createRegion } from "./create-region";

// Helper component to read and render current HeadingCtx level
function LevelConsumer() {
  const level = useContext(HeadingCtx);
  return <span data-testid="heading-level">{level}</span>;
}

describe("createRegion", () => {
  // Create test components for various tag types
  const SectionRegion = createRegion<HTMLElement>("section");
  const ArticleRegion = createRegion<HTMLElement>("article");
  const HeaderRegion = createRegion<HTMLElement>("header");
  const CustomRegion = createRegion<HTMLElement>("aside");

  // ==========================================
  // 1. HTML TAG RENDERING & ATTRIBUTE PASSTHROUGH
  // ==========================================
  describe("DOM rendering and attribute passthrough", () => {
    it("renders the correct HTML element tag", () => {
      render(
        <>
          <SectionRegion data-testid="sec-el">Content</SectionRegion>
          <ArticleRegion data-testid="art-el">Content</ArticleRegion>
          <HeaderRegion data-testid="hdr-el">Content</HeaderRegion>
        </>,
      );

      expect(screen.getByTestId("sec-el").tagName.toLowerCase()).toBe(
        "section",
      );
      expect(screen.getByTestId("art-el").tagName.toLowerCase()).toBe(
        "article",
      );
      expect(screen.getByTestId("hdr-el").tagName.toLowerCase()).toBe("header");
    });

    it("passes HTML attributes (id, className, data-*, style) to the DOM element", () => {
      render(
        <SectionRegion
          id="custom-id"
          className="container grid-layout"
          data-testid="attr-test"
          data-custom="custom-value"
        >
          Child
        </SectionRegion>,
      );

      const element = screen.getByTestId("attr-test");
      expect(element).toHaveAttribute("id", "custom-id");
      expect(element).toHaveClass("container", "grid-layout");
      expect(element).toHaveAttribute("data-custom", "custom-value");
    });

    it("renders children elements correctly inside the region", () => {
      render(
        <ArticleRegion data-testid="article-node">
          <h2>Article Title</h2>
          <p>Article body text</p>
        </ArticleRegion>,
      );

      const article = screen.getByTestId("article-node");
      expect(article).toHaveTextContent("Article Title");
      expect(article).toHaveTextContent("Article body text");
      expect(article.children).toHaveLength(2);
    });
  });

  // ==========================================
  // 2. REF FORWARDING
  // ==========================================
  describe("React ref forwarding", () => {
    it("forwards DOM ref to the underlying HTML element", () => {
      const ref = createRef<HTMLElement>();

      render(<SectionRegion ref={ref}>Ref Content</SectionRegion>);

      expect(ref.current).not.toBeNull();
      expect(ref.current).toBeInstanceOf(HTMLElement);
      expect(ref.current?.tagName.toLowerCase()).toBe("section");
    });
  });

  // ==========================================
  // 3. HEADING CONTEXT (HeadingCtx) PROPAGATION
  // ==========================================
  describe("HeadingCtx context provider integration", () => {
    it("calculates and provides the next heading level to nested children", () => {
      render(
        <SectionRegion>
          <LevelConsumer />
        </SectionRegion>,
      );

      // Default root level is 0 with hasH1=true -> calculates level 1
      expect(screen.getByTestId("heading-level")).toHaveTextContent("1");
    });

    it("properly increments context levels across nested createRegion instances", () => {
      render(
        <SectionRegion>
          {/* Level 1 */}
          <ArticleRegion>
            {/* Level 2 */}
            <SectionRegion>
              {/* Level 3 */}
              <LevelConsumer />
            </SectionRegion>
          </ArticleRegion>
        </SectionRegion>,
      );

      expect(screen.getByTestId("heading-level")).toHaveTextContent("3");
    });

    it("uses surrounding HeadingCtx value when nested inside a Provider", () => {
      render(
        <HeadingCtx.Provider value={2}>
          <SectionRegion>
            <LevelConsumer />
          </SectionRegion>
        </HeadingCtx.Provider>,
      );

      // Parent level is 2 -> Section Region calculates 3
      expect(screen.getByTestId("heading-level")).toHaveTextContent("3");
    });
  });

  // ==========================================
  // 4. ARIA ROLE LOGIC FOR <section>
  // ==========================================
  describe("ARIA role calculation rules", () => {
    it("omits role attribute on <section> when neither aria-label nor aria-labelledby is provided", () => {
      render(
        <SectionRegion data-testid="unlabelled-section">Content</SectionRegion>,
      );

      const section = screen.getByTestId("unlabelled-section");
      expect(section).not.toHaveAttribute("role");
    });

    it("preserves explicit role override on <section> even when aria-label is present", () => {
      render(
        <SectionRegion
          aria-label="Search Form"
          role="search"
          data-testid="custom-role-section"
        >
          Content
        </SectionRegion>,
      );

      const section = screen.getByTestId("custom-role-section");
      expect(section).toHaveAttribute("role", "search");
    });

    it("does NOT add default role='region' to non-section elements when aria-label is present", () => {
      render(
        <ArticleRegion aria-label="Blog Post" data-testid="article-with-label">
          Content
        </ArticleRegion>,
      );

      const article = screen.getByTestId("article-with-label");
      expect(article).not.toHaveAttribute("role");
      expect(article).toHaveAttribute("aria-label", "Blog Post");
    });

    it("allows non-section elements to receive explicit role props", () => {
      render(
        <HeaderRegion role="banner" data-testid="header-banner">
          Content
        </HeaderRegion>,
      );

      const header = screen.getByTestId("header-banner");
      expect(header).toHaveAttribute("role", "banner");
    });
  });

  // ==========================================
  // 5. COMPONENT METADATA (displayName)
  // ==========================================
  describe("component metadata and displayName assignment", () => {
    it("capitalizes tag name for displayName (e.g., 'section' -> 'Section')", () => {
      expect(SectionRegion.displayName).toBe("Section");
      expect(ArticleRegion.displayName).toBe("Article");
      expect(HeaderRegion.displayName).toBe("Header");
      expect(CustomRegion.displayName).toBe("Aside");
    });
  });
});
