import { config } from "@/scripts/config";
import fs from "node:fs";
import path from "node:path";
import { resolveVersionTag } from "./version-tag";

/**
 * Validates that the current package version matches the release tag before publishing or generating a release artifact.
 *
 * @param normalizedTagVersion - Version tag to compare against package.json.
 * @param packageJsonPath - Optional override for the package manifest path.
 * @returns The resolved normalized version if the check succeeds.
 * @throws {Error} When package.json is missing, invalid, or does not match the provided release tag.
 */
export function assertVersionMatch(
  normalizedTagVersion: string,
  packageJsonPath: string = path.resolve(config.cwd, config.paths.package),
): string {
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error(`package.json not found at ${packageJsonPath}`);
  }

  const rawPkg = fs.readFileSync(packageJsonPath, "utf8");
  const pkg = JSON.parse(rawPkg) as { version?: string };

  if (!pkg.version) {
    throw new Error(`Missing "version" field in ${packageJsonPath}`);
  }

  const pkgVersion = resolveVersionTag(pkg.version);
  const targetVersion = resolveVersionTag(normalizedTagVersion);

  if (pkgVersion !== targetVersion) {
    throw new Error(`
Version mismatch blocker!
  - Git Tag Version:   "${targetVersion}"
  - package.json:     "${pkgVersion}"
Please ensure package.json version matches the release tag before publishing.`);
  }

  return targetVersion;
}
