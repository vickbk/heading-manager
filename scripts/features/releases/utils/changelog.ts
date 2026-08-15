/**
 * Extracts the markdown section for a specific version from a changelog document.
 *
 * @param changelogContent - Full changelog text to inspect.
 * @param version - Version to locate within the changelog.
 * @returns The markdown section corresponding to the requested release version.
 * @throws {Error} When the target version section cannot be found or contains no content.
 */
export function parseReleaseNotes(
  changelogContent: string,
  version: string,
): string {
  const normalizedChangelog = changelogContent.replace(/\r\n/g, "\n");
  const escapedVersion = version.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const headerRegex = new RegExp(
    `^##[^\\S\\r\\n]+\\[?v?${escapedVersion}\\]?(?:\\([^)]*\\))?(?:[^\\S\\r\\n]+.*)?$`,
    "m",
  );
  const headerMatch = headerRegex.exec(normalizedChangelog);

  if (!headerMatch) {
    throw new Error(
      `Could not find section for version "${version}" in CHANGELOG.md`,
    );
  }

  const contentStartIndex = headerMatch.index + headerMatch[0].length;
  const remainingChangelog = normalizedChangelog.slice(contentStartIndex);

  const nextHeaderIndex = remainingChangelog.search(/\n##\s+/);
  const sectionContent = (
    nextHeaderIndex !== -1
      ? remainingChangelog.slice(0, nextHeaderIndex)
      : remainingChangelog
  ).trim();

  if (!sectionContent) {
    throw new Error(
      `Found header for version "${version}", but section content is empty.`,
    );
  }

  return sectionContent;
}
