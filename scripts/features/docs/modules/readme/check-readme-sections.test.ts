import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DocumentationContract } from "@/docs/types";
import { checkReadmeSections } from "./check-readme-sections";
import { getMatchedReadmeSections } from "./get-matched-readme-sections";
import { findMissingSectionDiagnostics } from "./sections/find-missing-section-diagnostics";
import { findOrderingViolationDiagnostics } from "./sections/find-ordering-violation-diagnostics";

const contract: DocumentationContract = {
  packageName: "demo-package",
  sections: [
    { id: "identity", heading: "Project Title", required: true },
    { id: "quick-start", heading: "Quick Start", required: true },
    { id: "features", heading: "Features", required: true },
    { id: "installation", heading: "Installation", required: true },
    { id: "usage", heading: "Usage", required: true },
    { id: "api", heading: "API & Entry Points", required: true },
    { id: "accessibility", heading: "Accessibility", required: true },
    { id: "diagnostics", heading: "Diagnostics", required: false },
    { id: "typescript", heading: "TypeScript Support", required: true },
    { id: "testing", heading: "Testing", required: false },
    { id: "architecture", heading: "Architecture", required: false },
    { id: "contributing", heading: "Contributing", required: false },
    { id: "changelog", heading: "Changelog", required: false },
    { id: "license", heading: "License", required: true },
  ],
  preferredSectionOrder: [
    "identity",
    "quick-start",
    "features",
    "installation",
    "usage",
    "api",
    "accessibility",
    "diagnostics",
    "typescript",
    "testing",
    "architecture",
    "contributing",
    "changelog",
    "license",
  ],
  requiredSectionIds: [
    "identity",
    "quick-start",
    "features",
    "installation",
    "usage",
    "api",
    "accessibility",
    "typescript",
    "license",
  ],
  recommendedSectionIds: [
    "diagnostics",
    "testing",
    "architecture",
    "contributing",
    "changelog",
  ],
};

describe("getMatchedReadmeSections", () => {
  it("parses and matches only level 1 and 2 headings to the contract", () => {
    const readme = [
      "# Project Title",
      "",
      "## Quick Start",
      "",
      "### Installation",
      "",
      "## Features",
      "",
      "```md",
      "## Fake Section",
      "```",
    ].join("\n");

    const matched = getMatchedReadmeSections(readme, contract);

    expect(matched.map((section) => section.id)).toEqual([
      "identity",
      "quick-start",
      "features",
    ]);
    expect(matched[0].line).toBe(1);
    expect(matched[1].line).toBe(3);
  });
});

describe("findMissingSectionDiagnostics", () => {
  it("returns missing-required-section diagnostics for absent contract sections", () => {
    const diagnostics = findMissingSectionDiagnostics(
      ["identity", "quick-start"],
      contract,
    );

    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        code: "missing-required-section",
        sectionId: "features",
        expectedHeading: "Features",
      }),
    );
    expect(diagnostics[0]).toMatchObject({
      message: 'Required README section "Features" is missing.',
    });
  });
});

describe("findOrderingViolationDiagnostics", () => {
  it("detects sequential ordering violations using the preferred contract order", () => {
    const matched = [
      {
        id: "identity",
        level: 1,
        text: "Project Title",
        normalizedText: "project title",
        line: 1,
        raw: "# Project Title",
      },
      {
        id: "license",
        level: 2,
        text: "License",
        normalizedText: "license",
        line: 3,
        raw: "## License",
      },
      {
        id: "quick-start",
        level: 2,
        text: "Quick Start",
        normalizedText: "quick start",
        line: 5,
        raw: "## Quick Start",
      },
    ];

    const diagnostics = findOrderingViolationDiagnostics(matched, contract);

    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        code: "ordering-violation",
        sectionId: "quick-start",
        line: 5,
      }),
    );
    expect(diagnostics[0]).toMatchObject({
      message:
        'README section ordering is out of contract order: "Quick Start" appears before "License".',
    });
  });
});

