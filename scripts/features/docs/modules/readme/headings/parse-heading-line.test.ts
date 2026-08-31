import { describe, expect, it } from "vitest";

import { parseHeadingFromLine } from "./parse-heading-line";

describe("parseHeadingFromLine", () => {
  it("parses valid headings and preserves metadata", () => {
    expect(parseHeadingFromLine("## Quick Start", 3)).toEqual({
      level: 2,
      text: "Quick Start",
      normalizedText: "quick start",
      line: 3,
      raw: "## Quick Start",
    });

    expect(parseHeadingFromLine("### `[API]`", 9)).toMatchObject({
      level: 3,
      text: "[API]",
      normalizedText: "api",
      line: 9,
    });
  });

  it("returns null for non-heading lines and empty stripped content", () => {
    expect(parseHeadingFromLine("plain text", 2)).toBeNull();
    expect(parseHeadingFromLine("###   ", 4)).toBeNull();
    expect(parseHeadingFromLine("####### Too Deep", 5)).toBeNull();
  });

  it("strips markdown formatting before normalizing heading text", () => {
    expect(
      parseHeadingFromLine("## [Installation](#installation)", 7),
    ).toMatchObject({
      text: "Installation",
      normalizedText: "installation",
    });
    expect(parseHeadingFromLine("## **Accessibility**", 11)).toMatchObject({
      text: "Accessibility",
      normalizedText: "accessibility",
    });
  });
});
