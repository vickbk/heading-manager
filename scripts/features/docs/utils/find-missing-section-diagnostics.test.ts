import { describe, expect, it } from "vitest";

import type { DocumentationContract } from "@/docs/types";
import { findMissingSectionDiagnostics } from "./find-missing-section-diagnostics";

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

describe("findMissingSectionDiagnostics", () => {
  it("returns diagnostics for each required contract section that is absent from the README", () => {
    const diagnostics = findMissingSectionDiagnostics(
      ["identity", "quick-start"],
      contract,
    );

    expect(diagnostics).toHaveLength(3);
    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        code: "missing-required-section",
        sectionId: "features",
        expectedHeading: "Features",
        message: 'Required README section "Features" is missing.',
      }),
    );
    expect(diagnostics.map((diagnostic) => diagnostic.sectionId)).toEqual([
      "features",
      "installation",
      "license",
    ]);
  });

  it("returns an empty array when all required sections are present", () => {
    const diagnostics = findMissingSectionDiagnostics(
      contract.requiredSectionIds,
      contract,
    );

    expect(diagnostics).toEqual([]);
  });

  it("does not mutate the input arrays or contract data", () => {
    const foundSectionIds = ["identity"];
    const snapshot = JSON.parse(JSON.stringify({ foundSectionIds, contract }));

    const diagnostics = findMissingSectionDiagnostics(
      foundSectionIds,
      contract,
    );

    expect(foundSectionIds).toEqual(snapshot.foundSectionIds);
    expect(contract).toEqual(snapshot.contract);
    expect(diagnostics.length).toBeGreaterThan(0);
  });
});
