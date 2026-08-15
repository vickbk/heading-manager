import { config } from "@/scripts/config";
import { githubWriteEnv, writeStepSummary } from "@/scripts/core/github";
import fs from "node:fs";
import path from "node:path";
import { getReport } from "./report";

/**
 * Generates the coverage summary markdown, writes it to the GitHub step summary, and exports TOTAL_PCT to $GITHUB_ENV.
 *
 * @param summaryPath - Path to the Vitest JSON coverage report.
 * @returns void - Emits workflow-visible output and updates the GitHub environment when available.
 */
export function generateCoverageSummary(
  summaryPath = path.resolve(config.cwd, config.paths.vitestReport),
): void {
  if (!fs.existsSync(summaryPath)) {
    console.warn(`[Coverage Script] No coverage file found at ${summaryPath}`);
    writeStepSummary("No coverage summary file found.");
    return;
  }
  const { totalPct, markdownSummary } = getReport(summaryPath);

  console.log(markdownSummary);

  writeStepSummary(markdownSummary);
  githubWriteEnv({ TOTAL_PCT: totalPct });
}