describe("checkReadmeSections", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("accepts a valid README that matches all required sections in the preferred order", () => {
    const readme = [
      "# Project Title",
      "",
      "## Quick Start",
      "",
      "## Features",
      "",
      "## Installation",
      "",
      "## Usage",
      "",
      "## API & Entry Points",
      "",
      "## Accessibility",
      "",
      "## Diagnostics",
      "",
      "## TypeScript Support",
      "",
      "## Testing",
      "",
      "## Architecture",
      "",
      "## Contributing",
      "",
      "## Changelog",
      "",
      "## License",
    ].join("\n");

    const result = checkReadmeSections(readme, contract);

    expect(result.isValid).toBe(true);
    expect(result.diagnostics).toEqual([]);
    expect(result.missingRequiredSections).toEqual([]);
  });

  it("accepts valid optional sections interspersed correctly with the required content", () => {
    const readme = [
      "# Project Title",
      "",
      "## Quick Start",
      "",
      "## Features",
      "",
      "## Installation",
      "",
      "## Usage",
      "",
      "## API & Entry Points",
      "",
      "## Accessibility",
      "",
      "## Diagnostics",
      "",
      "## TypeScript Support",
      "",
      "## Testing",
      "",
      "## License",
    ].join("\n");

    const result = checkReadmeSections(readme, contract);

    expect(result.isValid).toBe(true);
    expect(result.diagnostics).toEqual([]);
    expect(result.missingRequiredSections).toEqual([]);
  });

  it("matches headings containing markdown emphasis, links, and inline code", () => {
    const readme = [
      "# Project Title",
      "",
      "## **Quick Start**",
      "",
      "## [Features](#features)",
      "",
      "## `Installation`",
      "",
      "## Usage",
      "",
      "## API & Entry Points",
      "",
      "## Accessibility",
      "",
      "## TypeScript Support",
      "",
      "## License",
    ].join("\n");

    const result = checkReadmeSections(readme, contract);

    expect(result.isValid).toBe(true);
    expect(result.missingRequiredSections).toEqual([]);
    expect(result.foundSectionIds).toEqual(
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

  it("reports missing single or multiple required sections as missing-required-section diagnostics", () => {
    const readme = [
      "# Project Title",
      "",
      "## Quick Start",
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
    ].join("\n");

    const result = checkReadmeSections(readme, contract);

    expect(result.isValid).toBe(false);
    expect(result.missingRequiredSections).toEqual(
      expect.arrayContaining(["api", "typescript"]),
    );
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: "missing-required-section",
        sectionId: "api",
        expectedHeading: "API & Entry Points",
      }),
    );
  });

  it("reports ordering violations with the correct line number", () => {
    const readme = [
      "# Project Title",
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
      "## API & Entry Points",
      "",
      "## Accessibility",
      "",
      "## TypeScript Support",
    ].join("\n");

    const result = checkReadmeSections(readme, contract);

    expect(result.isValid).toBe(false);
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: "ordering-violation",
        sectionId: "quick-start",
        line: 5,
      }),
    );
  });

  it("ignores headings inside fenced code blocks", () => {
    const readme = [
      "# Project Title",
      "",
      "## Quick Start",
      "",
      "```md",
      "## Fake Quick Start",
      "### Fake Subheading",
      "```",
      "",
      "## Features",
      "",
      "## Installation",
      "",
      "## Usage",
      "",
      "## API & Entry Points",
      "",
      "## Accessibility",
      "",
      "## TypeScript Support",
      "",
      "## License",
    ].join("\n");

    const result = checkReadmeSections(readme, contract);

    expect(result.isValid).toBe(true);
    expect(result.missingRequiredSections).toEqual([]);
    expect(result.diagnostics).toEqual([]);
  });

  it("ignores HTML comments containing markdown headers", () => {
    const readme = [
      "<!-- ## Hidden Heading -->",
      "# Project Title",
      "",
      "## Quick Start",
      "",
      "## Features",
      "",
      "## Installation",
      "",
      "## Usage",
      "",
      "## API & Entry Points",
      "",
      "## Accessibility",
      "",
      "## TypeScript Support",
      "",
      "## License",
    ].join("\n");

    const result = checkReadmeSections(readme, contract);

    expect(result.isValid).toBe(true);
    expect(result.diagnostics).toEqual([]);
  });

  it("does not treat H3/H4 headings as top-level required section matches", () => {
    const readme = [
      "# Project Title",
      "",
      "## Quick Start",
      "",
      "### Installation",
      "",
      "## Features",
      "",
      "## Usage",
      "",
      "## API & Entry Points",
      "",
      "## Accessibility",
      "",
      "## TypeScript Support",
      "",
      "## License",
    ].join("\n");

    const result = checkReadmeSections(readme, contract);

    expect(result.missingRequiredSections).toEqual(
      expect.arrayContaining(["installation"]),
    );
  });

  it("handles CRLF and LF line endings consistently", () => {
    const readme = [
      "# Project Title",
      "",
      "## Quick Start",
      "",
      "## Features",
      "",
      "## Installation",
      "",
      "## Usage",
      "",
      "## API & Entry Points",
      "",
      "## Accessibility",
      "",
      "## TypeScript Support",
      "",
      "## License",
    ].join("\r\n");

    const result = checkReadmeSections(readme, contract);

    expect(result.isValid).toBe(true);
  });

  it("returns a structured failure for empty and whitespace-only content", () => {
    const emptyResult = checkReadmeSections("", contract);
    const whitespaceResult = checkReadmeSections("   \n\t  ", contract);

    expect(emptyResult.isValid).toBe(false);
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
    expect(whitespaceResult.isValid).toBe(false);
    expect(whitespaceResult.diagnostics.length).toBeGreaterThan(0);
  });
});
