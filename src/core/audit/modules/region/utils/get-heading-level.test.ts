import { describe, expect, it } from "vitest";
import { getHeadingLevel } from "./index";

describe("getHeadingLevel", () => {
  const createHeading = (html: string): HTMLElement => {
    document.body.innerHTML = html;

    const heading = document.body.firstElementChild;

    if (!(heading instanceof HTMLElement)) {
      throw new Error("Heading was not created");
    }

    return heading;
  };

  describe("native headings", () => {
    it.each(["h1", "h2", "h3", "h4", "h5", "h6"])(
      "returns the native level for <%s>",
      (tagName) => {
        const heading = createHeading(`<${tagName}>Heading</${tagName}>`);

        expect(getHeadingLevel(heading)).toBe(tagName.replace("h", ""));
      },
    );
  });

  describe("valid aria-level", () => {
    it.each([
      ["1", "1"],
      ["2", "2"],
      ["3", "3"],
      ["6", "6"],
      ["7", "7"],
      ["10", "10"],
      ["100", "100"],
    ])("normalizes aria-level=%s to %s", (ariaLevel, expected) => {
      const heading = createHeading(`
        <div role="heading" aria-level="${ariaLevel}">
          Heading
        </div>
      `);

      expect(getHeadingLevel(heading)).toBe(expected);
    });

    it("allows aria-level to override the native heading level", () => {
      const heading = createHeading(`
        <h2 aria-level="4">Heading</h2>
      `);

      expect(getHeadingLevel(heading)).toBe("4");
    });

    it("trims whitespace around aria-level", () => {
      const heading = createHeading(`
        <div role="heading" aria-level="  3  ">
          Heading
        </div>
      `);

      expect(getHeadingLevel(heading)).toBe("3");
    });
  });

  describe("invalid aria-level", () => {
    it.each([
      "0",
      "-1",
      "-10",
      "+1",
      "1.5",
      "2.5",
      "abc",
      "2abc",
      "abc2",
      "",
      " ",
      "1e2",
    ])("rejects aria-level=%s", (ariaLevel) => {
      const heading = createHeading(`
        <h3 aria-level="${ariaLevel}">
          Heading
        </h3>
      `);

      expect(getHeadingLevel(heading)).toBe("3");
    });
  });

  describe("ARIA heading without a native heading level", () => {
    it("defaults to h2 when aria-level is missing", () => {
      const heading = createHeading(`
        <div role="heading">
          Heading
        </div>
      `);

      expect(getHeadingLevel(heading)).toBe("2");
    });

    it.each(["0", "-1", "abc", "1.5", "", " "])(
      "defaults to h2 for invalid aria-level=%s",
      (ariaLevel) => {
        const heading = createHeading(`
        <div role="heading" aria-level="${ariaLevel}">
          Heading
        </div>
      `);

        expect(getHeadingLevel(heading)).toBe("2");
      },
    );
  });

  describe("case normalization", () => {
    it("normalizes uppercase native heading names", () => {
      const heading = createHeading(`
        <H3>Heading</H3>
      `);

      expect(getHeadingLevel(heading)).toBe("3");
    });
  });
});
