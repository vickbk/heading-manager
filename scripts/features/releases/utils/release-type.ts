import { resolveVersionTag } from "./version-tag";

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
