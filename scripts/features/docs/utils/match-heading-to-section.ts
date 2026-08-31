import { DocumentationContract } from "@/docs/types";
import { normalizeHeadingText } from "./normalize-heading-text";

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
