import {
  commentAction,
  getComment,
  getGithubParams,
} from "@/scripts/core/github";
import { COMMENT_IDENTIFIER, getReport } from "./report";

/**
 * Posts a new or updates an existing sticky GitHub pull-request coverage comment for the current workflow run.
 *
 * @returns Promise<void> - Resolves after the coverage comment is created or patched.
 * @throws {Error} When the required GitHub workflow metadata or report data cannot be loaded.
 */
export async function postCoverageComment() {
  const config = getGithubParams();
  const report = getReport(undefined, config.repository, config.runId);
  const comment = await getComment(config, COMMENT_IDENTIFIER);

  console.log(
    comment
      ? `[Coverage Runner] Updating existing PR comment ID: ${comment.id}`
      : "[Coverage Runner] Posting new PR comment...",
  );
  await commentAction({
    config,
    body: report.commentBody,
    id: comment?.id ?? null,
  });
  console.log("[Coverage Runner] Comment processed successfully.");
}
