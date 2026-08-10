import { fireEvent, render, screen } from "@testing-library/react";
import { createRef, useState } from "react";
import { describe, expect, it, test, vi } from "vitest";
import { HeadingCtx } from "../hooks/use-heading";
import { HeadingLevel } from "../types";
import { checkHeadingOrder } from "../utils/check-heading-order-report";
import { drawRegion } from "../utils/draw-region";
import { Heading } from "./heading";
import { Article, Header, Legend, Section } from "./landmarks";
import { Main } from "./main";

describe("Heading Level Manager", () => {
  test("should render h1 if heading rendered out of heading context", async () => {
    render(
      <main>
        <Heading>Heading 1</Heading>
      </main>,
    );
    const heading = await screen.findByRole("heading", { name: "Heading 1" });
    expect(heading.tagName).toBe("H1");
  });

  test("renders correct heading levels for nested sections", async () => {
    render(
      <Main pageHasH1={false}>
        <Heading>Main Title</Heading>
        <Section>
          <Heading>Section 1</Heading>
          <Section>
            <Heading>Subsection 1.1</Heading>
          </Section>
        </Section>
        <Section>
          <Heading>Section 2</Heading>
        </Section>
      </Main>,
    );

    const headings = await screen.findAllByRole("heading");
    expect(headings).toHaveLength(4);

    // Assert tag names and text content
    expect(headings[0].tagName).toBe("H1");
    expect(headings[0]).toHaveTextContent("Main Title");

    expect(headings[1].tagName).toBe("H2");
    expect(headings[1]).toHaveTextContent("Section 1");

    expect(headings[2].tagName).toBe("H3");
    expect(headings[2]).toHaveTextContent("Subsection 1.1");

    expect(headings[3].tagName).toBe("H2");
    expect(headings[3]).toHaveTextContent("Section 2");
  });

  test("clamps heading level at H6 for deep nesting", async () => {
    render(
      <Main pageHasH1>
        <Heading>Level 1</Heading>
        <Section>
          <Heading>Level 2</Heading>
          <Section>
            <Heading>Level 3</Heading>
            <Section>
              <Heading>Level 4</Heading>
              <Section>
                <Heading>Level 5</Heading>
                <Section>
                  <Heading>Level 6</Heading>
                  <Section>
                    <Heading>Level 7</Heading>
                  </Section>
                </Section>
              </Section>
            </Section>
          </Section>
        </Section>
      </Main>,
    );

    const headings = await screen.findAllByRole("heading");
    // Only the last two should be H6
    expect(headings[5].tagName).toBe("H6");
    expect(headings[6].tagName).toBe("H6");
  });

  test("should render same level headers in the same region", () => {
    const { container } = render(
      <Section>
        <Heading>Heading 1</Heading>
        <Heading>Heading 2</Heading>
        <Heading>Heading 3</Heading>
      </Section>,
    );
    const { headings } = drawRegion(container);
    expect(headings.every((h) => h === headings[0])).toBe(true);
  });

  test("should detect a skipped heading level", async () => {
    render(
      <Main pageHasH1={false}>
        <Heading>Heading 1</Heading>
        <Section>
          <Heading>Heading 2</Heading>
          <Article>
            <Header>
              <Heading>Heading 4</Heading>
            </Header>
          </Article>
          <Legend>
            <Heading>Heading 3</Heading>
          </Legend>
        </Section>
      </Main>,
    );
    const heading4 = await screen.findByRole("heading", { name: "Heading 4" });
    expect(heading4.tagName).toBe("H4");

    const main = await screen.findByRole("main");
    const region = drawRegion(main);
    expect(checkHeadingOrder(region)).toBe(false);
  });

  test("should start with h2 in main if  pageHasH1 is true", async () => {
    render(
      <Main pageHasH1>
        <Heading>Heading 2</Heading>
      </Main>,
    );

    const heading = await screen.findByRole("heading");
    expect(heading.tagName).toBe("H2");
  });
});

