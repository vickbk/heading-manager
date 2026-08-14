import { githubWriteEnv } from "@/scripts/core/github";
import { assertVersionMatch } from "./assert-version";
import { getReleaseType } from "./release-type";

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
