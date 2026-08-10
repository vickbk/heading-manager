import { Window } from "happy-dom";
import { describe, expect, it } from "vitest";

import { toHaveValidHeadingHierarchy } from "../helpers/to-have-valid-heading-hierarchy";

const window = new Window();
const parser = new window.DOMParser();

// Mock Playwright Locator / ElementHandle target for unit testing the matcher logic
function createMockPlaywrightTarget(htmlString: string) {
  const doc = parser.parseFromString(htmlString, "text/html");
  const targetEl = doc.body.firstElementChild || doc.body;

  return {
    locator: () => ({
      elementHandle: async () => ({
        evaluate: async (fn: (el: Element) => string) =>
          fn(targetEl as unknown as Element),
      }),
    }),
  };
}

describe("toHaveValidHeadingHierarchy Playwright Matcher", () => {
  it("returns pass: true when heading levels progress sequentially without skipping", async () => {
    const mockTarget = createMockPlaywrightTarget(`
      <main>
        <h1>Main Page Title</h1>
        <section>
          <h2>Section Title</h2>
          <article>
            <h3>Article Title</h3>
          </article>
        </section>
      </main>
    `);

    // @ts-expect-error Mock Playwright target for unit testing matcher
    const result = await toHaveValidHeadingHierarchy(mockTarget);

    expect(result.pass).toBe(true);
    expect(result.message()).toContain("No violation found");
  });

  it("returns pass: false and formatted error output when heading level is skipped (e.g. H1 -> H3)", async () => {
    const mockTarget = createMockPlaywrightTarget(`
      <main>
        <h1>Main Page Title</h1>
        <section>
          <h3>Skipped Level 3 Heading</h3>
        </section>
      </main>
    `);

    // @ts-expect-error Mock Playwright target for unit testing matcher
    const result = await toHaveValidHeadingHierarchy(mockTarget);

    expect(result.pass).toBe(false);
    expect(result.message()).toContain("Found 1 heading accessibility hierarchy violation(s)");
    expect(result.message()).toContain("Heading level skipped");
  });
});
