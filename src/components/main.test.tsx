// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import { createRef, useContext } from "react";
import { describe, expect, it } from "vitest";
import { HeadingCtx } from "../hooks/use-heading";
import { Heading } from "./heading";
import { Section } from "./landmarks";
import { Main } from "./main";

// Helper component to inspect the resolved HeadingCtx value directly
function LevelConsumer() {
  const level = useContext(HeadingCtx);
  return <span data-testid="resolved-level">{level}</span>;
}

describe("Main Landmark Component", () => {
  // ==========================================
  // 1. DOM RENDERING & ATTRIBUTE PASSTHROUGH
  // ==========================================
  describe("DOM rendering and HTML attributes", () => {
    it("renders an HTML <main> element", () => {
      render(<Main data-testid="main-element">Main Content</Main>);

      const mainEl = screen.getByTestId("main-element");
      expect(mainEl.tagName.toLowerCase()).toBe("main");
    });

    it("passes HTML attributes (id, className, aria-*, data-*) to the <main> element", () => {
      render(
        <Main
          id="main-content"
          className="layout-container dark-theme"
          aria-label="Primary Content"
          data-testid="main-attr-test"
        >
          Content
        </Main>,
      );

      const mainEl = screen.getByTestId("main-attr-test");
      expect(mainEl).toHaveAttribute("id", "main-content");
      expect(mainEl).toHaveClass("layout-container", "dark-theme");
      expect(mainEl).toHaveAttribute("aria-label", "Primary Content");
    });

    it("renders children nodes correctly inside <main>", () => {
      render(
        <Main data-testid="main-node">
          <h1>Page Title</h1>
          <p>Page description paragraph</p>
        </Main>,
      );

      const mainEl = screen.getByTestId("main-node");
      expect(mainEl).toHaveTextContent("Page Title");
      expect(mainEl).toHaveTextContent("Page description paragraph");
      expect(mainEl.children).toHaveLength(2);
    });
  });

  // ==========================================
  // 2. REF FORWARDING
  // ==========================================
  describe("React ref forwarding", () => {
    it("forwards DOM ref to the underlying <main> HTMLElement", () => {
      const ref = createRef<HTMLElement>();

      render(<Main ref={ref}>Ref Target</Main>);

      expect(ref.current).not.toBeNull();
      expect(ref.current).toBeInstanceOf(HTMLElement);
      expect(ref.current?.tagName.toLowerCase()).toBe("main");
    });
  });

  // ==========================================
  // 3. HEADING CONTEXT & pageHasH1 PROP BEHAVIOR
  // ==========================================
  describe("HeadingCtx calculation and pageHasH1 prop handling", () => {
    it("defaults pageHasH1 to true when omitted, providing level 1 (H2) at root context", () => {
      render(
        <Main>
          <LevelConsumer />
        </Main>,
      );

      // Root level 0 + pageHasH1 (true) -> calculates level 1
      expect(screen.getByTestId("resolved-level")).toHaveTextContent("1");
    });

    it("provides level 1 (H2) when pageHasH1 is explicitly set to true at root context", () => {
      render(
        <Main pageHasH1={true}>
          <LevelConsumer />
        </Main>,
      );

      expect(screen.getByTestId("resolved-level")).toHaveTextContent("1");
    });

    it("provides level 0 (H1) when pageHasH1 is explicitly set to false at root context", () => {
      render(
        <Main pageHasH1={false}>
          <LevelConsumer />
        </Main>,
      );

      // Root level 0 + pageHasH1 (false) -> retains level 0
      expect(screen.getByTestId("resolved-level")).toHaveTextContent("0");
    });

    it("ignores pageHasH1=false when nested inside a non-zero parent HeadingCtx", () => {
      render(
        <HeadingCtx.Provider value={1}>
          {/* Even with pageHasH1=false, non-zero parent (1) always increments to 2 */}
          <Main pageHasH1={false}>
            <LevelConsumer />
          </Main>
        </HeadingCtx.Provider>,
      );

      expect(screen.getByTestId("resolved-level")).toHaveTextContent("2");
    });
  });

  // ==========================================
  // 4. INTEGRATION WITH Heading AND Section
  // ==========================================
  describe("integration with Heading and nested landmark regions", () => {
    it("renders <Heading> as <h2> inside default <Main> (pageHasH1 = true)", () => {
      render(
        <Main>
          <Heading>Section Heading</Heading>
        </Main>,
      );

      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading.tagName.toLowerCase()).toBe("h2");
      expect(heading).toHaveTextContent("Section Heading");
    });

    it("renders <Heading> as <h1> inside <Main pageHasH1={false}>", () => {
      render(
        <Main pageHasH1={false}>
          <Heading>Main Document Title</Heading>
        </Main>,
      );

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading.tagName.toLowerCase()).toBe("h1");
      expect(heading).toHaveTextContent("Main Document Title");
    });

    it("cascades heading levels through nested <Section> containers", () => {
      render(
        <Main pageHasH1={false}>
          {/* Level 0 -> renders <h1> */}
          <Heading>Main Title</Heading>

          <Section>
            {/* Level 1 -> renders <h2> */}
            <Heading>Section Title</Heading>

            <Section>
              {/* Level 2 -> renders <h3> */}
              <Heading>Sub-section Title</Heading>
            </Section>
          </Section>
        </Main>,
      );

      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "Main Title",
      );
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
        "Section Title",
      );
      expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
        "Sub-section Title",
      );
    });
  });

  // ==========================================
  // 5. COMPONENT METADATA
  // ==========================================
  describe("component metadata", () => {
    it("assigns 'Main' as the component displayName", () => {
      expect(Main.displayName).toBe("Main");
    });
  });
});
