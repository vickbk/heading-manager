import { DocumentationContract } from "@/docs/types";
import type { MatchedReadmeSection } from "../../types";
import { matchHeadingToSection } from "./contract";
import { parseReadmeHeadings } from "./headings/parse-readme-headings";

/**
 * Finds the README headings that match the documentation contract.
 *
 * @param {string} readme - The raw README content.
 * @param {DocumentationContract} contract - The documentation contract to match
 * against.
 * @returns {MatchedReadmeSection[]} The matched H1/H2 headings with their section
 * ids and original source metadata.
 */
export function getMatchedReadmeSections(
  readme: string,
  contract: DocumentationContract,
): MatchedReadmeSection[] {
  return parseReadmeHeadings(readme)
    .filter((heading) => heading.level === 1 || heading.level === 2)
    .map((heading) => {
      const section = matchHeadingToSection(heading.text, contract);
      return section ? { ...heading, id: section.id } : null;
    })
    .filter((heading): heading is MatchedReadmeSection => heading !== null);
}
