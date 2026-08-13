import { githubWriteEnv } from "@/scripts/shared/github-env";
/**
 * Appends environment variables to the $GITHUB_ENV file for downstream workflow steps.
 */
export function exportGithubEnv(key: string, value: string): void {
  githubWriteEnv({ [key]: value });
}
