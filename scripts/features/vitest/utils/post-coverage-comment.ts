import {
  commentAction,
  getComment,
  getGithubParams,
} from "@/scripts/core/github";
import { COMMENT_IDENTIFIER, getReport } from "./report";

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
