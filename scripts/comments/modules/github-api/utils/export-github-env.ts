import fs from "node:fs";
/**
 * Appends environment variables to the $GITHUB_ENV file for downstream workflow steps.
 */
export function exportGithubEnv(key: string, value: string): void {
  const envFile = process.env.GITHUB_ENV;
  if (envFile) {
    fs.appendFileSync(envFile, `${key}=${value}\n`, "utf8");
  }
}
