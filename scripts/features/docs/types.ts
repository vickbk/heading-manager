import { DocumentationContract } from "@/docs/types";

export type ReadmeSectionDiagnostic = {
  code: "missing-required-section" | "ordering-violation";
  sectionId?: string;
  expectedHeading?: string;
  actualHeading?: string;
  line?: number;
  message: string;
};

export type ReadmeSectionValidationResult = {
  isValid: boolean;
  diagnostics: ReadmeSectionDiagnostic[];
  foundSectionIds: string[];
  missingRequiredSections: string[];
  sections: Array<{
    id: string;
    heading: string;
    level: number;
    line: number;
  }>;
};

export type ParsedReadmeHeading = {
  level: number;
  text: string;
  normalizedText: string;
  line: number;
  raw: string;
};

export type ReadmeTarget = {
  path: string;
  contract: DocumentationContract;
};

export type FileValidationResult = {
  path: string;
  result?: ReadmeSectionValidationResult;
  error?: string;
};

export type MatchedReadmeSection = ParsedReadmeHeading & { id: string };
