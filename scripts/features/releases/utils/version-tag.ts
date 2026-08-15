import { config } from "@/scripts/config";

/**
 * Resolves a semantic version tag from the CLI argument or GitHub environment variables.
 *
 * @param cliArg - Explicit release tag passed through the command line.
 * @param env - Environment-backed override values, defaulting to the validated workflow config.
 * @returns The normalized version string without a leading v prefix.
 * @throws {Error} When no version source is available in the CLI or GitHub environment.
 */
export function resolveVersionTag(
  cliArg?: string,
  env: Partial<typeof config.github> = config.github,
): string {
  const rawTag = cliArg || env.refName;

  if (!rawTag) {
    throw new Error(
      "No version tag provided. Pass as an argument or set GITHUB_REF_NAME / RELEASE_VERSION.",
    );
  }

  return normalizeVersionTag(rawTag);
}

/**
 * Removes a leading v or V prefix from a version tag while preserving the rest of the semantic version.
 *
 * @param rawTag - Raw tag text from environment values or CLI arguments.
 * @returns The tag text normalized for release-note and dist-tag operations.
 */
export function normalizeVersionTag(rawTag: string): string {
  return rawTag.trim().replace(/^v/i, "");
}
