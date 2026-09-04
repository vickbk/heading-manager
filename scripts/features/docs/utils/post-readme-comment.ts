import { getCommentWithId, saveComment } from "@/scripts/core/github";
import { getCommentBody } from "./get-comment-body";

export const README_COMMENT_IDENTIFIER = "<!-- readme-comment -->";
export async function postReadmeComment() {
  const [content, comment] = await Promise.all([
    getCommentBody(),
    getCommentWithId(README_COMMENT_IDENTIFIER),
  ]);

  console.log(
    comment
      ? `[Readme Reporter] Updating existing PR comment ID: ${comment.id}`
      : "[Readme Reporter] Posting new PR comment...",
  );

  await saveComment({
    body: content,
    id: comment?.id ?? null,
  });

  console.log("[Readme Reporter] Comment processed successfully.");
}
