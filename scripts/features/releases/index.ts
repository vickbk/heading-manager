/**
 * Re-exports the release automation entry points used by the CLI workflow scripts.
 */
export { extractReleaseNotes } from "./utils/extract-note";
export { writeDistTagToGithubOutput } from "./utils/write-dist-tag";
