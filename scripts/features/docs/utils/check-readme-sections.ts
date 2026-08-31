import { DocumentationContract } from "@/docs/types";
import type { ReadmeSectionValidationResult } from "../types";
import { findMissingSectionDiagnostics } from "./find-missing-section-diagnostics";
import { findOrderingViolationDiagnostics } from "./find-ordering-violation-diagnostics";
import { getMatchedReadmeSections } from "./get-matched-readme-sections";

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
