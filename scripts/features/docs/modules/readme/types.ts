import { DocumentationContract } from "@/docs/types";

/**
 * A single validation issue discovered while checking README section completeness or
 * ordering against the documentation contract.
 */
export type ReadmeSectionDiagnostic = {
  /** Stable diagnostic code describing the failure mode. */
  code: "missing-required-section" | "ordering-violation";
  /** Contract section id associated with the issue when known. */
  sectionId?: string;
  /** The expected heading label for the section. */
  expectedHeading?: string;
  /** The actual heading label encountered in the README. */
  actualHeading?: string;
  /** Source line number for the relevant heading, when available. */
  line?: number;
  /** User-facing diagnostic message. */
  message: string;
};

/**
 * Full validation outcome for a single README file against a contract.
 */
export type ReadmeSectionValidationResult = {
  /** Whether the README had zero validation diagnostics. */
  isValid: boolean;
  /** Ordered list of section and ordering issues discovered during validation. */
  diagnostics: ReadmeSectionDiagnostic[];
  /** Section ids found in the DOI/README match order. */
  foundSectionIds: string[];
  /** Required section ids still absent from the README. */
  missingRequiredSections: string[];
  /** Matched section summaries with source metadata. */
  sections: Array<{
    /** Contract section id. */
    id: string;
    /** Heading text extracted from the README. */
    heading: string;
    /** Markdown heading level (1 or 2). */
    level: number;
    /** Source line number where the heading appears. */
    line: number;
  }>;
};

/**
 * Parsed markdown heading metadata extracted from a README source line.
 */
export type ParsedReadmeHeading = {
  /** Heading depth from markdown syntax. */
  level: number;
  /** The text content without markdown decoration. */
  text: string;
  /** Normalized comparison key used during contract matching. */
  normalizedText: string;
  /** Source line number where the heading was found. */
  line: number;
  /** Original heading line as it appeared in the README. */
  raw: string;
};

/**
 * README heading matched to a section in the documentation contract.
 */
export type MatchedReadmeSection = ParsedReadmeHeading & { id: string };

/**
 * File and contract pair submitted to README validation.
 */
export type ReadmeTarget = {
  /** README file path to validate. */
  path: string;
  /** Contract describing the required and preferred section layout. */
  contract: DocumentationContract;
};

/**
 * Result returned by file-level README validation, including either a successful
 * validation result or the caught error object.
 */
export type FileValidationResult = {
  /** The path whose validation was attempted. */
  path: string;
  /** Successful validation result when the README passed. */
  result?: ReadmeSectionValidationResult;
  /** Error value captured during file read or validation when the check fails. */
  error?: unknown;
};
