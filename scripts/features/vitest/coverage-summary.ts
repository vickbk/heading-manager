import { githubWriteEnv, writeStepSummary } from "@/scripts/core/github";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { getReport } from "./utils/report";

/**
 * Main action generator for workflow summary reports and environment outputs.
 */
export function generateCoverageSummary(
  summaryPath = path.resolve(process.cwd(), "coverage/coverage-summary.json"),
): void {
  if (!fs.existsSync(summaryPath)) {
    console.warn(`[Coverage Script] No coverage file found at ${summaryPath}`);
    writeStepSummary("No coverage summary file found.");
    return;
  }
  const { totalPct, markdownSummary } = getReport(summaryPath);

  console.log(markdownSummary);

  writeStepSummary(markdownSummary);
  githubWriteEnv({"TOTAL_PCT": totalPct});
}

if (process.argv[1]?.includes("coverage-summary")) {
  generateCoverageSummary();
}
