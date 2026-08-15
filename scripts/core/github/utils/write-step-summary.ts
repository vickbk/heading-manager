import { config } from "@/scripts/config";
import fs from "node:fs";

/**
 * Appends markdown content to the GitHub Actions step summary file when available.
 *
 * @param content - Markdown or plain text content to append to the workflow summary.
 * @returns void - Writes the summary body to $GITHUB_STEP_SUMMARY if configured.
 * @throws {NodeJS.ErrnoException} When the summary file path exists but cannot be appended to.
 */
export function writeStepSummary(content: string): void {
  const { stepSummaryFile } = config.github;
  if (stepSummaryFile) {
    fs.appendFileSync(stepSummaryFile, `${content.trim()}\n`, "utf8");
  }
}
