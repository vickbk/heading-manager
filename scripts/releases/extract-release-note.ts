import { extractReleaseNotes } from "./utils/extract-note";

export function runExtractReleaseNotes(): void {
  try {
    extractReleaseNotes();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error: ${message}`);
    process.exit(1);
  }
}

if (process.argv[1]?.includes("extract-release-notes")) {
  runExtractReleaseNotes();
}
