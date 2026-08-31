type DocumentationRequirement = {
  codeBlock?: boolean;
  packageManagerCommands?: boolean;
  publicEntryPoints?: boolean;
  wcagReference?: boolean;
};
type DocumentationSection = {
  id: string;
  heading: string;
  required: boolean;
  aliases?: string[];
  requirements?: DocumentationRequirement;
};

export type DocumentationContract = {
  packageName: string;
  sections: DocumentationSection[];
  preferredSectionOrder: string[];
  requiredSectionIds: string[];
  recommendedSectionIds: string[];
};
