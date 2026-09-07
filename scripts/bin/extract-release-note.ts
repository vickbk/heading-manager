import { runTask } from "@vickbk/ci-tools/core";
import { extractReleaseNotes } from "@vickbk/ci-tools/releases";

await runTask(
  "extract-release-note",
  () => extractReleaseNotes({ versionTag: process.argv[2] }),
  "❌ [Release Note] Fatal Error",
);
