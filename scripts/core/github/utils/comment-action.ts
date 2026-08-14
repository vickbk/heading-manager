import { ApiConfig, GitHubComment } from "../types";
import { getHeaders } from "./get-headers";

export async function commentAction({
  config,
  body,
  id,
}: {
  config: ApiConfig;
  body: string;
  id: number | null;
}): Promise<GitHubComment> {
  const isPost = id === null;

  // Correct URL routing per GitHub REST API specs
  const url = isPost
    ? `https://api.github.com/repos/${config.repository}/issues/${config.prNumber}/comments`
    : `https://api.github.com/repos/${config.repository}/issues/comments/${id}`;

  const response = await fetch(url, {
    method: isPost ? "POST" : "PATCH",
    headers: getHeaders(config.token),
    body: JSON.stringify({ body }),
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
