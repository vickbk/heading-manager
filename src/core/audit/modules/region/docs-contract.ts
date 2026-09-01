import { DocumentationContract } from "@/docs/types";

export const regionContract: DocumentationContract = {
  packageName: "src/core/audit/modules/region",
  sections: [
    {
      id: "architectural-boundary",
      heading: "Architectural Boundary",
      required: true,
      aliases: ["Boundary", "Module boundary"],
    },
    {
      id: "exports-and-api-reference",
      heading: "Exports & API Reference",
      required: true,
      aliases: ["API reference", "Exports & API"],
    },
    {
      id: "execution-flow",
      heading: "Execution Flow",
      required: false,
      aliases: ["Flow", "Traversal flow"],
    },
  ],
  requiredSectionIds: ["architectural-boundary", "exports-and-api-reference"],
  recommendedSectionIds: ["execution-flow"],
  preferredSectionOrder: [
    "architectural-boundary",
    "exports-and-api-reference",
    "execution-flow",
  ],
};
