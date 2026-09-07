import type { DocumentationContract } from "@vickbk/ci-tools/docs";

export const scriptsReadmeContract: DocumentationContract = {
  packageName: "scripts",
  sections: [
    {
      id: "identity",
      heading: "Scripts Automation Overview",
      required: true,
    },
    {
      id: "architecture",
      heading: "Architecture map",
      required: true,
    },
    {
      id: "prerequisites",
      heading: "Prerequisites",
      required: true,
    },
    {
      id: "environment-variables",
      heading: "Environment variables",
      required: true,
    },
    {
      id: "command-reference",
      heading: "Command reference",
      required: true,
    },
    {
      id: "usage-examples",
      heading: "Usage examples",
      required: true,
    },
    {
      id: "design-principles",
      heading: "Design principles",
      required: true,
    },
    {
      id: "external-documentation",
      heading: "External Documentation",
      required: false,
    },
  ],
  preferredSectionOrder: [
    "identity",
    "architecture",
    "prerequisites",
    "environment-variables",
    "command-reference",
    "usage-examples",
    "design-principles",
    "external-documentation",
  ],
  requiredSectionIds: [
    "identity",
    "architecture",
    "prerequisites",
    "environment-variables",
    "command-reference",
    "usage-examples",
    "design-principles",
  ],
  recommendedSectionIds: ["external-documentation"],
};
