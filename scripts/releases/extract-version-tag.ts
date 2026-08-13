import { githubWriteEnv } from "../shared/github-env";
import { assertVersionMatch } from "./utils/assert-version";
import { getReleaseType } from "./utils/release-type";

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

if (process.argv[1]?.includes("extract-version-tag")) {
  try {
    writeDistTagToGithubOutput();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`❌ ${message}`);
    process.exit(1);
  }
}
