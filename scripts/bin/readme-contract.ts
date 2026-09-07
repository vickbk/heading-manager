import type { DocumentationContract } from "@vickbk/ci-tools/docs";

export const binReadmeContract: DocumentationContract = {
  packageName: "scripts-bin",
  sections: [
    {
      id: "identity",
      heading: "CLI Entrypoints",
      required: true,
    },
    {
      id: "overview",
      heading: "Overview",
      required: true,
    },
    {
      id: "key-modules",
      heading: "Key modules",
      required: true,
    },
    {
      id: "invocation-pattern",
      heading: "Invocation pattern",
      required: true,
    },
    {
      id: "environment-prerequisites",
      heading: "Environment prerequisites",
      required: true,
    },
    {
      id: "typical-execution",
      heading: "Typical execution",
      required: true,
    },
  ],
  preferredSectionOrder: [
    "identity",
    "overview",
    "key-modules",
    "invocation-pattern",
    "environment-prerequisites",
    "typical-execution",
  ],
  requiredSectionIds: [
    "identity",
    "overview",
    "key-modules",
    "invocation-pattern",
    "environment-prerequisites",
    "typical-execution",
  ],
  recommendedSectionIds: [],
};
