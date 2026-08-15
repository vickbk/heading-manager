import { config } from "@/scripts/config";
import fs from "node:fs";
import path from "node:path";
import { ExtractReleaseNotesOptions } from "../types";
import { parseReleaseNotes } from "./changelog";
import { resolveVersionTag } from "./version-tag";

/**
 * Pure domain utility to extract release notes from CHANGELOG.md for a given version.
 *
 * @param options - Configuration options including version tag and paths
 * @returns The resolved output file path where notes were written
 */
export function extractReleaseNotes(
  options: ExtractReleaseNotesOptions = {},
): string {
  const version = resolveVersionTag(options.versionTag);

  const changelogPath = options.changelogPath
    ? path.resolve(config.cwd, options.changelogPath)
    : path.resolve(config.cwd, config.paths.changelog);
  const outputPath =
    options.outputPath ||
    path.resolve(config.cwd, config.paths.releaseChangelog);

  if (!fs.existsSync(changelogPath)) {
    throw new Error(`CHANGELOG.md not found at ${changelogPath}`);
  }

  const rawChangelog = fs.readFileSync(changelogPath, "utf8");
  const sectionContent = parseReleaseNotes(rawChangelog, version);

  const targetDir = path.dirname(outputPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  fs.writeFileSync(outputPath, `${sectionContent}\n`, "utf8");

  console.log(
    `Successfully extracted release notes for v${version} to ${outputPath}`,
  );

  return outputPath;
}
