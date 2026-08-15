import { config } from "@/scripts/config";
import fs from "node:fs";

/**
 * Appends key/value pairs to the GitHub Actions environment file so downstream workflow steps can consume them.
 *
 * @param vars - Environment variables to persist for later steps in the workflow.
 * @returns void - Writes the payload to $GITHUB_ENV when the file path is available.
 * @throws {NodeJS.ErrnoException} When the destination environment file cannot be written.
 */
export function githubWriteEnv(
  vars: Record<string, string | boolean | number>,
): void {
  const envFile = config.github.envPath;
  if (!envFile) return;

  const entries = Object.entries(vars);
  if (entries.length === 0) return;

  const payload =
    entries.map(([key, value]) => `${key}=${value}`).join("\n") + "\n";
  fs.appendFileSync(envFile, payload, "utf8");
}
