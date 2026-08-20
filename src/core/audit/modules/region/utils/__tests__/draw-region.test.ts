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

  it("handles custom ARIA heading elements, missing levels, aria-level overrides, levels greater than 6, and aria-label fallbacks", () => {
    const doc = parser.parseFromString(
      `
      <div role="main">
        <div
          role="heading"
          aria-level="1"
          aria-label="Accessible Hero Title"
        ></div>

        <div role="heading">
          Heading Without Explicit Level
        </div>

        <div role="heading" aria-level="7">
          Seventh Level Heading
        </div>

        <div role="heading" aria-level="10" aria-label="Tenth Level Heading"></div>

        <div role="region">
          <h2 aria-label="Accessible Section Heading">
            Explicit Visual Subtitle
          </h2>

          <div role="heading" aria-level="8">
            Eighth Level Section Heading
          </div>
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
    expect(regionTree.detailedHeadings).toHaveLength(4);

    expect(regionTree.headings).toEqual(["h1", "h2", "h7", "h10"]);

    const firstHeading = regionTree.detailedHeadings?.[0];
    expect(firstHeading?.level).toBe("h1");
    expect(firstHeading?.text).toBe("Accessible Hero Title");

    const headingWithoutLevel = regionTree.detailedHeadings?.[1];
    expect(headingWithoutLevel?.level).toBe("h2");
    expect(headingWithoutLevel?.text).toBe("Heading Without Explicit Level");

    const seventhLevelHeading = regionTree.detailedHeadings?.[2];
    expect(seventhLevelHeading?.level).toBe("h7");
    expect(seventhLevelHeading?.text).toBe("Seventh Level Heading");

    const tenthLevelHeading = regionTree.detailedHeadings?.[3];
    expect(tenthLevelHeading?.level).toBe("h10");
    expect(tenthLevelHeading?.text).toBe("Tenth Level Heading");

    const childRegion = regionTree.children[0];

    expect(childRegion.tagName).toBe('div[role="region"]');
    expect(childRegion.headings).toEqual(["h2", "h8"]);
    expect(childRegion.detailedHeadings).toHaveLength(2);

    expect(childRegion.detailedHeadings?.[0].level).toBe("h2");
    expect(childRegion.detailedHeadings?.[0].text).toBe(
      "Explicit Visual Subtitle",
    );

    expect(childRegion.detailedHeadings?.[1].level).toBe("h8");
    expect(childRegion.detailedHeadings?.[1].text).toBe(
      "Eighth Level Section Heading",
    );
  });
});
