import { DocumentationContract } from "@/docs/types";

export const sharedContract: DocumentationContract = {
  packageName: "src/shared",
  sections: [
    {
      id: "architecture",
      heading: "Architectural Principles & Layer Boundaries",
      required: true,
      aliases: [
        "Zero Outer-Layer Dependencies",
        "Framework & Environment Agnostic",
        "Self-Contained & Deterministic",
      ],
    },
    {
      id: "directory-overview",
      heading: "Directory Overview",
      required: false,
      aliases: ["Directory Structure", "File Organization", "Codebase Layout"],
      requirements: { codeBlock: true },
    },
    {
      id: "sub-modules",
      heading: "Sub-Modules",
      required: false,
      aliases: ["dom"],
      requirements: { publicEntryPoints: true },
    },
    {
      id: "checklist",
      heading: "Checklist for Adding New Shared Primitives",
      required: true,
      aliases: [
        "zero dependencies",
        "environment-agnostic",
        "multiple boundaries",
        "standard TSDoc tags",
      ],
    },
  ],
  requiredSectionIds: ["architecture", "checklist"],
  recommendedSectionIds: ["directory-overview", "sub-modules"],
  preferredSectionOrder: [
    "architecture",
    "directory-overview",
    "sub-modules",
    "checklist",
  ],
};
