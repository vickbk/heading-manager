import { Window } from "happy-dom";
import { describe, expect, it } from "vitest";
import { drawRegion } from "../index";

const window = new Window();
const parser = new window.DOMParser();

describe("drawRegion Low-Level DOM Parser", () => {
  it("extracts direct headings and nested child regions accurately", () => {
    const doc = parser.parseFromString(
      `
      <main id="root">
        <h1>Main Page Title</h1>
        <section>
          <h2>Sub Section Header</h2>
          <article>
            <h3>Article Header</h3>
          </article>
        </section>
      </main>
      `,
      "text/html",
    );

    const mainEl = doc.querySelector("main");
    expect(mainEl).not.toBeNull();

    const regionTree = drawRegion(mainEl as unknown as Element);

    expect(regionTree.tagName).toBe("main");
    expect(regionTree.headings).toEqual(["h1"]);
    expect(regionTree.children).toHaveLength(1);

    const sectionRegion = regionTree.children[0];
    expect(sectionRegion.tagName).toBe("section");
    expect(sectionRegion.headings).toEqual(["h2"]);
    expect(sectionRegion.children).toHaveLength(1);

    const articleRegion = sectionRegion.children[0];
    expect(articleRegion.tagName).toBe("article");
    expect(articleRegion.headings).toEqual(["h3"]);
  });

  it("handles custom ARIA heading elements, aria-level overrides, and aria-label fallbacks", () => {
    const doc = parser.parseFromString(
      `
      <div role="main">
        <div role="heading" aria-level="1" aria-label="Accessible Hero Title"></div>
        <div role="region">
          <h2 aria-label="Accessible Section Heading">Explicit Visual Subtitle</h2>
        </div>
      </div>
      `,
      "text/html",
    );

    const rootEl = doc.querySelector('[role="main"]');
    expect(rootEl).not.toBeNull();

    const regionTree = drawRegion(rootEl as unknown as Element);

    expect(regionTree.tagName).toBe('div[role="main"]');
    expect(regionTree.detailedHeadings).toBeDefined();
    expect(regionTree.detailedHeadings).toHaveLength(1);

    const firstHeading = regionTree.detailedHeadings?.[0];
    expect(firstHeading?.level).toBe("h1");
    expect(firstHeading?.text).toBe("Accessible Hero Title");

    const childRegion = regionTree.children[0];
    expect(childRegion.tagName).toBe('div[role="region"]');
    expect(childRegion.detailedHeadings?.[0].level).toBe("h2");
    expect(childRegion.detailedHeadings?.[0].text).toBe(
      "Explicit Visual Subtitle",
    );
  });
});
