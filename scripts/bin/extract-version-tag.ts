import { runTask } from "../core/errors";
import { writeDistTagToGithubOutput } from "../features/releases";

await runTask(
  "extract-version-tag",
  writeDistTagToGithubOutput,
  "❌ [Version tag] Fatal Error",
);
