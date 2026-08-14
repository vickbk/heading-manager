import { config } from "@/scripts/config";
import fs from "node:fs";

/**
 * Appends environment variables to the $GITHUB_ENV file for downstream workflow steps.
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
