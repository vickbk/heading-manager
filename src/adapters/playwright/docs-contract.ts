import { DocumentationContract } from "@/docs/types";

export const playwrightAdapterContract: DocumentationContract = {
  packageName: "src/adapters/playwright",
  sections: [
    {
      id: "dependency-rules",
      heading: "Dependency Rules",
      required: true,
      aliases: ["Allowed imports", "Forbidden imports"],
    },
    {
      id: "installation-and-setup",
      heading: "Installation and setup",
      required: true,
      aliases: ["Setup", "Installation"],
    },
    {
      id: "api",
      heading: "API",
      required: true,
      aliases: ["Public API", "Matcher API"],
    },
    {
      id: "usage-examples",
      heading: "Usage examples",
      required: true,
      aliases: ["Usage example", "Examples"],
    },
    {
      id: "diagnostic-output",
      heading: "Diagnostic output",
      required: false,
      aliases: ["Failure output", "Matcher diagnostics"],
    },
  ],
  requiredSectionIds: [
    "dependency-rules",
    "installation-and-setup",
    "api",
    "usage-examples",
  ],
  recommendedSectionIds: ["diagnostic-output"],
  preferredSectionOrder: [
    "dependency-rules",
    "installation-and-setup",
    "api",
    "usage-examples",
    "diagnostic-output",
  ],
};
