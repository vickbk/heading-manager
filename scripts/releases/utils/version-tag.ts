export function resolveVersionTag(
  cliArg?: string,
  env: Record<string, string | undefined> = process.env,
): string {
  const rawTag = cliArg || env.GITHUB_REF_NAME || env.RELEASE_VERSION;

  if (!rawTag) {
    throw new Error(
      "No version tag provided. Pass as an argument or set GITHUB_REF_NAME / RELEASE_VERSION.",
    );
  }

  return normalizeVersionTag(rawTag);
}

export function normalizeVersionTag(rawTag: string): string {
  return rawTag.trim().replace(/^v/i, "");
}
