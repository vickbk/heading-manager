import fs from "node:fs";

export function writeStepSummary(content: string): void {
  const stepSummaryFile = process.env.GITHUB_STEP_SUMMARY;
  if (stepSummaryFile) {
    fs.appendFileSync(stepSummaryFile, `${content.trim()}\n`, "utf8");
  }
}
