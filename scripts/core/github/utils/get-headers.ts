/**
 * Builds the standard header set used for authenticated GitHub REST requests.
 *
 * @param token - GitHub token with the necessary repository or pull-request permissions.
 * @returns The HTTP request headers required by GitHub's API contract.
 */
export function getHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2026-03-10",
    "Content-Type": "application/json",
  };
}
