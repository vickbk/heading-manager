import { runTask } from "@/scripts/core/errors";
import { extractReleaseNotes } from "@/scripts/features/releases";

await runTask(
  "extract-release-note",
  () => extractReleaseNotes({ versionTag: process.argv[2] }),
  "❌ [Release Note] Fatal Error",
);
