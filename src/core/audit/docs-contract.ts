import { DocumentationContract } from "@/docs/types";

export const auditContract: DocumentationContract = {
  packageName: "src/core/audit",
  sections: [
    {
      id: "purpose",
      heading: "Purpose",
      required: true,
      aliases: ["Module purpose", "Overview"],
    },
    {
      id: "dependency-policy",
      heading: "Dependency policy",
      required: true,
      aliases: ["Dependency Rules", "Allowed imports"],
    },
    {
      id: "public-audit-surface",
      heading: "Public audit surface",
      required: true,
      aliases: ["Public API", "Audit surface"],
    },
    {
      id: "example",
      heading: "Example",
      required: false,
      aliases: ["Usage example", "Example usage"],
    },
    {
      id: "wcag-interpretation",
      heading: "WCAG interpretation",
      required: true,
      aliases: [
        "WCAG interpretation and scope",
        "Accessibility interpretation",
      ],
    },
  ],
  requiredSectionIds: [
    "purpose",
    "dependency-policy",
    "public-audit-surface",
    "wcag-interpretation",
  ],
  recommendedSectionIds: ["example"],
  preferredSectionOrder: [
    "purpose",
    "dependency-policy",
    "public-audit-surface",
    "example",
    "wcag-interpretation",
  ],
};
