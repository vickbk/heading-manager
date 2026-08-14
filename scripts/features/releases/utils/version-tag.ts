import { config } from "@/scripts/config";

export function resolveVersionTag(
  cliArg?: string,
  env: Partial<typeof config.github> = config.github,
): string {
  const rawTag = cliArg || env.refName;

  if (!rawTag) {
    throw new Error(
      "No version tag provided. Pass as an argument or set GITHUB_REF_NAME / RELEASE_VERSION.",
    );
  }

  return normalizeVersionTag(rawTag);
}

export function normalizeVersionTag(rawTag: string): string {
  return rawTag.trim().replace(/^v/i, "");
}
