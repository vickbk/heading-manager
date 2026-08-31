import { describe, expect, it } from "vitest";

import type { DocumentationContract } from "@/docs/types";
import { findOrderingViolationDiagnostics } from "./find-ordering-violation-diagnostics";

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

describe("findOrderingViolationDiagnostics", () => {
  it("reports a violation when a README section appears before an earlier required section in the contract order", () => {
    const matchedSections = [
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

    const diagnostics = findOrderingViolationDiagnostics(
      matchedSections,
      contract,
    );

    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        code: "ordering-violation",
        sectionId: "quick-start",
        expectedHeading: "License",
        actualHeading: "Quick Start",
        line: 5,
        message:
          'README section ordering is out of contract order: "Quick Start" appears before "License".',
      }),
    );
  });

  it("returns an empty array when sections appear in preferred contract order", () => {
    const matchedSections = [
      {
        id: "identity",
        level: 1,
        text: "Project Title",
        normalizedText: "project title",
        line: 1,
        raw: "# Project Title",
      },
      {
        id: "quick-start",
        level: 2,
        text: "Quick Start",
        normalizedText: "quick start",
        line: 3,
        raw: "## Quick Start",
      },
      {
        id: "features",
        level: 2,
        text: "Features",
        normalizedText: "features",
        line: 5,
        raw: "## Features",
      },
    ];

    expect(findOrderingViolationDiagnostics(matchedSections, contract)).toEqual(
      [],
    );
  });

  it("leaves the provided section list and contract ordering unchanged", () => {
    const matchedSections = [
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
    ];
    const snapshot = JSON.parse(JSON.stringify({ matchedSections, contract }));

    const diagnostics = findOrderingViolationDiagnostics(
      matchedSections,
      contract,
    );

    expect(matchedSections).toEqual(snapshot.matchedSections);
    expect(contract).toEqual(snapshot.contract);
    expect(diagnostics).toHaveLength(0);
  });
});
