import { config } from "@/scripts/config";
import fs from "node:fs";

export function writeStepSummary(content: string): void {
  const { stepSummaryFile } = config.github;
  if (stepSummaryFile) {
    fs.appendFileSync(stepSummaryFile, `${content.trim()}\n`, "utf8");
  }
}
