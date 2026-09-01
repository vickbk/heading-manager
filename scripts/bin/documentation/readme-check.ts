/* eslint-disable boundaries/dependencies */
import { documentationContract } from "@/docs/documentation-contract";
import { runTask } from "@/scripts/core/errors";
import {
  checkReadmeFiles,
  handleReadmeCliError,
} from "@/scripts/features/docs";
import { sharedContract } from "@/src/shared/docs-contract";

await runTask(
  "readme-check",
  async () =>
    await checkReadmeFiles({
      "./README.md": documentationContract,
      "./src/shared/README.md": sharedContract,
    }),
  handleReadmeCliError,
);
