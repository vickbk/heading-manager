import { getGithubEnv } from "../modules/env";
import { GitHubComment } from "../types";
import { getHeaders } from "./get-headers";

/**
 * Fetches a GitHub issue comment for the active pull request and matches it against a known identifier.
 *
 * @param identifier - Marker string used to find an existing coverage or workflow comment.
 * @returns The matching comment payload, or null when no existing comment matches the identifier.
 * @throws {Error} When the GitHub API request fails or the repository responds with an unsuccessful status code.
 */
export async function getCommentWithId(
  identifier: string,
): Promise<GitHubComment | null> {
  const config = await getGithubEnv();
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
