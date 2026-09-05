/* eslint-disable boundaries/dependencies */
import { documentationContract } from "@/docs/documentation-contract";
import { runTask } from "@/scripts/core/errors";
import {
  checkReadmeFiles,
  handleReadmeCliError,
} from "@/scripts/features/docs";
import { adaptersContract } from "@/src/adapters/docs-contract";
import { playwrightAdapterContract } from "@/src/adapters/playwright/docs-contract";
import { reactAdapterContract } from "@/src/adapters/react/docs-contract";
import { reactHooksContract } from "@/src/adapters/react/hooks/docs-contract";
import { auditContract } from "@/src/core/audit/docs-contract";
import { regionContract } from "@/src/core/audit/modules/region/docs-contract";
import { coreContract } from "@/src/core/docs-contract";
import { sharedContract } from "@/src/shared/docs-contract";

await runTask(
  "readme-check",
  async () =>
    await checkReadmeFiles({
      "./README.md": documentationContract,
      "./src/shared/README.md": sharedContract,
      "./src/adapters/README.md": adaptersContract,
      "./src/adapters/react/README.md": reactAdapterContract,
      "./src/adapters/react/hooks/README.md": reactHooksContract,
      "./src/adapters/playwright/README.md": playwrightAdapterContract,
      "./src/core/README.md": coreContract,
      "./src/core/audit/README.md": auditContract,
      "./src/core/audit/modules/region/README.md": regionContract,
    }),
  handleReadmeCliError,
);
