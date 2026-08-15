import { resolveVersionTag } from "./version-tag";

/**
 * Determines whether a version is a prerelease and maps the label to a package dist-tag.
 *
 * @param tag - Version or prerelease tag provided as input.
 * @returns Metadata describing the normalized version, prerelease status, and publish tag.
 * @throws {Error} When the provided tag does not resolve to a valid version string.
 */
export function getReleaseType(tag: string) {
  const normalized = resolveVersionTag(tag);

  const hyphenIndex = normalized.indexOf("-");

  if (hyphenIndex === -1) {
    return {
      normalized,
      version: normalized,
      IS_PRERELEASE: false,
      releaseTag: "latest",
    };
  }

  const version = normalized.slice(0, hyphenIndex);
  const rawPrerelease = normalized.slice(hyphenIndex + 1);

  const dotIndex = rawPrerelease.indexOf(".");
  const releaseTag =
    dotIndex !== -1 ? rawPrerelease.slice(0, dotIndex) : rawPrerelease;

  return {
    normalized,
    version,
    IS_PRERELEASE: true,
    releaseTag: releaseTag || "latest",
  };
}
