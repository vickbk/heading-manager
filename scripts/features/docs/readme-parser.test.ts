import { describe, expect, it } from "vitest";

import { documentationContract } from "@/docs/documentation-contract";
import { checkReadmeSections } from "./utils/check-readme-sections";
import { parseReadmeHeadings } from "./utils/parse-readme-headings";

describe("README heading parser", () => {
  it("extracts Markdown headings and preserves metadata, including nested headings", () => {
    const readme = [
      "# React Heading Manager",
      "",
      "## Quick Start",
      "",
      "### React Application",
      "",
      "## Installation",
      "",
      "```ts",
      "## Fake Heading Inside Code",
      "```",
    ].join("\n");

    const headings = parseReadmeHeadings(readme);

    expect(headings).toHaveLength(4);
    expect(headings[0]).toMatchObject({
      level: 1,
      text: "React Heading Manager",
      normalizedText: "react heading manager",
      line: 1,
    });
    expect(headings[1]).toMatchObject({
      level: 2,
      text: "Quick Start",
      normalizedText: "quick start",
      line: 3,
    });
    expect(headings[2]).toMatchObject({
      level: 3,
      text: "React Application",
      normalizedText: "react application",
      line: 5,
    });
    expect(headings[3]).toMatchObject({
      level: 2,
      text: "Installation",
      normalizedText: "installation",
      line: 7,
    });
  });

  it("ignores headings inside fenced code blocks", () => {
    const readme = [
      "```md",
      "## Quick Start",
      "### React Application",
      "```",
      "",
      "## Features",
      "",
      "```ts",
      "## Installation",
      "```",
    ].join("\n");

    const headings = parseReadmeHeadings(readme);

    expect(headings.map((heading) => heading.text)).toEqual(["Features"]);
  });

  it("handles CRLF line endings without misparsing headings", () => {
    const readme = [
      "# React Heading Manager",
      "",
      "## Quick Start",
      "",
      "## Installation",
      "",
      "## Usage",
      "",
    ].join("\r\n");

    const headings = parseReadmeHeadings(readme);

    expect(headings.map((heading) => heading.text)).toEqual([
      "React Heading Manager",
      "Quick Start",
      "Installation",
      "Usage",
    ]);
  });

  it("accepts headings with emphasis and markdown link formatting", () => {
    const readme = [
      "# React Heading Manager",
      "",
      "## **Quick Start**",
      "",
      "## [Features](#features)",
      "",
      "## Installation",
      "",
    ].join("\n");

    const headings = parseReadmeHeadings(readme);

    expect(headings.map((heading) => heading.normalizedText)).toEqual([
      "react heading manager",
      "quick start",
      "features",
      "installation",
    ]);
  });
});

describe("README section validation", () => {
  it("accepts a valid README structure matching the current contract", () => {
    const readme = [
      "# React Heading Manager",
      "",
      "## Quick Start",
      "",
      "## Features",
      "",
      "## Installation",
      "",
      "## Usage",
      "",
      "## Entry Points & Import Subpaths",
      "",
      "## Accessibility",
      "",
      "## Diagnostics",
      "",
      "## TypeScript Support",
      "",
      "## Testing",
      "",
      "## Architecture & Module Isolation Policy",
      "",
      "## Contributing",
      "",
      "## Changelog",
      "",
      "## License",
      "",
    ].join("\n");

    const result = checkReadmeSections(readme, documentationContract);

    expect(result.isValid).toBe(true);
    expect(result.diagnostics).toEqual([]);
    expect(result.missingRequiredSections).toEqual([]);
  });

  it("reports missing required sections with section IDs and expected headings", () => {
    const readme = [
      "# React Heading Manager",
      "",
      "## Features",
      "",
      "## Installation",
      "",
      "## Usage",
      "",
      "## Accessibility",
      "",
      "## License",
      "",
    ].join("\n");

    const result = checkReadmeSections(readme, documentationContract);

    expect(result.isValid).toBe(false);
    expect(result.missingRequiredSections).toEqual(
      expect.arrayContaining(["quick-start", "api", "typescript"]),
    );
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: "missing-required-section",
        sectionId: "quick-start",
        expectedHeading: "Quick Start",
      }),
    );
  });

  it("reports ordering violations when sections appear out of contract order", () => {
    const readme = [
      "# React Heading Manager",
      "",
      "## License",
      "",
      "## Quick Start",
      "",
      "## Features",
      "",
      "## Installation",
      "",
      "## Usage",
      "",
      "## Entry Points & Import Subpaths",
      "",
      "## Accessibility",
      "",
      "## TypeScript Support",
      "",
    ].join("\n");

    const result = checkReadmeSections(readme, documentationContract);

    expect(result.isValid).toBe(false);
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: "ordering-violation",
        sectionId: "quick-start",
        line: 5,
      }),
    );
  });

  it("filters nested headings out of the main README section validation result", () => {
    const readme = [
      "# React Heading Manager",
      "",
      "## Quick Start",
      "",
      "### React Application",
      "",
      "## Features",
      "",
      "## Installation",
      "",
      "## Usage",
      "",
      "## Entry Points & Import Subpaths",
      "",
      "## Accessibility",
      "",
      "## TypeScript Support",
      "",
      "## License",
      "",
    ].join("\n");

    const result = checkReadmeSections(readme, documentationContract);

    expect(result.missingRequiredSections).toEqual([]);
    expect(result.sections).toContainEqual(
      expect.objectContaining({ id: "quick-start" }),
    );
    expect(result.sections).toContainEqual(
      expect.objectContaining({ id: "features" }),
    );
    expect(result.sections).not.toContainEqual(
      expect.objectContaining({ heading: "React Application" }),
    );
  });

  it("handles empty or minimal input without throwing", () => {
    const emptyResult = checkReadmeSections("", documentationContract);

    expect(emptyResult.isValid).toBe(false);
    expect(emptyResult.diagnostics.length).toBeGreaterThan(0);
    expect(emptyResult.missingRequiredSections).toEqual(
      expect.arrayContaining([
        "identity",
        "quick-start",
        "features",
        "installation",
        "usage",
        "api",
        "accessibility",
        "typescript",
        "license",
      ]),
    );
  });

  it("does not treat markdown badges or raw HTML comment headings as section headers", () => {
    const readme = [
      "<!-- ## Hidden Heading -->",
      "# React Heading Manager",
      "",
      "![npm version](https://example.com/badge.svg)",
      "",
      "## Quick Start",
      "",
      "## Features",
      "",
      "## Installation",
      "",
      "## Usage",
      "",
      "## Entry Points & Import Subpaths",
      "",
      "## Accessibility",
      "",
      "## TypeScript Support",
      "",
      "## License",
      "",
    ].join("\n");

    const headings = parseReadmeHeadings(readme);
    const result = checkReadmeSections(readme, documentationContract);

    expect(headings.some((heading) => heading.text === "Hidden Heading")).toBe(
      false,
    );
    expect(result.missingRequiredSections).toEqual([]);
    expect(result.isValid).toBe(true);
  });
});
