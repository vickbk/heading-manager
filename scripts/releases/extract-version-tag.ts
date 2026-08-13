import fs from "node:fs";
import { getReleaseType } from "./utils/release-type";

export function writeDistTagToGithubOutput(): void {
  const rawTag = process.argv[2] || "";

  const githubEnv = process.env.GITHUB_ENV;

  const { releaseTag, IS_PRERELEASE } = getReleaseType(rawTag);

  if (githubEnv) {
    fs.appendFileSync(githubEnv, `DIST_TAG=${releaseTag}\n`, "utf8");
    fs.appendFileSync(githubEnv, `IS_PRERELEASE=${IS_PRERELEASE}\n`, "utf8");
  }

  console.log(`Publishing with npm dist-tag: ${releaseTag}`);
}

if (process.argv[1]?.includes("extract-version-tag")) {
  writeDistTagToGithubOutput();
}
