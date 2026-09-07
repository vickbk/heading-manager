import { runTask } from "@vickbk/ci-tools/core";
import { postReadmeComment } from "@vickbk/ci-tools/docs";

await runTask(
  "post-readme-comment",
  postReadmeComment,
  "❌ [Readme Reporter] Fatal Error",
);
