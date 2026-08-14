import { ApiConfig, GitHubComment } from "../types";
import { getHeaders } from "./get-headers";

export async function getComment(
  config: ApiConfig,
  identifier: string,
): Promise<GitHubComment | null> {
  const url = `https://api.github.com/repos/${config.repository}/issues/${config.prNumber}/comments?per_page=100`;
  const response = await fetch(url, { headers: getHeaders(config.token) });

  if (!response.ok) {
    throw new Error(
      `[GitHub API] Failed to fetch comments: HTTP ${response.status} ${response.statusText}`,
    );
  }

  const comments = (await response.json()) as GitHubComment[];
  return comments.find((c) => c.body.includes(identifier)) || null;
}
