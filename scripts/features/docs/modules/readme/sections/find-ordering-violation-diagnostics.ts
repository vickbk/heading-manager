import { DocumentationContract } from "@/docs/types";
import { getContractSection } from "../contract";
import type { MatchedReadmeSection, ReadmeSectionDiagnostic } from "../types";

/**
 * Detects ordering violations between matched README sections and the contract.
 *
 * @param {MatchedReadmeSection[]} matchedSections - The matched headings in file
 * order.
 * @param {DocumentationContract} contract - The contract defining the preferred
 * section sequence.
 * @returns {ReadmeSectionDiagnostic[]} Diagnostics describing any out-of-order
 * headings.
 */
export function findOrderingViolationDiagnostics(
  matchedSections: MatchedReadmeSection[],
  contract: DocumentationContract,
): ReadmeSectionDiagnostic[] {
  const preferredOrder = contract.preferredSectionOrder;
  const orderIndex = new Map(preferredOrder.map((id, index) => [id, index]));
  const diagnostics: ReadmeSectionDiagnostic[] = [];

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

    const previousContract = getContractSection(previousSection.id, contract);
    const currentContract = getContractSection(currentSection.id, contract);

    diagnostics.push({
      code: "ordering-violation",
      sectionId: currentSection.id,
      expectedHeading: previousContract?.heading ?? previousSection.id,
      actualHeading: currentContract?.heading ?? currentSection.id,
      line: currentSection.line,
      message: `README section ordering is out of contract order: "${currentContract?.heading ?? currentSection.id}" appears before "${previousContract?.heading ?? previousSection.id}".`,
    });
  }

  return diagnostics;
}
