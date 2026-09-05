import { runTask } from "@/scripts/core/errors";
import { postReadmeComment } from "@/scripts/features/docs";

await runTask(
  "post-readme-comment",
  postReadmeComment,
  "❌ [Readme Reporter] Fatal Error",
);
