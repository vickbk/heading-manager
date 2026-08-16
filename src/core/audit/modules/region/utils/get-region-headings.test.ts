import { describe, expect, it } from "vitest";
import { getRegionHeadings } from "./get-region-headings";

describe("getRegionHeadings", () => {
  const setup = (html: string): Element => {
    document.body.innerHTML = html;
    const element = document.querySelector("[data-region]");
    if (!element) {
      throw new Error("Test region was not found");
    }
    return element;
  };

  describe("native headings", () => {
    it("extracts all native headings", () => {
      const element = setup(
        `<main data-region> 
           <h1>Page title</h1> 
           <h2>Section title</h2> 
           <h3>Subsection title</h3> 
           <h4>Fourth level</h4> 
           <h5>Fifth level</h5> 
           <h6>Sixth level</h6> 
        </main> `,
      );
      const result = getRegionHeadings(element);
      expect(result.headings).toEqual(["h1", "h2", "h3", "h4", "h5", "h6"]);
      expect(
        result.detailedHeadings.map(({ level, text }) => ({ level, text })),
      ).toEqual([
        { level: "h1", text: "Page title" },
        { level: "h2", text: "Section title" },
        { level: "h3", text: "Subsection title" },
        { level: "h4", text: "Fourth level" },
        { level: "h5", text: "Fifth level" },
        { level: "h6", text: "Sixth level" },
      ]);
    });

    it("preserves document order", () => {
      const element = setup(
        ` <main data-region> <h3>Third</h3> <h1>First</h1> <h2>Second</h2> </main> `,
      );
      const result = getRegionHeadings(element);
      expect(result.headings).toEqual(["h3", "h1", "h2"]);
      expect(result.detailedHeadings.map((heading) => heading.text)).toEqual([
        "Third",
        "First",
        "Second",
      ]);
    });
    it("does not require headings to be direct DOM children", () => {
      const element = setup(
        ` <main data-region> <div> <section-wrapper> <h2>Nested heading</h2> </section-wrapper> </div> </main> `,
      );
      const result = getRegionHeadings(element);
      expect(result.headings).toEqual(["h2"]);
      expect(result.detailedHeadings[0].text).toBe("Nested heading");
    });
  });
  describe("ARIA headings", () => {
    it("extracts elements with role=heading", () => {
      const element = setup(
        ` <main data-region> <div role="heading" aria-level="2">ARIA heading</div> </main> `,
      );
      const result = getRegionHeadings(element);
      expect(result.headings).toEqual(["h2"]);
      expect(result.detailedHeadings[0].text).toBe("ARIA heading");
    });
    it("uses aria-level for an ARIA heading", () => {
      const element = setup(
        ` <main data-region> <div role="heading" aria-level="4">Heading</div> </main> `,
      );
      const result = getRegionHeadings(element);
      expect(result.headings).toEqual(["h4"]);
    });
    it("uses aria-level when present on a native heading", () => {
      const element = setup(
        ` <main data-region> <h2 aria-level="5">Heading</h2> </main> `,
      );
      const result = getRegionHeadings(element);
      expect(result.headings).toEqual(["h5"]);
      expect(result.detailedHeadings[0].level).toBe("h5");
    });
    it("handles aria-level values as provided by the DOM", () => {
      const element = setup(
        ` <main data-region> <div role="heading" aria-level="10">Heading</div> </main> `,
      );
      const result = getRegionHeadings(element);
      expect(result.headings).toEqual(["h10"]);
    });
    it("handles aria-level=0 as an explicit value", () => {
      const element = setup(
        ` <main data-region> <div role="heading" aria-level="0">Heading</div> </main> `,
      );
      const result = getRegionHeadings(element);
      expect(result.headings).toEqual(["h2"]);
    });
    it("falls back to the native level when aria-level is absent", () => {
      const element = setup(
        ` <main data-region> <h3>Native heading</h3> </main> `,
      );
      const result = getRegionHeadings(element);
      expect(result.headings).toEqual(["h3"]);
    });
  });
  describe("nested landmarks", () => {
    it("excludes headings belonging to nested landmarks", () => {
      const element = setup(
        ` <main data-region> <h1>Main heading</h1> <section> <h2>Nested section heading</h2> </section> <h2>Another main heading</h2> </main> `,
      );
      const result = getRegionHeadings(element);
      expect(result.headings).toEqual(["h1", "h2"]);
      expect(result.detailedHeadings.map((heading) => heading.text)).toEqual([
        "Main heading",
        "Another main heading",
      ]);
    });
    it("excludes headings from deeply nested landmarks", () => {
      const element = setup(
        ` <main data-region> <h1>Main</h1> <section> <h2>Section</h2> <article> <h3>Article</h3> </article> </section> <h2>Back in main</h2> </main> `,
      );
      const result = getRegionHeadings(element);
      expect(result.headings).toEqual(["h1", "h2"]);
      expect(result.detailedHeadings.map((heading) => heading.text)).toEqual([
        "Main",
        "Back in main",
      ]);
    });
    it("includes headings inside non-landmark containers within the region", () => {
      const element = setup(
        ` <main data-region> <div> <div> <h2>Still part of main</h2> </div> </div> <section> <div> <h3>Part of section</h3> </div> </section> </main> `,
      );
      const result = getRegionHeadings(element);
      expect(result.detailedHeadings.map((heading) => heading.text)).toEqual([
        "Still part of main",
      ]);
    });
    it("does not accidentally include headings outside the supplied region", () => {
      const element = setup(
        ` <h1>Outside</h1> <main data-region> <h2>Inside</h2> </main> <h3>Outside again</h3> `,
      );
      const result = getRegionHeadings(element);
      expect(result.detailedHeadings.map((heading) => heading.text)).toEqual([
        "Inside",
      ]);
    });
  });
  describe("text extraction", () => {
    it("uses textContent for normal headings", () => {
      const element = setup(
        ` <main data-region> <h2>Hello world</h2> </main> `,
      );
      const result = getRegionHeadings(element);
      expect(result.detailedHeadings[0].text).toBe("Hello world");
    });
    it("trims heading text", () => {
      const element = setup(
        ` <main data-region> <h2> Heading with whitespace </h2> </main> `,
      );
      const result = getRegionHeadings(element);
      expect(result.detailedHeadings[0].text).toBe("Heading with whitespace");
    });
    it("preserves meaningful nested text content", () => {
      const element = setup(
        ` <main data-region> <h2> Hello <span>world</span> </h2> </main> `,
      );
      const result = getRegionHeadings(element);
      expect(result.detailedHeadings[0].text).toContain("Hello");
      expect(result.detailedHeadings[0].text).toContain("world");
    });
    it("falls back to aria-label when textContent is empty", () => {
      const element = setup(
        ` <main data-region> <h2 aria-label="Accessible heading"></h2> </main> `,
      );
      const result = getRegionHeadings(element);
      expect(result.detailedHeadings[0].text).toBe("Accessible heading");
    });
    it("falls back to aria-label when textContent contains only whitespace", () => {
      const element = setup(
        ` <main data-region> <div role="heading" aria-level="2" aria-label="Accessible heading" > </div> </main> `,
      );
      const result = getRegionHeadings(element);
      expect(result.detailedHeadings[0].text).toBe("Accessible heading");
    });
    it("trims aria-label fallback text", () => {
      const element = setup(
        ` <main data-region> <h2 aria-label=" Accessible heading "></h2> </main> `,
      );
      const result = getRegionHeadings(element);
      expect(result.detailedHeadings[0].text).toBe("Accessible heading");
    });
    it("prefers textContent over aria-label", () => {
      const element = setup(
        ` <main data-region> <h2 aria-label="ARIA label">Visible heading</h2> </main> `,
      );
      const result = getRegionHeadings(element);
      expect(result.detailedHeadings[0].text).toBe("Visible heading");
    });
    it("returns an empty string when neither text nor aria-label exists", () => {
      const element = setup(` <main data-region> <h2></h2> </main> `);
      const result = getRegionHeadings(element);
      expect(result.detailedHeadings[0].text).toBe("");
    });
    it("returns an empty string for whitespace-only text without aria-label", () => {
      const element = setup(` <main data-region> <h2> </h2> </main> `);
      const result = getRegionHeadings(element);
      expect(result.detailedHeadings[0].text).toBe("");
    });
  });
  describe("result structure", () => {
    it("returns empty arrays when the region has no headings", () => {
      const element = setup(
        ` <main data-region> <p>No headings here.</p> </main> `,
      );
      const result = getRegionHeadings(element);
      expect(result).toEqual({ headings: [], detailedHeadings: [] });
    });
    it("returns arrays with matching lengths", () => {
      const element = setup(
        ` <main data-region> <h1>One</h1> <h2>Two</h2> <h3>Three</h3> </main> `,
      );
      const result = getRegionHeadings(element);
      expect(result.headings).toHaveLength(3);
      expect(result.detailedHeadings).toHaveLength(3);
      expect(result.headings).toHaveLength(result.detailedHeadings.length);
    });
    it("keeps headings and detailedHeadings aligned", () => {
      const element = setup(
        ` <main data-region> <h2>First</h2> <div role="heading" aria-level="4">Second</div> <h6>Third</h6> </main> `,
      );
      const result = getRegionHeadings(element);
      expect(result.headings).toEqual(["h2", "h4", "h6"]);
      expect(result.detailedHeadings.map((heading) => heading.level)).toEqual(
        result.headings,
      );
    });
    it("returns the original DOM elements", () => {
      const element = setup(
        ` <main data-region> <h2 id="heading-one">First</h2> <h3 id="heading-two">Second</h3> </main> `,
      );
      const first = element.querySelector("#heading-one");
      const second = element.querySelector("#heading-two");
      const result = getRegionHeadings(element);
      expect(result.detailedHeadings[0].element).toBe(first);
      expect(result.detailedHeadings[1].element).toBe(second);
    });
    it("returns HTMLElement instances for detailed heading elements", () => {
      const element = setup(
        ` <main data-region> <h1>Native</h1> <div role="heading" aria-level="2">ARIA</div> </main> `,
      );
      const result = getRegionHeadings(element);
      for (const heading of result.detailedHeadings) {
        expect(heading.element).toBeInstanceOf(HTMLElement);
      }
    });
  });
  describe("mixed heading types", () => {
    it("handles native and ARIA headings together", () => {
      const element = setup(
        ` <main data-region> <h1>Native one</h1> <div role="heading" aria-level="2">ARIA two</div> <h3>Native three</h3> <span role="heading" aria-level="4">ARIA four</span> </main> `,
      );
      const result = getRegionHeadings(element);
      expect(result.headings).toEqual(["h1", "h2", "h3", "h4"]);
      expect(result.detailedHeadings.map((heading) => heading.text)).toEqual([
        "Native one",
        "ARIA two",
        "Native three",
        "ARIA four",
      ]);
    });
    it("handles headings with different text strategies together", () => {
      const element = setup(
        ` <main data-region> <h1>Visible</h1> <h2 aria-label="ARIA label"></h2> <div role="heading" aria-level="3"></div> <h4> </h4> </main> `,
      );
      const result = getRegionHeadings(element);
      expect(result.detailedHeadings.map((heading) => heading.text)).toEqual([
        "Visible",
        "ARIA label",
        "",
        "",
      ]);
    });
  });
  describe("element boundaries", () => {
    it("works when the supplied element itself is a landmark", () => {
      const element = setup(` <main data-region> <h1>Main</h1> </main> `);
      const result = getRegionHeadings(element);
      expect(result.headings).toEqual(["h1"]);
    });
    it("does not require the supplied element to be a landmark", () => {
      const element = setup(
        ` <div role="region" data-region> <h2>Heading</h2> </div> `,
      );
      const result = getRegionHeadings(element);
      expect(result.headings).toEqual(["h2"]);
    });
    it("does not include headings from an ancestor landmark", () => {
      const element = setup(
        ` <main> <h1>Ancestor heading</h1> <div role="region" data-region> <h2>Current heading</h2> </div> </main> `,
      );
      const result = getRegionHeadings(element);
      expect(result.detailedHeadings.map((heading) => heading.text)).toEqual([
        "Current heading",
      ]);
    });
    it("handles multiple sibling regions independently", () => {
      document.body.innerHTML = ` <main data-region> <h1>First region</h1> </main> <main data-region> <h2>Second region</h2> </main> `;
      const regions = document.querySelectorAll("[data-region]");
      expect(getRegionHeadings(regions[0]).headings).toEqual(["h1"]);
      expect(getRegionHeadings(regions[1]).headings).toEqual(["h2"]);
    });
  });
  describe("edge cases", () => {
    it("ignores non-heading elements with aria-level but without role=heading", () => {
      const element = setup(
        ` <main data-region> <div aria-level="2">Not a heading</div> <p aria-level="3">Not a heading either</p> </main> `,
      );
      const result = getRegionHeadings(element);
      expect(result.headings).toEqual([]);
    });
    it("ignores elements with unrelated ARIA roles", () => {
      const element = setup(
        ` <main data-region> <div role="button" aria-level="2">Button</div> <div role="listitem" aria-level="3">List item</div> </main> `,
      );
      const result = getRegionHeadings(element);
      expect(result.headings).toEqual([]);
    });
    it("handles a heading containing deeply nested elements", () => {
      const element = setup(
        ` <main data-region> <h2> <span> Hello <strong>important</strong> <span>world</span> </span> </h2> </main> `,
      );
      const result = getRegionHeadings(element);
      expect(result.detailedHeadings[0].text).toContain("Hello");
      expect(result.detailedHeadings[0].text).toContain("important");
      expect(result.detailedHeadings[0].text).toContain("world");
    });
    it("handles a large number of headings", () => {
      const headings = Array.from(
        { length: 1000 },
        (_, index) => `<h2>Heading ${index}</h2>`,
      ).join("");
      const element = setup(` <main data-region> ${headings} </main> `);
      const result = getRegionHeadings(element);
      expect(result.headings).toHaveLength(1000);
      expect(result.detailedHeadings).toHaveLength(1000);
      expect(result.detailedHeadings[0].text).toBe("Heading 0");
      expect(result.detailedHeadings[999].text).toBe("Heading 999");
    });
  });
});
