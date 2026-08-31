import { describe, expect, it } from "vitest";

import type { DocumentationContract } from "@/docs/types";
import { getContractSection } from "./get-contract-section";

const contract: DocumentationContract = {
  packageName: "demo-package",
  sections: [
    { id: "identity", heading: "Project Title", required: true },
    { id: "quick-start", heading: "Quick Start", required: true },
    { id: "license", heading: "License", required: true },
  ],
  preferredSectionOrder: ["identity", "quick-start", "license"],
  requiredSectionIds: ["identity", "quick-start", "license"],
  recommendedSectionIds: [],
};

describe("getContractSection", () => {
  it("returns the exact matching contract section by id", () => {
    expect(getContractSection("quick-start", contract)).toMatchObject({
      id: "quick-start",
      heading: "Quick Start",
    });
  });

  it("returns undefined when the section id is not present in the contract", () => {
    expect(getContractSection("missing-section", contract)).toBeUndefined();
  });

  it("handles empty or unknown ids safely", () => {
    expect(getContractSection("", contract)).toBeUndefined();
  });
});
