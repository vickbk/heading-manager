import { DocumentationContract } from "@/docs/types";
import { ReadmeSectionDiagnostic } from "../types";
import { getContractSection } from "./get-contract-section";

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
