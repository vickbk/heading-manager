import { beforeEach, describe, expect, it } from "vitest";
import { drawRegion } from "./draw-region";

describe("drawRegion", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  // Helper to mount HTML markup directly into DOM and return root element
  function mountDOM<T extends HTMLElement>(html: string): T {
    document.body.innerHTML = html.trim();
    return document.body.firstElementChild as T;
  }

  // ==========================================
  // 1. BASIC PARSING & TEXT EXTRACTION
  // ==========================================
  describe("basic parsing and text extraction", () => {
    it("extracts lowercase tagName and direct headings with trimmed text", () => {
      const root = mountDOM<HTMLElement>(`
        <main>
          <h1>   Main Heading Title   </h1>
          <h2>Subtitle</h2>
        </main>
      `);

      const region = drawRegion(root);

      expect(region.tagName).toBe("main");
      expect(region.headings).toEqual(["h1", "h2"]);
      expect(region.detailedHeadings).toEqual([
        {
          level: "h1",
          numLevel: 1,
          text: "Main Heading Title",
          element: expect.any(HTMLElement),
        },
        {
          level: "h2",
          numLevel: 2,
          text: "Subtitle",
          element: expect.any(HTMLElement),
        },
      ]);
      expect(region.children).toHaveLength(0);
    });

    it("handles elements with no headings or child regions", () => {
      const root = mountDOM<HTMLElement>(
        "<article><p>Just body text</p></article>",
      );

      const region = drawRegion(root);

      expect(region.tagName).toBe("article");
      expect(region.headings).toEqual([]);
      expect(region.detailedHeadings).toEqual([]);
      expect(region.children).toEqual([]);
    });

    it("handles empty heading tags by returning empty text strings", () => {
      const root = mountDOM<HTMLElement>(`
        <section>
          <h2></h2>
          <h3>   </h3>
        </section>
      `);

      const region = drawRegion(root);

      expect(region.headings).toEqual(["h2", "h3"]);
      expect(region.detailedHeadings![0].text).toBe("");
      expect(region.detailedHeadings![1].text).toBe("");
    });
  });

  // ==========================================
  // 2. HEADING ORDER PRESERVATION
  // ==========================================
  describe("heading order preservation", () => {
    it("preserves exact DOM document order and DOES NOT sort headings alphabetically or numerically", () => {
      const root = mountDOM<HTMLElement>(`
        <main>
          <h3>Out of Order H3</h3>
          <h1>Main H1</h1>
          <h2>Middle H2</h2>
        </main>
      `);

      const region = drawRegion(root);

      // Order must remain h3 -> h1 -> h2 as encountered in DOM
      expect(region.headings).toEqual(["h3", "h1", "h2"]);
      expect(region.detailedHeadings!.map((h) => h.level)).toEqual([
        "h3",
        "h1",
        "h2",
      ]);
      expect(region.detailedHeadings!.map((h) => h.text)).toEqual([
        "Out of Order H3",
        "Main H1",
        "Middle H2",
      ]);
    });
  });

  // ==========================================
  // 3. LANDMARK SCOPING & CONTAINER BYPASSING
  // ==========================================
  describe("landmark scoping and non-landmark container bypasses", () => {
    it("assigns headings inside non-landmark containers (<div>, <form>) to the parent landmark", () => {
      const root = mountDOM<HTMLElement>(`
        <main>
          <div class="wrapper">
            <form>
              <h2>Heading inside non-landmark wrappers</h2>
            </form>
          </div>
        </main>
      `);

      const region = drawRegion(root);

      expect(region.headings).toEqual(["h2"]);
      expect(region.detailedHeadings![0].text).toBe(
        "Heading inside non-landmark wrappers",
      );
      expect(region.children).toHaveLength(0); // <div> and <form> are not landmarks
    });

    it("DOES NOT assign headings from child landmarks to the parent landmark", () => {
      const root = mountDOM<HTMLElement>(`
        <main>
          <h1>Main Title</h1>
          <section>
            <h2>Section Subtitle</h2>
          </section>
        </main>
      `);

      const region = drawRegion(root);

      // Parent <main> should only own <h1>
      expect(region.headings).toEqual(["h1"]);
      expect(region.detailedHeadings).toHaveLength(1);
      expect(region.detailedHeadings![0].text).toBe("Main Title");

      // Child <section> should own <h2>
      expect(region.children).toHaveLength(1);
      expect(region.children[0].tagName).toBe("section");
      expect(region.children[0].headings).toEqual(["h2"]);
      expect(region.children[0].detailedHeadings![0].text).toBe(
        "Section Subtitle",
      );
    });
  });

  // ==========================================
  // 4. NESTED REGION MAPPING (TREE HIERARCHY)
  // ==========================================
  describe("nested region mapping and tree hierarchy", () => {
    it("constructs a complete multi-level landmark region tree", () => {
      const root = mountDOM<HTMLElement>(`
        <main>
          <h1>Dashboard</h1>
          <header>
            <h2>Header Title</h2>
          </header>
          <section>
            <h2>Analytics</h2>
            <article>
              <h3>Chart Widget</h3>
            </article>
          </section>
          <footer>
            <h2>Footer Info</h2>
          </footer>
        </main>
      `);

      const tree = drawRegion(root);

      expect(tree.tagName).toBe("main");
      expect(tree.headings).toEqual(["h1"]);

      // Verify immediate child regions: <header>, <section>, <footer>
      expect(tree.children).toHaveLength(3);

      const [header, section, footer] = tree.children;

      expect(header.tagName).toBe("header");
      expect(header.headings).toEqual(["h2"]);

      expect(section.tagName).toBe("section");
      expect(section.headings).toEqual(["h2"]);

      expect(footer.tagName).toBe("footer");
      expect(footer.headings).toEqual(["h2"]);

      // Verify nested child region inside section: <article>
      expect(section.children).toHaveLength(1);
      const article = section.children[0];
      expect(article.tagName).toBe("article");
      expect(article.headings).toEqual(["h3"]);
      expect(article.detailedHeadings![0].text).toBe("Chart Widget");
    });

    it("correctly identifies landmark regions nested inside non-landmark wrappers", () => {
      const root = mountDOM<HTMLElement>(`
        <main>
          <div class="layout-grid">
            <div class="card">
              <article>
                <h2>Card Article</h2>
              </article>
            </div>
          </div>
        </main>
      `);

      const tree = drawRegion(root);

      // <article> should be a direct child region of <main> despite intermediate <div> wrappers
      expect(tree.children).toHaveLength(1);
      expect(tree.children[0].tagName).toBe("article");
      expect(tree.children[0].headings).toEqual(["h2"]);
    });

    it("supports all recognized landmark tags (main, header, footer, nav, aside, section, article, legend)", () => {
      const root = mountDOM<HTMLElement>(`
        <main>
          <header></header>
          <nav></nav>
          <aside></aside>
          <section></section>
          <article></article>
          <footer></footer>
          <fieldset><legend></legend></fieldset>
        </main>
      `);

      const tree = drawRegion(root);
      const childTags = tree.children.map((c) => c.tagName);

      expect(childTags).toEqual([
        "header",
        "nav",
        "aside",
        "section",
        "article",
        "footer",
        "legend",
      ]);
    });
  });

  // ==========================================
  // 5. LIVE DOM ELEMENT REFERENCES
  // ==========================================
  describe("DOM element references", () => {
    it("attaches actual DOM Element references in detailedHeadings", () => {
      const root = mountDOM<HTMLElement>(`
        <main>
          <h1 id="target-h1">Ref Heading</h1>
        </main>
      `);

      const region = drawRegion(root);
      const expectedElement = root.querySelector("#target-h1");

      expect(region.detailedHeadings![0].element).toBe(expectedElement);
    });
  });

  // ==========================================
  // 1. ARIA ROLE IDENTIFIER FORMATTING
  // ==========================================
  describe("ARIA role parsing and identifier formatting", () => {
    it("recognizes <div role='main'> as a landmark region and formats identifier as div[role='main']", () => {
      const root = mountDOM<HTMLElement>(`
        <div role="main">
          <h1>Main Section Header</h1>
        </div>
      `);

      const region = drawRegion(root);

      expect(region.tagName).toBe('div[role="main"]');
      expect(region.headings).toEqual(["h1"]);
      expect(region.detailedHeadings![0].text).toBe("Main Section Header");
      expect(region.children).toHaveLength(0);
    });

    it("formats identifier as tag[role='...'] when role is present on native element", () => {
      const root = mountDOM<HTMLElement>(`
        <nav role="navigation">
          <h2>Primary Navigation</h2>
        </nav>
      `);

      const region = drawRegion(root);

      expect(region.tagName).toBe('nav[role="navigation"]');
      expect(region.headings).toEqual(["h2"]);
    });

    it("normalizes mixed-case role values (e.g. role='MAIN')", () => {
      const root = mountDOM<HTMLElement>(`
        <div role="MAIN">
          <h1>Case Test</h1>
        </div>
      `);

      const region = drawRegion(root);

      expect(region.tagName).toBe('div[role="main"]');
    });
  });

  // ==========================================
  // 2. NESTED ARIA LANDMARKS
  // ==========================================
  describe("nested ARIA landmark structures", () => {
    it("builds correct parent-child regions for nested div elements with ARIA roles", () => {
      const root = mountDOM<HTMLElement>(`
        <div role="main">
          <h1>Application Workspace</h1>
          <div role="navigation">
            <h2>Sidebar Nav</h2>
          </div>
          <div role="search">
            <h2>Search Filters</h2>
          </div>
        </div>
      `);

      const tree = drawRegion(root);

      expect(tree.tagName).toBe('div[role="main"]');
      expect(tree.headings).toEqual(["h1"]);
      expect(tree.children).toHaveLength(2);

      const [nav, search] = tree.children;

      expect(nav.tagName).toBe('div[role="navigation"]');
      expect(nav.headings).toEqual(["h2"]);
      expect(nav.detailedHeadings![0].text).toBe("Sidebar Nav");

      expect(search.tagName).toBe('div[role="search"]');
      expect(search.headings).toEqual(["h2"]);
      expect(search.detailedHeadings![0].text).toBe("Search Filters");
    });

    it("correctly scopes headings across mixed native HTML landmarks and explicit ARIA roles", () => {
      const root = mountDOM<HTMLElement>(`
        <main>
          <h1>Native Main Title</h1>
          <div role="navigation">
            <h2>ARIA Navigation Title</h2>
            <article>
              <h3>Native Article Title</h3>
            </article>
          </div>
          <div role="complementary">
            <h2>ARIA Sidebar</h2>
          </div>
        </main>
      `);

      const tree = drawRegion(root);

      // Root level <main>
      expect(tree.tagName).toBe("main");
      expect(tree.headings).toEqual(["h1"]);
      expect(tree.children).toHaveLength(2);

      // Level 1: main > div[role="navigation"]
      const nav = tree.children[0];
      expect(nav.tagName).toBe('div[role="navigation"]');
      expect(nav.headings).toEqual(["h2"]);
      expect(nav.children).toHaveLength(1);

      // Level 2: main > div[role="navigation"] > article
      const article = nav.children[0];
      expect(article.tagName).toBe("article");
      expect(article.headings).toEqual(["h3"]);

      // Level 1: main > div[role="complementary"]
      const sidebar = tree.children[1];
      expect(sidebar.tagName).toBe('div[role="complementary"]');
      expect(sidebar.headings).toEqual(["h2"]);
    });
  });

  // ==========================================
  // 3. SUPPORTED ARIA ROLES
  // ==========================================
  describe("all landmark ARIA roles", () => {
    it("recognizes all standard ARIA landmark roles", () => {
      const root = mountDOM<HTMLElement>(`
        <div role="main">
          <div role="banner"></div>
          <div role="contentinfo"></div>
          <div role="navigation"></div>
          <div role="complementary"></div>
          <div role="region"></div>
          <div role="search"></div>
          <div role="form"></div>
          <div role="article"></div>
        </div>
      `);

      const tree = drawRegion(root);
      const childIdentifiers = tree.children.map((child) => child.tagName);

      expect(childIdentifiers).toEqual([
        'div[role="banner"]',
        'div[role="contentinfo"]',
        'div[role="navigation"]',
        'div[role="complementary"]',
        'div[role="region"]',
        'div[role="search"]',
        'div[role="form"]',
        'div[role="article"]',
      ]);
    });
  });

  describe("drawRegion - Custom ARIA Headings & Text Resolution", () => {
    let container: HTMLElement;

    beforeEach(() => {
      container = document.createElement("div");
      document.body.appendChild(container);
      return () => {
        document.body.removeChild(container);
      };
    });

    describe("Custom ARIA Headings ([role='heading'])", () => {
      it("extracts a div with role='heading' and explicit aria-level", () => {
        container.innerHTML = `
        <main>
          <div role="heading" aria-level="2">Custom ARIA Heading</div>
        </main>
      `;

        const mainEl = container.querySelector("main")!;
        const region = drawRegion(mainEl);

        expect(region.headings).toEqual(["h2"]);
        expect(region.detailedHeadings).toHaveLength(1);
        expect(region.detailedHeadings![0]).toEqual({
          level: "h2",
          numLevel: 2,
          text: "Custom ARIA Heading",
          element: mainEl.querySelector('[role="heading"]'),
        });
      });

      it("falls back to h2 when role='heading' lacks an aria-level attribute", () => {
        container.innerHTML = `
        <main>
          <div role="heading">Unlevelled Heading</div>
          <span role="heading">Span Heading</span>
        </main>
      `;

        const mainEl = container.querySelector("main")!;
        const region = drawRegion(mainEl);

        // This is an expected behavior as defined by wai-aria
        expect(region.headings).toEqual(["h2", "h2"]);
        expect(region.detailedHeadings![0].level).toBe("h2");
        expect(region.detailedHeadings![1].level).toBe("h2");
      });

      it("allows aria-level to override native heading HTML tags", () => {
        container.innerHTML = `
        <main>
          <h3 aria-level="1">Visually H3 but Semantically H1</h3>
        </main>
      `;

        const mainEl = container.querySelector("main")!;
        const region = drawRegion(mainEl);

        expect(region.headings).toEqual(["h1"]);
        expect(region.detailedHeadings![0].level).toBe("h1");
      });

      it("preserves correct document order across mixed native and ARIA headings", () => {
        container.innerHTML = `
        <main>
          <h1>Native H1</h1>
          <div role="heading" aria-level="2">Custom H2</div>
          <h3>Native H3</h3>
          <p role="heading" aria-level="4">Custom H4</p>
        </main>
      `;

        const mainEl = container.querySelector("main")!;
        const region = drawRegion(mainEl);

        expect(region.headings).toEqual(["h1", "h2", "h3", "h4"]);
        expect(region.detailedHeadings!.map((h) => h.text)).toEqual([
          "Native H1",
          "Custom H2",
          "Native H3",
          "Custom H4",
        ]);
      });
    });

    describe("Accessible Text Resolution (textContent vs aria-label)", () => {
      it("uses textContent when present and ignores aria-label", () => {
        container.innerHTML = `
        <main>
          <div role="heading" aria-level="2" aria-label="Label Text">Visible DOM Text</div>
        </main>
      `;

        const mainEl = container.querySelector("main")!;
        const region = drawRegion(mainEl);

        expect(region.detailedHeadings![0].text).toBe("Visible DOM Text");
      });

      it("falls back to aria-label when textContent is empty", () => {
        container.innerHTML = `
        <main>
          <div role="heading" aria-level="2" aria-label="Accessible Heading Label"></div>
        </main>
      `;

        const mainEl = container.querySelector("main")!;
        const region = drawRegion(mainEl);

        expect(region.detailedHeadings![0].text).toBe(
          "Accessible Heading Label",
        );
      });

      it("falls back to aria-label when textContent contains only whitespace", () => {
        container.innerHTML = `
        <main>
          <div role="heading" aria-level="3" aria-label="Whitespace Fallback">
            
          </div>
        </main>
      `;

        const mainEl = container.querySelector("main")!;
        const region = drawRegion(mainEl);

        expect(region.detailedHeadings![0].text).toBe("Whitespace Fallback");
      });

      it("returns an empty string when both textContent and aria-label are missing", () => {
        container.innerHTML = `
        <main>
          <div role="heading" aria-level="2"></div>
        </main>
      `;

        const mainEl = container.querySelector("main")!;
        const region = drawRegion(mainEl);

        expect(region.detailedHeadings![0].text).toBe("");
      });

      it("properly trims leading and trailing whitespace from both sources", () => {
        container.innerHTML = `
        <main>
          <h1 aria-label="  Padded Label  ">  Padded Text  </h1>
          <div role="heading" aria-level="2" aria-label="  Padded Label Fallback  ">   </div>
        </main>
      `;

        const mainEl = container.querySelector("main")!;
        const region = drawRegion(mainEl);

        expect(region.detailedHeadings![0].text).toBe("Padded Text");
        expect(region.detailedHeadings![1].text).toBe("Padded Label Fallback");
      });
    });

    describe("Landmark Scope Isolation for Custom Headings", () => {
      it("does not associate nested landmark ARIA headings with parent landmark regions", () => {
        container.innerHTML = `
        <main>
          <div role="heading" aria-level="1">Main Title</div>
          <section>
            <div role="heading" aria-level="2">Section Subtitle</div>
          </section>
        </main>
      `;

        const mainEl = container.querySelector("main")!;
        const region = drawRegion(mainEl);

        // Main direct headings only
        expect(region.headings).toEqual(["h1"]);
        expect(region.detailedHeadings).toHaveLength(1);
        expect(region.detailedHeadings![0].text).toBe("Main Title");

        // Child section headings
        expect(region.children).toHaveLength(1);
        expect(region.children[0].headings).toEqual(["h2"]);
        expect(region.children[0].detailedHeadings![0].text).toBe(
          "Section Subtitle",
        );
      });
    });
  });
});
