import { runTask } from "@/scripts/core/errors";
import { extractReleaseNotes } from "@/scripts/features/releases";

await runTask(
  "extract-release-note",
  extractReleaseNotes,
  "❌ [Release Note] Fatal Error",
);
