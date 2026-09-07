import { runTask } from "@vickbk/ci-tools/core";
import { generateCoverageSummary } from "@vickbk/ci-tools/vitest";

await runTask(
  "coverage-summary",
  generateCoverageSummary,
  "❌ [Coverage Script] Fatal Error",
);
