import { DocumentationContract } from "@/docs/types";

export const reactHooksContract: DocumentationContract = {
  packageName: "src/adapters/react/hooks",
  sections: [
    {
      id: "exports",
      heading: "Exports",
      required: true,
      aliases: ["Public exports", "Module exports"],
    },
    {
      id: "heading-ctx",
      heading: "HeadingCtx",
      required: true,
      aliases: ["Context API", "Heading context"],
    },
    {
      id: "use-heading",
      heading: "useHeading(hasH1?)",
      required: true,
      aliases: ["useHeading", "Hook API"],
    },
    {
      id: "level-propagation-flow",
      heading: "Level Propagation Flow",
      required: false,
      aliases: ["Propagation flow", "Context flow"],
    },
    {
      id: "accessibility-notes",
      heading: "Accessibility Notes",
      required: true,
      aliases: ["Accessibility rationale", "WCAG notes"],
    },
    {
      id: "related",
      heading: "Related",
      required: false,
      aliases: ["Related modules", "Further reading"],
    },
  ],
  requiredSectionIds: [
    "exports",
    "heading-ctx",
    "use-heading",
    "accessibility-notes",
  ],
  recommendedSectionIds: ["level-propagation-flow", "related"],
  preferredSectionOrder: [
    "exports",
    "heading-ctx",
    "use-heading",
    "level-propagation-flow",
    "accessibility-notes",
    "related",
  ],
};