describe("Heading Component", () => {
  // Helper to render <Heading> wrapped inside a HeadingCtx provider
  function renderHeadingWithCtx(ui: React.ReactNode, levelValue?: number) {
    return render(
      levelValue !== undefined ? (
        <HeadingCtx.Provider value={levelValue as HeadingLevel}>
          {ui}
        </HeadingCtx.Provider>
      ) : (
        ui
      ),
    );
  }

  // ==========================================
  // 1. 0-BASED LEVEL TO HTML TAG MAPPING
  // ==========================================
  describe("0-based level tag and ARIA role mapping", () => {
    it.each([
      [0, "h1", 1],
      [1, "h2", 2],
      [2, "h3", 3],
      [3, "h4", 4],
      [4, "h5", 5],
      [5, "h6", 6],
    ])(
      "maps 0-based context level %i to <%s> DOM element with ARIA heading level %i",
      (contextLevel, expectedTag, expectedAriaLevel) => {
        renderHeadingWithCtx(<Heading>Mapped Heading</Heading>, contextLevel);

        const heading = screen.getByRole("heading", {
          level: expectedAriaLevel,
        });
        expect(heading.tagName.toLowerCase()).toBe(expectedTag);
        expect(heading).toHaveTextContent("Mapped Heading");
      },
    );

    it("renders <h1> by default when no HeadingCtx provider is present (default context level = 0)", () => {
      renderHeadingWithCtx(<Heading>Default Heading</Heading>);

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading.tagName.toLowerCase()).toBe("h1");
    });
  });

  // ==========================================
  // 2. EDGE CASES: OUT-OF-BOUNDS & INVALID LEVELS
  // ==========================================
  describe("out-of-bounds context safeguards and edge cases", () => {
    it.each([
      [6, "upper limit overflow (level 6)"],
      [10, "extreme positive limit (level 10)"],
      [-1, "negative index (level -1)"],
      [-99, "extreme negative index (level -99)"],
      [3.14, "floating point index (level 3.14)"],
      [NaN, "NaN index"],
    ])("falls back safely to <h6> when HeadingCtx is %s", (invalidLevel) => {
      renderHeadingWithCtx(
        <Heading data-testid="fallback-heading">Edge Case Heading</Heading>,
        invalidLevel,
      );

      const heading = screen.getByTestId("fallback-heading");
      expect(heading.tagName.toLowerCase()).toBe("h6");

      // Verify it remains an accessible H6 landmark
      expect(screen.getByRole("heading", { level: 6 })).toBe(heading);
    });
  });

  // ==========================================
  // 3. CHILDREN & CONTENT VARIATIONS
  // ==========================================
  describe("children rendering and non-string nodes", () => {
    it("renders complex JSX children (icons, nested spans, styled text)", () => {
      renderHeadingWithCtx(
        <Heading data-testid="complex-heading">
          <span data-testid="icon">🚀 </span>
          <span>
            Featured <strong>Project</strong>
          </span>
        </Heading>,
        1,
      );

      const heading = screen.getByTestId("complex-heading");
      expect(heading).toContainElement(screen.getByTestId("icon"));
      expect(heading).toHaveTextContent("🚀 Featured Project");
    });

    it("renders numeric zero (0) as valid children without omitting it", () => {
      renderHeadingWithCtx(<Heading>{0}</Heading>, 2);

      const heading = screen.getByRole("heading", { level: 3 });
      expect(heading).toHaveTextContent("0");
    });

    it("renders without crashing when children are empty, null, or undefined", () => {
      const { container } = renderHeadingWithCtx(<Heading>{null}</Heading>, 0);

      const heading = container.querySelector("h1");
      expect(heading).not.toBeNull();
      expect(heading?.textContent).toBe("");
    });
  });

  // ==========================================
  // 4. HTML ATTRIBUTES, ARIA, & EVENT HANDLERS
  // ==========================================
  describe("HTML attributes, event handlers, and ARIA overrides", () => {
    it("forwards standard HTML attributes (id, className, style, data-*, aria-*)", () => {
      renderHeadingWithCtx(
        <Heading
          id="hero-title"
          className="text-4xl font-bold"
          style={{ color: "red" }}
          data-testid="styled-heading"
          aria-label="Custom Accessible Title"
        >
          Title
        </Heading>,
        0,
      );

      const heading = screen.getByTestId("styled-heading");
      expect(heading).toHaveAttribute("id", "hero-title");
      expect(heading).toHaveClass("text-4xl", "font-bold");
      expect(heading.style.color).toBe("red");
      expect(heading).toHaveAttribute("aria-label", "Custom Accessible Title");
    });

    it("attaches and triggers DOM event handlers (onClick, onFocus, etc.)", () => {
      const handleClick = vi.fn();
      const handleKeyDown = vi.fn();

      renderHeadingWithCtx(
        <Heading
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          data-testid="interactive-heading"
        >
          Clickable Heading
        </Heading>,
        1,
      );

      const heading = screen.getByTestId("interactive-heading");

      fireEvent.click(heading);
      expect(handleClick).toHaveBeenCalledTimes(1);

      fireEvent.keyDown(heading, { key: "Enter" });
      expect(handleKeyDown).toHaveBeenCalledTimes(1);
    });

    it("allows overriding explicit role attributes when needed", () => {
      renderHeadingWithCtx(
        <Heading role="presentation" data-testid="pres-heading">
          Decorative Header
        </Heading>,
        0,
      );

      const heading = screen.getByTestId("pres-heading");
      expect(heading).toHaveAttribute("role", "presentation");
      expect(screen.queryByRole("heading")).toBeNull();
    });
  });

  // ==========================================
  // 5. REF FORWARDING
  // ==========================================
  describe("React ref forwarding", () => {
    it("forwards object refs to the underlying HTMLHeadingElement", () => {
      const ref = createRef<HTMLHeadingElement>();

      renderHeadingWithCtx(<Heading ref={ref}>Ref Target</Heading>, 2);

      expect(ref.current).not.toBeNull();
      expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
      expect(ref.current?.tagName.toLowerCase()).toBe("h3");
    });

    it("supports callback refs", () => {
      let refNode: HTMLHeadingElement | null = null;
      const callbackRef = (node: HTMLHeadingElement | null) => {
        refNode = node;
      };

      renderHeadingWithCtx(
        <Heading ref={callbackRef}>Callback Ref Target</Heading>,
        1,
      );

      expect(refNode).not.toBeNull();
      expect(refNode).toBeInstanceOf(HTMLHeadingElement);
      expect(
        (refNode as HTMLHeadingElement | null)?.tagName.toLowerCase(),
      ).toBe("h2");
    });
  });

  // ==========================================
  // 6. DYNAMIC CONTEXT RE-RENDERING
  // ==========================================
  describe("dynamic updates and re-rendering", () => {
    it("updates the DOM element tag dynamically when parent HeadingCtx changes", () => {
      function DynamicProviderWrapper() {
        const [level, setLevel] = useState<HeadingLevel>(0);

        return (
          <HeadingCtx.Provider value={level}>
            <button onClick={() => setLevel(2)}>Change Level</button>
            <Heading data-testid="dynamic-heading">Dynamic Heading</Heading>
          </HeadingCtx.Provider>
        );
      }

      render(<DynamicProviderWrapper />);

      const headingInitial = screen.getByTestId("dynamic-heading");
      expect(headingInitial.tagName.toLowerCase()).toBe("h1");

      fireEvent.click(screen.getByText("Change Level"));

      const headingUpdated = screen.getByTestId("dynamic-heading");
      expect(headingUpdated.tagName.toLowerCase()).toBe("h3");
    });
  });

  // ==========================================
  // 7. COMPONENT METADATA
  // ==========================================
  describe("component metadata", () => {
    it("assigns 'Heading' as the component displayName for React DevTools", () => {
      expect(Heading.displayName).toBe("Heading");
    });
  });
});
