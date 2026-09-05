import { DocumentationContract } from "@/docs/types";

export const reactAdapterContract: DocumentationContract = {
  packageName: "src/adapters/react",
  sections: [
    {
      id: "dependency-rules",
      heading: "Dependency Rules",
      required: true,
      aliases: ["Allowed imports", "Forbidden imports"],
    },
    {
      id: "public-api",
      heading: "Public API",
      required: true,
      aliases: ["Public exports", "Primary exports"],
    },
    {
      id: "heading-level-context",
      heading: "Heading-Level Context",
      required: true,
      aliases: ["Context model", "Normalized levels"],
    },
    {
      id: "usage-example",
      heading: "Usage example",
      required: false,
      aliases: ["Usage examples", "Example usage"],
    },
    {
      id: "accessibility-behavior",
      heading: "Accessibility behavior",
      required: false,
      aliases: [
        "Accessibility notes",
        "Accessibility behavior and constraints",
      ],
    },
    {
      id: "deprecated-api-migration",
      heading: "Deprecated API Migration",
      required: false,
      aliases: ["Legacy API Migration", "Migration guidance"],
    },
    {
      id: "rules-for-contributors",
      heading: "Rules for contributors",
      required: true,
      aliases: ["Contributor rules", "Guidelines for contributors"],
    },
  ],
  requiredSectionIds: [
    "dependency-rules",
    "public-api",
    "heading-level-context",
    "rules-for-contributors",
  ],
  recommendedSectionIds: [
    "usage-example",
    "accessibility-behavior",
    "deprecated-api-migration",
  ],
  preferredSectionOrder: [
    "dependency-rules",
    "public-api",
    "heading-level-context",
    "usage-example",
    "accessibility-behavior",
    "deprecated-api-migration",
    "rules-for-contributors",
  ],
};
