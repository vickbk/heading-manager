import { runTask } from "../core/errors";
import { generateCoverageSummary } from "../features/vitest";

await runTask(
  "coverage-summary",
  generateCoverageSummary,
  "[Coverage Script] Fatal Error",
);
