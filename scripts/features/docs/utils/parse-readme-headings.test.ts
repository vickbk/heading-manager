import { beforeEach, describe, expect, it, vi } from "vitest";

import * as isCodeFenceModule from "./is-code-fence";
import { parseReadmeHeadings } from "./parse-readme-headings";

describe("parseReadmeHeadings", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  it("extracts H1 through H6 headings and preserves metadata", () => {
    const readme = [
      "# Project Title",
      "## Quick Start",
      "### React Application",
      "#### Nested Detail",
      "##### More Detail",
      "###### Final Detail",
    ].join("\n");

    const headings = parseReadmeHeadings(readme);

    expect(headings).toHaveLength(6);
    expect(headings.map((heading) => heading.level)).toEqual([
      1, 2, 3, 4, 5, 6,
    ]);
    expect(headings[0]).toMatchObject({
      text: "Project Title",
      normalizedText: "project title",
      line: 1,
    });
  });

  it("ignores headings inside fenced code blocks", () => {
    const readme = [
      "```md",
      "# Fake Title",
      "## Fake Section",
      "```",
      "",
      "## Real Section",
    ].join("\n");

    const headings = parseReadmeHeadings(readme);

    expect(headings).toHaveLength(1);
    expect(headings[0]).toMatchObject({
      text: "Real Section",
      level: 2,
    });
  });

  it("ignores HTML comments and markdown badge images masquerading as headings", () => {
    const readme = [
      "<!-- ## Hidden Heading -->",
      "![npm version](https://example.com/badge.svg)",
      "# Project Title",
      "## Quick Start",
    ].join("\n");

    const headings = parseReadmeHeadings(readme);

    expect(headings.map((heading) => heading.text)).toEqual([
      "Project Title",
      "Quick Start",
    ]);
  });

  it("supports both CRLF and LF line endings", () => {
    const lfReadme = ["# Title", "## Section", "### Subsection"].join("\n");
    const crlfReadme = ["# Title", "## Section", "### Subsection"].join("\r\n");

    expect(
      parseReadmeHeadings(lfReadme).map((heading) => heading.text),
    ).toEqual(["Title", "Section", "Subsection"]);
    expect(
      parseReadmeHeadings(crlfReadme).map((heading) => heading.text),
    ).toEqual(["Title", "Section", "Subsection"]);
  });

  it("accepts headings with markdown emphasis, links, and inline code", () => {
    const headings = parseReadmeHeadings(
      [
        "# Project Title",
        "## **Quick Start**",
        "## [Features](#features)",
        "## `Installation`",
      ].join("\n"),
    );

    expect(headings.map((heading) => heading.normalizedText)).toEqual([
      "project title",
      "quick start",
      "features",
      "installation",
    ]);
  });

  it("ignores headings whose cleaned text collapses to empty after markdown stripping", () => {
    const headings = parseReadmeHeadings("### **\n## ` `\n# Project Title");

    expect(headings).toEqual([
      expect.objectContaining({
        text: "Project Title",
        normalizedText: "project title",
        line: 3,
      }),
    ]);
  });

  it("handles synthetic false-positive fence detection without crashing or leaking headings", () => {
    vi.spyOn(isCodeFenceModule, "isCodeFence").mockImplementation((line) =>
      line.startsWith("###"),
    );

    expect(parseReadmeHeadings("### synthetic fence\n## Real Section")).toEqual(
      [
        expect.objectContaining({
          text: "Real Section",
          normalizedText: "real section",
        }),
      ],
    );
  });
});
