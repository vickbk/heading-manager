import { DocumentationContract } from "@/docs/types";
import type { MatchedReadmeSection } from "../../types";
import { matchHeadingToSection } from "./contract";
import { parseReadmeHeadings } from "./headings/parse-readme-headings";

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
