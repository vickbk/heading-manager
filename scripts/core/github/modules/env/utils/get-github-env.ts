import { readJsonFile } from "@/scripts/shared/files";
import { GithubEnvData } from "../types";
import { getGithubRequireds } from "./get-github-requireds";

export async function getGithubEnv() {
  const params = getGithubRequireds();

  const { pull_request } = await readJsonFile<GithubEnvData>({
    filePath: params.envPath,
  });

  const prNumber = pull_request?.number;
  if (!prNumber) {
    throw new Error(
      "[GithubEnv] Event payload is not associated with a Pull Request.",
    );
  }
  return { ...params, prNumber };
}
