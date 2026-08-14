import { config } from "@/scripts/config";
import { githubWriteEnv, writeStepSummary } from "@/scripts/core/github";
import fs from "node:fs";
import path from "node:path";
import { getReport } from "./report";

/**
 * Main action generator for workflow summary reports and environment outputs.
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
