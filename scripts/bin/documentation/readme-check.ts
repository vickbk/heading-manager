import { documentationContract } from "@/docs/documentation-contract";
import { runTask } from "@/scripts/core/errors";
import { checkReadmeFiles } from "@/scripts/features/docs";

await runTask(
  "readme-check",
  async () =>
    await checkReadmeFiles({
      path: "./README.md",
      contract: documentationContract,
    }),
  "❌ [Readme Check] Fatal Error",
);
