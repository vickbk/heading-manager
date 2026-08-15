import { runTask } from "@/scripts/core/errors";
import { writeDistTagToGithubOutput } from "@/scripts/features/releases";

await runTask(
  "extract-version-tag",
  writeDistTagToGithubOutput,
  "❌ [Version tag] Fatal Error",
);
