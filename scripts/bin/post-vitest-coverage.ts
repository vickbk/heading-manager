import { runTask } from "@vickbk/ci-tools/core";
import { postCoverageComment } from "@vickbk/ci-tools/vitest";

await runTask(
  "post-vitest-coverage",
  postCoverageComment,
  "❌ [Coverage Runner] Fatal error",
);
