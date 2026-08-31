import { DocumentationContract } from "@/docs/types";

export function getContractSection(
  sectionId: string,
  documentationContract: DocumentationContract,
) {
  return documentationContract.sections.find(
    (section) => section.id === sectionId,
  );
}
