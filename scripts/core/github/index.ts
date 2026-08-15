/**
 * Re-exports the workflow-facing GitHub action helpers used by coverage and release automation.
 */
export { commentAction } from "./utils/comment-action";
export { getComment } from "./utils/get-comment";
export { getGithubParams } from "./utils/git-env";
export { githubWriteEnv } from "./utils/github-write-env";
export { writeStepSummary } from "./utils/write-step-summary";
