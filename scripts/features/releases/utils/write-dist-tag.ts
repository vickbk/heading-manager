import { githubWriteEnv } from "@/scripts/core/github";
import { assertVersionMatch } from "./assert-version";
import { getReleaseType } from "./release-type";

/**
 * Derives the package dist-tag for a release, validates it against package.json, and writes the result to the GitHub environment.
 *
 * @returns void - Emits a dist-tag environment variable and logs the publish strategy.
 * @throws {Error} When the version does not match package.json or when the release metadata cannot be resolved.
 */
export function writeDistTagToGithubOutput(): void {
  const rawTag = process.argv[2] || "";

  const {
    releaseTag: DIST_TAG,
    normalized,
    IS_PRERELEASE,
  } = getReleaseType(rawTag);

  assertVersionMatch(normalized);

  githubWriteEnv({ DIST_TAG, IS_PRERELEASE });

  console.log(
    `Publishing with npm dist-tag: ${DIST_TAG}${IS_PRERELEASE ? " (Pre-release)" : ""}`,
  );
}
