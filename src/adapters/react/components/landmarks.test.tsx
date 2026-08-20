import { render, screen } from "@testing-library/react";
import { createRef, useContext } from "react";
import { describe, expect, it } from "vitest";
import { HeadingLevelCtx } from "../hooks/use-heading-level";
import { Heading } from "./heading";
import { Article, Aside, Header, Legend } from "./landmarks";

// Helper component to read the current HeadingLevelCtx level directly
function LevelConsumer() {
  const { level } = useContext(HeadingLevelCtx);
  return <span data-testid="level">{level}</span>;
}

describe("Landmark Components (Article, Header, Aside, Legend)", () => {
  // ==========================================
  // 1. DOM ELEMENT TAG & SEMANTICS
  // ==========================================
  describe("DOM rendering and landmark tags", () => {
    it("renders <Article> as an <article> element", () => {
      render(<Article data-testid="art">Article Content</Article>);
      const el = screen.getByTestId("art");

      expect(el.tagName.toLowerCase()).toBe("article");
    });

    it("renders <Header> as a <header> element", () => {
      render(<Header data-testid="hdr">Header Content</Header>);
      const el = screen.getByTestId("hdr");

      expect(el.tagName.toLowerCase()).toBe("header");
    });

    it("renders <Aside> as an <aside> element", () => {
      render(<Aside data-testid="asd">Sidebar Content</Aside>);
      const el = screen.getByTestId("asd");

      expect(el.tagName.toLowerCase()).toBe("aside");
    });

    it("renders <Legend> as a <legend> element inside a fieldset", () => {
      render(
        <fieldset>
          <Legend data-testid="lgd">Filter Options</Legend>
        </fieldset>,
      );
      const el = screen.getByTestId("lgd");

      expect(el.tagName.toLowerCase()).toBe("legend");
      expect(el.parentElement?.tagName.toLowerCase()).toBe("fieldset");
    });

    it("does NOT automatically inject role='region' into non-section landmarks when aria-label is provided", () => {
      render(
        <>
          <Article aria-label="News Story" data-testid="art-label">
            Story
          </Article>
          <Aside aria-label="Related Links" data-testid="aside-label">
            Links
          </Aside>
        </>,
      );

      // Articles and Asides have inherent HTML accessibility roles;
      // createRegion should only assign role="region" to <section>
      expect(screen.getByTestId("art-label")).not.toHaveAttribute("role");
      expect(screen.getByTestId("aside-label")).not.toHaveAttribute("role");
    });
  });

  // ==========================================
  // 2. HEADING CONTEXT (HeadingLevelCtx) PROPAGATION
  // ==========================================
  describe("HeadingLevelCtx calculation and cascading", () => {
    it("increments heading context level inside <Article>", () => {
      render(
        <Article>
          <LevelConsumer />
          <Heading>Article Heading</Heading>
        </Article>,
      );

      expect(screen.getByTestId("level")).toHaveTextContent("1");
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
        "Article Heading",
      );
    });

    it("increments heading context level inside <Header>", () => {
      render(
        <Header>
          <LevelConsumer />
          <Heading>Header Title</Heading>
        </Header>,
      );

      expect(screen.getByTestId("level")).toHaveTextContent("1");
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
        "Header Title",
      );
    });

    it("increments heading context level inside <Aside>", () => {
      render(
        <Aside>
          <LevelConsumer />
          <Heading>Sidebar Title</Heading>
        </Aside>,
      );

      expect(screen.getByTestId("level")).toHaveTextContent("1");
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
        "Sidebar Title",
      );
    });

    it("increments heading context level inside <Legend>", () => {
      render(
        <fieldset>
          <Legend>
            <LevelConsumer />
          </Legend>
        </fieldset>,
      );

      expect(screen.getByTestId("level")).toHaveTextContent("1");
    });

    it("cascades heading levels through deeply nested landmark combinations", () => {
      render(
        <Header>
          {/* Level 1 -> Heading renders H2 */}
          <Heading>Page Header</Heading>

          <Article>
            {/* Level 2 -> Heading renders H3 */}
            <Heading>Article Title</Heading>

            <Aside>
              {/* Level 3 -> Heading renders H4 */}
              <Heading>Article Sidebar</Heading>
            </Aside>
          </Article>
        </Header>,
      );

      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
        "Page Header",
      );
      expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
        "Article Title",
      );
      expect(screen.getByRole("heading", { level: 4 })).toHaveTextContent(
        "Article Sidebar",
      );
    });
  });

  // ==========================================
  // 3. REF FORWARDING
  // ==========================================
  describe("React ref forwarding", () => {
    it("forwards ref to HTMLElement for Article, Header, and Aside", () => {
      const articleRef = createRef<HTMLElement>();
      const headerRef = createRef<HTMLElement>();
      const asideRef = createRef<HTMLElement>();

      render(
        <>
          <Article ref={articleRef}>Article</Article>
          <Header ref={headerRef}>Header</Header>
          <Aside ref={asideRef}>Aside</Aside>
        </>,
      );

      expect(articleRef.current?.tagName.toLowerCase()).toBe("article");
      expect(headerRef.current?.tagName.toLowerCase()).toBe("header");
      expect(asideRef.current?.tagName.toLowerCase()).toBe("aside");
    });

    it("forwards ref to HTMLLegendElement for Legend", () => {
      const legendRef = createRef<HTMLLegendElement>();

      render(
        <fieldset>
          <Legend ref={legendRef}>Form Legend</Legend>
        </fieldset>,
      );

      expect(legendRef.current).not.toBeNull();
      expect(legendRef.current).toBeInstanceOf(HTMLLegendElement);
      expect(legendRef.current?.tagName.toLowerCase()).toBe("legend");
    });
  });

  // ==========================================
  // 4. COMPONENT METADATA (displayName)
  // ==========================================
  describe("component metadata", () => {
    it("assigns capitalized displayNames to created landmark components", () => {
      expect(Article.displayName).toBe("Article");
      expect(Header.displayName).toBe("Header");
      expect(Aside.displayName).toBe("Aside");
      expect(Legend.displayName).toBe("Legend");
    });
  });
});
