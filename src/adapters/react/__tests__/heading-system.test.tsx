import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createRegion, Heading, HeadingFragment, Main } from "../components";

const Section = createRegion<HTMLElement>("section");
const Article = createRegion<HTMLElement>("article");

describe("Heading System Component Integration", () => {
  it("renders a full sequential heading hierarchy from H1 through H4 across Main, Section, Article, and HeadingFragment", () => {
    render(
      <Main data-testid="app-root">
        <Heading>H1 Application Title</Heading>

        <Section data-testid="section-level">
          <Heading>H2 Section Heading</Heading>

          <HeadingFragment>
            <Heading>H3 Fragment Heading</Heading>

            <Article data-testid="article-level">
              <Heading>H4 Article Heading</Heading>
            </Article>
          </HeadingFragment>
        </Section>
      </Main>,
    );

    // Verify individual heading tag elements in the DOM
    const h1 = screen.getByRole("heading", { level: 1 });
    const h2 = screen.getByRole("heading", { level: 2 });
    const h3 = screen.getByRole("heading", { level: 3 });
    const h4 = screen.getByRole("heading", { level: 4 });

    expect(h1).toHaveTextContent("H1 Application Title");
    expect(h2).toHaveTextContent("H2 Section Heading");
    expect(h3).toHaveTextContent("H3 Fragment Heading");
    expect(h4).toHaveTextContent("H4 Article Heading");
  });
});
