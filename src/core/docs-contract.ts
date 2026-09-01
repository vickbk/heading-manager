import { DocumentationContract } from "@/docs/types";

export const coreContract: DocumentationContract = {
  packageName: "src/core",
  sections: [
    {
      id: "scope",
      heading: "Scope",
      required: true,
      aliases: ["Module scope", "Package scope"],
    },
    {
      id: "dependency-rules",
      heading: "Dependency Rules",
      required: true,
      aliases: ["Allowed imports", "Forbidden imports"],
    },
    {
      id: "primary-api",
      heading: "Primary API",
      required: true,
      aliases: ["Public API", "Main API"],
    },
    {
      id: "rules-for-contributors",
      heading: "Rules for Contributors",
      required: true,
      aliases: ["Contributor rules", "Guidelines for contributors"],
    },
  ],
  requiredSectionIds: [
    "scope",
    "dependency-rules",
    "primary-api",
    "rules-for-contributors",
  ],
  recommendedSectionIds: [],
  preferredSectionOrder: [
    "scope",
    "dependency-rules",
    "primary-api",
    "rules-for-contributors",
  ],
};
