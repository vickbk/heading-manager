import { render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { HeadingLevel } from "../types";
import { Heading } from "./heading";
import { HeadingFragment } from "./heading-fragment";
import { Section } from "./landmarks";

describe("HeadingFragment Component", () => {
  // =========================================================================
  // 1. BASIC BEHAVIOR & DOM FOOTPRINT
  // =========================================================================
  describe("Basic Behavior & DOM Footprint", () => {
    it("increments heading level without introducing any DOM wrapper nodes", () => {
      const { container } = render(
        <main data-testid="main-wrapper">
          <Heading>Top Level Heading</Heading>
          <HeadingFragment>
            <Heading>Fragment Subheading</Heading>
          </HeadingFragment>
        </main>,
      );

      const mainWrapper = screen.getByTestId("main-wrapper");

      // Verify DOM node count: main element should contain exactly two direct children (<h1> and <h2>)
      expect(mainWrapper.children.length).toBe(2);
      expect(mainWrapper.children[0].tagName.toLowerCase()).toBe("h1");
      expect(mainWrapper.children[1].tagName.toLowerCase()).toBe("h2");

      // Verify exact HTML layout structure
      expect(container.innerHTML).toBe(
        '<main data-testid="main-wrapper"><h1>Top Level Heading</h1><h2>Fragment Subheading</h2></main>',
      );
    });

    it("renders multiple sibling children with updated context and zero DOM pollution", () => {
      render(
        <main data-testid="container">
          <Heading>Main Title</Heading>
          <HeadingFragment>
            <p>Introductory paragraph</p>
            <Heading>Section 1</Heading>
            <p>Body copy</p>
            <Heading>Section 2</Heading>
          </HeadingFragment>
        </main>,
      );

      const container = screen.getByTestId("container");

      // Verify that all children inside HeadingFragment inherit h2 tag without extra container
      expect(container.children.length).toBe(5); // <h1>, <p>, <h2>, <p>, <h2>
      const headings = screen.getAllByRole("heading", { level: 2 });
      expect(headings).toHaveLength(2);
      expect(headings[0]).toHaveTextContent("Section 1");
      expect(headings[1]).toHaveTextContent("Section 2");
    });

    it("handles null, undefined, or empty children gracefully", () => {
      const { container } = render(
        <HeadingFragment>
          {null}
          {undefined}
          {false}
        </HeadingFragment>,
      );

      expect(container.childNodes.length).toBe(0);
    });
  });

  // =========================================================================
  // 2. DEEP NESTING & BOUNDARY CLAMPING
  // =========================================================================
  describe("Nesting & Depth Progression", () => {
    it("progresses sequentially from h1 to h6 across deeply nested fragments", () => {
      render(
        <div>
          <Heading>Level 1</Heading>
          <HeadingFragment>
            <Heading>Level 2</Heading>
            <HeadingFragment>
              <Heading>Level 3</Heading>
              <HeadingFragment>
                <Heading>Level 4</Heading>
                <HeadingFragment>
                  <Heading>Level 5</Heading>
                  <HeadingFragment>
                    <Heading>Level 6</Heading>
                  </HeadingFragment>
                </HeadingFragment>
              </HeadingFragment>
            </HeadingFragment>
          </HeadingFragment>
        </div>,
      );

      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "Level 1",
      );
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
        "Level 2",
      );
      expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
        "Level 3",
      );
      expect(screen.getByRole("heading", { level: 4 })).toHaveTextContent(
        "Level 4",
      );
      expect(screen.getByRole("heading", { level: 5 })).toHaveTextContent(
        "Level 5",
      );
      expect(screen.getByRole("heading", { level: 6 })).toHaveTextContent(
        "Level 6",
      );
    });

    it("clamps at h6 (level index 5) when nested beyond maximum HTML heading depth", () => {
      render(
        <div>
          <HeadingFragment level={5}>
            <Heading>Explicit Level 6</Heading>
            <HeadingFragment>
              <Heading>Overflow Level 1</Heading>
              <HeadingFragment>
                <Heading>Overflow Level 2</Heading>
              </HeadingFragment>
            </HeadingFragment>
          </HeadingFragment>
        </div>,
      );

      const h6Headings = screen.getAllByRole("heading", { level: 6 });

      // All nested headings beyond level 6 must clamp to <h6> tags
      expect(h6Headings).toHaveLength(3);
      expect(h6Headings[0]).toHaveTextContent("Explicit Level 6");
      expect(h6Headings[1]).toHaveTextContent("Overflow Level 1");
      expect(h6Headings[2]).toHaveTextContent("Overflow Level 2");
    });
  });

  // =========================================================================
  // 3. EXPLICIT LEVEL OVERRIDES (`level` PROP)
  // =========================================================================
  describe("Explicit Level Override Prop", () => {
    it("allows bypassing sequential progression via explicit level prop", () => {
      render(
        <div>
          <Heading>Default H1</Heading>
          {/* Jump straight to level index 3 (h4) */}
          <HeadingFragment level={3}>
            <Heading>Overridden H4</Heading>
          </HeadingFragment>
        </div>,
      );

      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "Default H1",
      );
      expect(screen.getByRole("heading", { level: 4 })).toHaveTextContent(
        "Overridden H4",
      );
      expect(screen.queryByRole("heading", { level: 2 })).toBeNull();
    });

    it("acts as a new baseline depth for nested child fragments when overridden", () => {
      render(
        <div>
          <Heading>Default H1</Heading>
          {/* Override to level index 2 (h3) */}
          <HeadingFragment level={2}>
            <Heading>Base H3</Heading>
            <HeadingFragment>
              {/* Automatically increments from level 2 to level 3 (h4) */}
              <Heading>Nested H4</Heading>
            </HeadingFragment>
          </HeadingFragment>
        </div>,
      );

      expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
        "Base H3",
      );
      expect(screen.getByRole("heading", { level: 4 })).toHaveTextContent(
        "Nested H4",
      );
    });
  });

  // =========================================================================
  // 4. BRANCHING & LANDMARK INTEROPERABILITY
  // =========================================================================
  describe("Branching & Landmark Interoperability", () => {
    it("maintains isolated context trees across parallel sibling fragments", () => {
      render(
        <div>
          <Heading>Main Title</Heading>

          {/* Branch A */}
          <HeadingFragment>
            <Heading>Branch A H2</Heading>
            <HeadingFragment>
              <Heading>Branch A H3</Heading>
            </HeadingFragment>
          </HeadingFragment>

          {/* Branch B (Sibling to Branch A) */}
          <HeadingFragment>
            <Heading>Branch B H2</Heading>
          </HeadingFragment>
        </div>,
      );

      const h2Headings = screen.getAllByRole("heading", { level: 2 });
      expect(h2Headings).toHaveLength(2);
      expect(h2Headings[0]).toHaveTextContent("Branch A H2");
      expect(h2Headings[1]).toHaveTextContent("Branch B H2");

      expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
        "Branch A H3",
      );
    });

    it("interoperates seamlessly when interleaved with Section landmark components", () => {
      render(
        <main>
          <Heading>Page H1</Heading>

          <Section data-testid="section-landmark">
            <Heading>Section H2</Heading>

            {/* HeadingFragment inside a Section */}
            <HeadingFragment>
              <Heading>Fragment H3</Heading>
            </HeadingFragment>
          </Section>
        </main>,
      );

      const section = screen.getByTestId("section-landmark");

      // Verify DOM: <section> node exists, but HeadingFragment leaves no extra container inside section
      expect(section.tagName.toLowerCase()).toBe("section");
      expect(section.children.length).toBe(2); // <h2> and <h3> directly inside <section>

      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "Page H1",
      );
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
        "Section H2",
      );
      expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
        "Fragment H3",
      );
    });
  });

  // =========================================================================
  // 5. DYNAMIC RE-RENDERING & STATE UPDATES
  // =========================================================================
  describe("Dynamic Re-rendering", () => {
    function DynamicHeadingTree() {
      const [overrideLevel, setOverrideLevel] = useState<HeadingLevel>(1);

      return (
        <div>
          <button onClick={() => setOverrideLevel(3)}>Jump to H4</button>
          <HeadingFragment level={overrideLevel}>
            <Heading>Dynamic Heading</Heading>
          </HeadingFragment>
        </div>
      );
    }

    it("updates rendered tag when context level prop changes dynamically", async () => {
      render(<DynamicHeadingTree />);

      // Initially renders as <h2> (level index 1)
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
        "Dynamic Heading",
      );

      // Trigger level prop change
      const button = screen.getByRole("button", { name: "Jump to H4" });
      await button.click();

      // Heading should dynamically update from <h2> to <h4>
      expect(screen.queryByRole("heading", { level: 2 })).toBeNull();
      expect(screen.getByRole("heading", { level: 4 })).toHaveTextContent(
        "Dynamic Heading",
      );
    });
  });
});
