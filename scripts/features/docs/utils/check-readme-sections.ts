import { DocumentationContract } from "@/docs/types";
import type {
  ParsedReadmeHeading,
  ReadmeSectionDiagnostic,
  ReadmeSectionValidationResult,
} from "../types";
import { getContractSection } from "./get-contract-section";
import { matchHeadingToSection } from "./match-heading-to-section";
import { parseReadmeHeadings } from "./parse-readme-headings";

export function checkReadmeSections(
  readme: string,
  documentationContract: DocumentationContract,
): ReadmeSectionValidationResult {
  const headings = parseReadmeHeadings(readme);
  const relevantHeadings = headings.filter(
    (heading) => heading.level === 1 || heading.level === 2,
  );

  const matchedSections = relevantHeadings
    .map((heading) => {
      const section = matchHeadingToSection(
        heading.text,
        documentationContract,
      );
      return section ? { ...heading, id: section.id } : null;
    })
    .filter(
      (heading): heading is ParsedReadmeHeading & { id: string } =>
        heading !== null,
    );

  const foundSectionIds = matchedSections.map((section) => section.id);
  const diagnostics: ReadmeSectionDiagnostic[] = [];

  for (const sectionId of documentationContract.requiredSectionIds) {
    if (foundSectionIds.includes(sectionId)) {
      continue;
    }

    const contractSection = getContractSection(
      sectionId,
      documentationContract,
    );
    const expectedHeading = contractSection?.heading ?? sectionId;

    diagnostics.push({
      code: "missing-required-section",
      sectionId,
      expectedHeading,
      message: `Required README section "${expectedHeading}" is missing.`,
    });
  }

  const preferredOrder = documentationContract.preferredSectionOrder;
  const orderIndex = new Map(preferredOrder.map((id, index) => [id, index]));

  for (let index = 1; index < matchedSections.length; index += 1) {
    const previousSection = matchedSections[index - 1];
    const currentSection = matchedSections[index];

    const previousIndex = orderIndex.get(previousSection.id);
    const currentIndex = orderIndex.get(currentSection.id);

    if (
      previousIndex === undefined ||
      currentIndex === undefined ||
      currentIndex >= previousIndex
    ) {
      continue;
    }

    const previousContract = getContractSection(
      previousSection.id,
      documentationContract,
    );
    const currentContract = getContractSection(
      currentSection.id,
      documentationContract,
    );

    diagnostics.push({
      code: "ordering-violation",
      sectionId: currentSection.id,
      expectedHeading: previousContract?.heading ?? previousSection.id,
      actualHeading: currentContract?.heading ?? currentSection.id,
      line: currentSection.line,
      message: `README section ordering is out of contract order: "${currentContract?.heading ?? currentSection.id}" appears before "${previousContract?.heading ?? previousSection.id}".`,
    });
  }

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
