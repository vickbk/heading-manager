import { DocumentationContract } from "@/docs/types";
import { MatchedReadmeSection } from "../types";
import { matchHeadingToSection } from "./match-heading-to-section";
import { parseReadmeHeadings } from "./parse-readme-headings";

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
