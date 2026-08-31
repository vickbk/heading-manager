import { DocumentationContract } from "@/docs/types";
import { normalizeHeadingText } from "../headings/normalize-heading-text";

/**
 * Resolves a README heading to the matching contract section definition.
 *
 * @param {string} headingText - The heading text extracted from the README.
 * @param {DocumentationContract} documentationContract - The documentation
 * contract describing the valid section names.
 * @returns {{ id: string; heading: string; aliases?: string[] } | undefined} The
 * matching section definition, if any.
 */
export function matchHeadingToSection(
  headingText: string,
  documentationContract: DocumentationContract,
) {
  const normalizedHeading = normalizeHeadingText(headingText);

  return documentationContract.sections.find((section) => {
    const canonicalHeading = normalizeHeadingText(section.heading);
    const aliases = (section.aliases ?? []).map((alias) =>
      normalizeHeadingText(alias),
    );

    return (
      canonicalHeading === normalizedHeading ||
      aliases.includes(normalizedHeading)
    );
  });
}
