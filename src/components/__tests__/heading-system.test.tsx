import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { createRegion } from "../create-region";
import { Heading } from "../heading";
import { HeadingFragment } from "../heading-fragment";
import { Main } from "../main";

import { checkHeadingOrderReport, drawRegion } from "../../utils";

const Section = createRegion<HTMLElement>("section");
const Article = createRegion<HTMLElement>("article");

describe("Heading System Component Integration", () => {
  it("renders a full sequential heading hierarchy from H1 through H4 across Main, Section, Article, and HeadingFragment", () => {
    render(
      <Main pageHasH1={false} data-testid="app-root">
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

    // Perform region tree extraction using the utils barrel export
    const rootEl = screen.getByTestId("app-root");
    const regionTree = drawRegion(rootEl);

    expect(regionTree.tagName).toBe("main");
    expect(regionTree.headings).toEqual(["h1"]);
    expect(regionTree.children).toHaveLength(1);

    // Perform report check
    const report = checkHeadingOrderReport(regionTree);
    expect(report.isValid).toBe(true);
    expect(report.errors).toHaveLength(0);
  });
});
