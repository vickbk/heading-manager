import { config } from "@/scripts/config";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { ExtractReleaseNotesOptions } from "../types";
import { parseReleaseNotes } from "./changelog";
import { resolveVersionTag } from "./version-tag";

export function extractReleaseNotes(
  options: ExtractReleaseNotesOptions = {},
): string {
  const version = resolveVersionTag(options.versionTag || process.argv[2]);

  const changelogPath =
    options.changelogPath || path.resolve(config.cwd, config.paths.changelog);
  const outputPath =
    options.outputPath ||
    path.resolve(config.cwd, config.paths.releaseChangelog);

  if (!fs.existsSync(changelogPath)) {
    throw new Error(`CHANGELOG.md not found at ${changelogPath}`);
  }

  const rawChangelog = fs.readFileSync(changelogPath, "utf8");
  const sectionContent = parseReleaseNotes(rawChangelog, version);

  fs.writeFileSync(outputPath, `${sectionContent}\n`, "utf8");

  console.log(
    `Successfully extracted release notes for v${version} to ${outputPath}`,
  );

  return outputPath;
}
