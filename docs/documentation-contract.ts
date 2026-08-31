import { DocumentationContract } from "./types";

export const documentationContract: DocumentationContract = {
  packageName: "react-heading-manager",
  sections: [
    {
      id: "identity",
      heading: "React Heading Manager",
      required: true,
      aliases: ["Overview", "Introduction", "About"],
    },
    {
      id: "quick-start",
      heading: "Quick Start",
      required: true,
      aliases: ["Getting Started", "Quickstart"],
      requirements: { codeBlock: true },
    },
    {
      id: "features",
      heading: "Key Features",
      required: true,
      aliases: ["Features"],
    },
    {
      id: "installation",
      heading: "Installation",
      required: true,
      aliases: ["Install"],
      requirements: { packageManagerCommands: true },
    },
    {
      id: "usage",
      heading: "Usage",
      required: true,
      aliases: ["How to Use", "Examples"],
      requirements: { codeBlock: true },
    },
    {
      id: "api",
      heading: "Entry Points & Import Subpaths",
      required: true,
      aliases: ["API & Entry Points", "Public API", "Exports"],
      requirements: { publicEntryPoints: true },
    },
    {
      id: "accessibility",
      heading: "Accessibility",
      required: true,
      aliases: ["A11y"],
      requirements: { wcagReference: true },
    },
    {
      id: "diagnostics",
      heading: "Diagnostics",
      required: false,
      aliases: ["Error Diagnostics"],
    },
    {
      id: "typescript",
      heading: "TypeScript Support",
      required: true,
      aliases: ["TypeScript"],
    },
    {
      id: "testing",
      heading: "Testing",
      required: false,
      aliases: ["Test Suite"],
      requirements: { codeBlock: true },
    },
    {
      id: "architecture",
      heading: "Architecture & Module Isolation Policy",
      required: false,
      aliases: ["Architecture", "Module Structure"],
    },
    {
      id: "contributing",
      heading: "Contributing",
      required: false,
      aliases: ["Contribute"],
    },
    {
      id: "changelog",
      heading: "Changelog",
      required: false,
      aliases: ["Release Notes", "Changes"],
    },
    {
      id: "license",
      heading: "License",
      required: true,
      aliases: ["MIT License"],
    },
  ],
  preferredSectionOrder: [
    "identity",
    "quick-start",
    "features",
    "installation",
    "usage",
    "api",
    "accessibility",
    "diagnostics",
    "typescript",
    "testing",
    "architecture",
    "contributing",
    "changelog",
    "license",
  ],
  requiredSectionIds: [
    "identity",
    "quick-start",
    "features",
    "installation",
    "usage",
    "api",
    "accessibility",
    "typescript",
    "license",
  ],
  recommendedSectionIds: [
    "diagnostics",
    "testing",
    "architecture",
    "contributing",
    "changelog",
  ],
};

export const documentationSections = documentationContract.sections;
export const requiredDocumentationSectionIds =
  documentationContract.requiredSectionIds;
export const recommendedDocumentationSectionIds =
  documentationContract.recommendedSectionIds;
