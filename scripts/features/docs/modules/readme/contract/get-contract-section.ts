import { DocumentationContract } from "@/docs/types";

/**
 * Finds the contract entry for a specific section id.
 *
 * @param {string} sectionId - The section id to look up.
 * @param {DocumentationContract} documentationContract - The documentation
 * contract describing the valid README sections.
 * @returns {{ id: string; heading: string; aliases?: string[] } | undefined} The
 * matching contract section definition when one exists.
 */
export function getContractSection(
  sectionId: string,
  documentationContract: DocumentationContract,
) {
  return documentationContract.sections.find(
    (section) => section.id === sectionId,
  );
}
