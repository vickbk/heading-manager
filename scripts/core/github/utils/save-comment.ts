import { getGithubEnv } from "../modules/env";
import { GitHubComment } from "../types";
import { getHeaders } from "./get-headers";

/**
 * Creates or updates a pull-request comment via the GitHub Issues API.
 *
 * @param params
 *   body - The markdown body to post or patch into the PR discussion.
 *   id - Existing comment id when updating; null when creating a new comment.
 *   identifier - An optional identifier to prepend to the comment body.
 *
 * @returns The created or patched GitHub comment response payload.
 * @throws {Error} When the GitHub API response is unsuccessful after the request is sent.
 */
export async function saveComment({
  body,
  id,
  identifier = "",
}: {
  body: string;
  id: number | null;
  identifier?: string;
}): Promise<GitHubComment> {
  const config = await getGithubEnv();
  const isPost = id === null;

  const url = isPost
    ? `https://api.github.com/repos/${config.repository}/issues/${config.prNumber}/comments`
    : `https://api.github.com/repos/${config.repository}/issues/comments/${id}`;

  const normalizedIdentifier = `${identifier}\n`.trim();
  const response = await fetch(url, {
    method: isPost ? "POST" : "PATCH",
    headers: getHeaders(config.token),
    body: JSON.stringify({
      body: `${normalizedIdentifier}${body}`,
    }),
  });

  if (!response.ok) {
    console.log(
      `[CGithub API] Failed to edit comment with respose: ${await response.text()}`,
    );
    throw new Error(
      `[GitHub API] Failed to ${isPost ? "post" : "edit"} comment: HTTP ${response.status} ${response.statusText}`,
    );
  }

  return (await response.json()) as GitHubComment;
}
