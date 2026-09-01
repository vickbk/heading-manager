import { documentationContract } from "@/docs/documentation-contract";
import { runTask } from "@/scripts/core/errors";
import {
  checkReadmeFiles,
  handleReadmeCliError,
} from "@/scripts/features/docs";

await runTask(
  "readme-check",
  async () =>
    await checkReadmeFiles({
      "./README.md": documentationContract,
    }),
  handleReadmeCliError,
);
