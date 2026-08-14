import {
  commentAction,
  getComment,
  getGithubParams,
} from "@/scripts/core/github";
import { COMMENT_IDENTIFIER, getReport } from "./utils/report";

export async function postCoverageComment() {
  try {
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
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[Coverage Runner] Fatal error: ${message}`);
    process.exit(1);
  }
}

if (process.argv[1]?.includes("comments/vitest")) {
  postCoverageComment();
}
