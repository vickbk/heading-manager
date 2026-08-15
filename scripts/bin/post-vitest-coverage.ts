import { runTask } from "@/scripts/core/errors";
import { postCoverageComment } from "@/scripts/features/vitest";

await runTask(
  "post-vitest-coverage",
  postCoverageComment,
  "❌ [Coverage Runner] Fatal error",
);
