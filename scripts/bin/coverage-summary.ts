import { runTask } from "@/scripts/core/errors";
import { generateCoverageSummary } from "@/scripts/features/vitest";

await runTask(
  "coverage-summary",
  generateCoverageSummary,
  "❌ [Coverage Script] Fatal Error",
);
