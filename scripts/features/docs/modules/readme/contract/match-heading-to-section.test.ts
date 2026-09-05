import { describe, expect, it } from "vitest";

import type { DocumentationContract } from "@/docs/types";
import { matchHeadingToSection } from "./match-heading-to-section";

const contract: DocumentationContract = {
  packageName: "demo-package",
  sections: [
    { id: "identity", heading: "Project Title", required: true },
    {
      id: "quick-start",
      heading: "Quick Start",
      required: true,
      aliases: ["Getting Started"],
    },
    { id: "features", heading: "Features", required: true },
    {
      id: "installation",
      heading: "Installation",
      required: true,
      aliases: ["Install"],
    },
    { id: "usage", heading: "Usage", required: true },
    {
      id: "api",
      heading: "API & Entry Points",
      required: true,
      aliases: ["Exports"],
    },
    { id: "accessibility", heading: "Accessibility", required: true },
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
    "license",
  ],
  recommendedSectionIds: [],
};

describe("matchHeadingToSection", () => {
  it("matches the canonical heading text case-insensitively", () => {
    expect(matchHeadingToSection("quick start", contract)?.id).toBe(
      "quick-start",
    );
    expect(matchHeadingToSection("QUICK START", contract)?.id).toBe(
      "quick-start",
    );
  });

  it("matches headings with punctuation and whitespace differences", () => {
    expect(
      matchHeadingToSection("  API   &   Entry Points  ", contract)?.id,
    ).toBe("api");
    expect(matchHeadingToSection("Installation!", contract)?.id).toBe(
      "installation",
    );
  });

  it("matches configured aliases and preserves the contract section id", () => {
    expect(matchHeadingToSection("Getting Started", contract)?.id).toBe(
      "quick-start",
    );
    expect(matchHeadingToSection("Exports", contract)?.id).toBe("api");
  });

  it("returns undefined for unmatched or extraneous headings", () => {
    expect(matchHeadingToSection("Release Notes", contract)).toBeUndefined();
    expect(matchHeadingToSection("Random Heading", contract)).toBeUndefined();
  });
});
