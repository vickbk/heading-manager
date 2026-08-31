import { DocumentationContract } from "@/docs/types";
import { getMatchedReadmeSections } from "./get-matched-readme-sections";
import {
  findMissingSectionDiagnostics,
  findOrderingViolationDiagnostics,
} from "./sections";
import type { ReadmeSectionValidationResult } from "./types";

/**
 * Validates a README body against a documentation contract.
 *
 * @param {string} readme - The README content to validate.
 * @param {DocumentationContract} documentationContract - The contract defining the
 * required and preferred sections.
 * @returns {ReadmeSectionValidationResult} The aggregated validation result,
 * including diagnostics, found ids, and section summaries.
 */
export function checkReadmeSections(
  readme: string,
  documentationContract: DocumentationContract,
): ReadmeSectionValidationResult {
  const matchedSections = getMatchedReadmeSections(
    readme,
    documentationContract,
  );
  const foundSectionIds = matchedSections.map((section) => section.id);
  const diagnostics = [
    ...findMissingSectionDiagnostics(foundSectionIds, documentationContract),
    ...findOrderingViolationDiagnostics(matchedSections, documentationContract),
  ];
  const sections = matchedSections.map((section) => ({
    id: section.id,
    heading: section.text,
    level: section.level,
    line: section.line,
  }));

  return {
    isValid: diagnostics.length === 0,
    diagnostics,
    foundSectionIds,
    missingRequiredSections: documentationContract.requiredSectionIds.filter(
      (sectionId) => !foundSectionIds.includes(sectionId),
    ),
    sections,
  };
}
