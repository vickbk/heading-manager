import { runTask } from "../core/errors";
import { postCoverageComment } from "../features/vitest";

runTask(
  "post-vitest-coverage",
  postCoverageComment,
  "❌ [Coverage Runner] Fatal error",
);
