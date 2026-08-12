import fs from "node:fs";
import { resolveVersionTag } from "./utils/version-tag";

export function writeDistTagToGithubOutput(): void {
  const rawTag = process.argv[2] || "";
  const distTag = resolveVersionTag(rawTag);

  const githubEnv = process.env.GITHUB_ENV;

  if (githubEnv) {
    fs.appendFileSync(githubEnv, `DIST_TAG=${distTag}\n`, "utf8");
  }

  console.log(`Publishing with npm dist-tag: ${distTag}`);
}

if (process.argv[1]?.includes("extract-version-tag")) {
  writeDistTagToGithubOutput();
}
