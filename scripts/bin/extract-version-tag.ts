import { runTask } from "@vickbk/ci-tools/core";
import { writeDistTagToGithubOutput } from "@vickbk/ci-tools/releases";

await runTask(
  "extract-version-tag",
  writeDistTagToGithubOutput,
  "❌ [Version tag] Fatal Error",
);
