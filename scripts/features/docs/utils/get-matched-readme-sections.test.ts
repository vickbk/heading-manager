import { describe, expect, it } from "vitest";

import type { DocumentationContract } from "@/docs/types";
import { getMatchedReadmeSections } from "./get-matched-readme-sections";

const contract: DocumentationContract = {
  packageName: "demo-package",
  sections: [
    { id: "identity", heading: "Project Title", required: true },
    { id: "quick-start", heading: "Quick Start", required: true },
    { id: "features", heading: "Features", required: true },
    { id: "installation", heading: "Installation", required: true },
    { id: "license", heading: "License", required: true },
  ],
  preferredSectionOrder: [
    "identity",
    "quick-start",
    "features",
    "installation",
    "license",
  ],
  requiredSectionIds: [
    "identity",
    "quick-start",
    "features",
    "installation",
    "license",
  ],
  recommendedSectionIds: [],
};

describe("getMatchedReadmeSections", () => {
  it("matches H1 and H2 headings to the documentation contract and preserves metadata", () => {
    const readme = [
      "# Project Title",
      "",
      "### Hidden Detail",
      "",
      "## Quick Start",
      "",
      "## [Features](#features)",
      "",
      "```md",
      "## Fake Heading",
      "```",
      "",
      "## License",
    ].join("\n");

    const result = getMatchedReadmeSections(readme, contract);

    expect(result.map((section) => section.id)).toEqual([
      "identity",
      "quick-start",
      "features",
      "license",
    ]);
    expect(result[0]).toMatchObject({
      level: 1,
      text: "Project Title",
      normalizedText: "project title",
      line: 1,
      raw: "# Project Title",
    });
  });

  it("ignores headings that do not match the contract and returns an empty array for empty input", () => {
    expect(getMatchedReadmeSections("", contract)).toEqual([]);
    expect(
      getMatchedReadmeSections(
        "### Not a contract heading\n## Unmatched",
        contract,
      ),
    ).toEqual([]);
  });
});
