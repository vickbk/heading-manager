import { DocumentationContract } from "@/docs/types";

export const adaptersContract: DocumentationContract = {
  packageName: "src/adapters",
  sections: [
    {
      id: "folder-responsibilities",
      heading: "Folder Responsibilities",
      required: true,
      aliases: ["Adapter responsibilities", "Layer responsibilities"],
    },
    {
      id: "dependency-rules",
      heading: "Dependency Rules",
      required: true,
      aliases: ["Allowed imports", "Forbidden imports"],
    },
    {
      id: "public-adapters",
      heading: "Public Adapters",
      required: true,
      aliases: ["Public API", "Public adapter surface"],
    },
  ],
  requiredSectionIds: [
    "folder-responsibilities",
    "dependency-rules",
    "public-adapters",
  ],
  recommendedSectionIds: [],
  preferredSectionOrder: [
    "folder-responsibilities",
    "dependency-rules",
    "public-adapters",
  ],
};
