import { DocumentationContract } from "@/docs/types";
import { getContractSection } from "../contract";
import type { ReadmeSectionDiagnostic } from "../types";

/**
 * Produces diagnostics for any required section missing from the README.
 *
 * @param {string[]} foundSectionIds - The ids discovered in the README.
 * @param {DocumentationContract} contract - The documentation contract used for
 * validation.
 * @returns {ReadmeSectionDiagnostic[]} A list of missing-section diagnostics for
 * each required section not found.
 */
export function findMissingSectionDiagnostics(
  foundSectionIds: string[],
  contract: DocumentationContract,
): ReadmeSectionDiagnostic[] {
  return contract.requiredSectionIds.flatMap((sectionId) => {
    if (foundSectionIds.includes(sectionId)) {
      return [];
    }

    const contractSection = getContractSection(sectionId, contract);
    const expectedHeading = contractSection?.heading ?? sectionId;

    return [
      {
        code: "missing-required-section",
        sectionId,
        expectedHeading,
        message: `Required README section "${expectedHeading}" is missing.`,
      },
    ];
  });
}
