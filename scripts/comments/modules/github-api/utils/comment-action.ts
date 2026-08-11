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
  const post = id === null;
  const url = `https://api.github.com/repos/${config.repository}/issues/${config.prNumber}/comments${post ? "" : "/" + id}`;
  const response = await fetch(url, {
    method: post ? "POST" : "PATCH",
    headers: getHeaders(config.token),
    body: JSON.stringify({ body }),
  });

  if (!response.ok) {
    throw new Error(
      `[GitHub API] Failed to ${post ? "post" : "edit"} comment: HTTP ${response.status} ${response.statusText}`,
    );
  }

  return (await response.json()) as GitHubComment;
}
