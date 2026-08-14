import { runTask } from "../core/errors";
import { extractReleaseNotes } from "../features/releases/utils/extract-note";

await runTask(
  "extract-release-note",
  extractReleaseNotes,
  "[Release Note] Fatal Error",
);
