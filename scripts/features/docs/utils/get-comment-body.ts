import { config } from "@/scripts/config";
import { getErrorLogContent } from "../modules/readme";

export const SUCCESS_MESSAGE =
  "✅ Documentation check completed successfully. No issues found.";
export const SKIPPED_MESSAGE =
  "⚠️ Documentation check did not run. Cannot determine documentation status.";

export async function getCommentBody(): Promise<string> {
  if (config.docs.hasRun !== true) {
    console.log("document check has run status", config.docs.hasRun);
    return SKIPPED_MESSAGE;
  }
  return (await getErrorLogContent()) ?? SUCCESS_MESSAGE;
}
