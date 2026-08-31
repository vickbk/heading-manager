import { beforeEach, describe, expect, it, vi } from "vitest";

import * as filesModule from "@/scripts/core/files";
import type { DocumentationContract } from "@/docs/types";
import { checkReadmeFile } from "./check-readme-file";
import { checkReadmeFiles } from "./check-readme-files";

const contract: DocumentationContract = {
  packageName: "demo-package",
  sections: [
    { id: "identity", heading: "Project Title", required: true },
    { id: "quick-start", heading: "Quick Start", required: true },
    { id: "features", heading: "Features", required: true },
    { id: "installation", heading: "Installation", required: true },
    { id: "usage", heading: "Usage", required: true },
    { id: "api", heading: "API & Entry Points", required: true },
    { id: "accessibility", heading: "Accessibility", required: true },
    { id: "diagnostics", heading: "Diagnostics", required: false },
    { id: "typescript", heading: "TypeScript Support", required: true },
    { id: "testing", heading: "Testing", required: false },
    { id: "architecture", heading: "Architecture", required: false },
    { id: "contributing", heading: "Contributing", required: false },
    { id: "changelog", heading: "Changelog", required: false },
    { id: "license", heading: "License", required: true },
  ],
  preferredSectionOrder: [
    "identity",
    "quick-start",
    "features",
    "installation",
    "usage",
    "api",
    "accessibility",
    "diagnostics",
    "typescript",
    "testing",
    "architecture",
    "contributing",
    "changelog",
    "license",
  ],
  requiredSectionIds: [
    "identity",
    "quick-start",
    "features",
    "installation",
    "usage",
    "api",
    "accessibility",
    "typescript",
    "license",
  ],
  recommendedSectionIds: [
    "diagnostics",
    "testing",
    "architecture",
    "contributing",
    "changelog",
  ],
};

describe("checkReadmeFile", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("reads the README and hands the content to checkReadmeSections", async () => {
    const readme = [
      "# Project Title",
      "",
      "## Quick Start",
      "",
      "## Features",
      "",
      "## Installation",
      "",
      "## Usage",
      "",
      "## API & Entry Points",
      "",
      "## Accessibility",
      "",
      "## TypeScript Support",
      "",
      "## License",
    ].join("\n");

    const spy = vi.spyOn(filesModule, "readTextFile").mockResolvedValue(readme);

    const result = await checkReadmeFile({ path: "./README.md", contract });

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith("./README.md");
    expect(result).toEqual({
      path: "./README.md",
      result: expect.objectContaining({
        isValid: true,
      }),
    });
  });

  it("propagates filesystem errors with the original cause intact", async () => {
    const promise = checkReadmeFile({ path: "./missing.md", contract });

    await expect(promise).rejects.toThrow(/\[IO Error\] Failed to read ".*missing\.md": ENOENT: no such file or directory/);
    await expect(promise).rejects.toHaveProperty("cause");
  });
});

describe("checkReadmeFiles", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("validates multiple README targets in parallel and returns a mapped result array", async () => {
    const validReadme = [
      "# Project Title",
      "",
      "## Quick Start",
      "",
      "## Features",
      "",
      "## Installation",
      "",
      "## Usage",
      "",
      "## API & Entry Points",
      "",
      "## Accessibility",
      "",
      "## TypeScript Support",
      "",
      "## License",
    ].join("\n");

    vi.spyOn(filesModule, "readTextFile").mockImplementation(async (filePath) => {
      if (filePath === "./README-1.md") return validReadme;
      if (filePath === "./README-2.md") return validReadme;
      throw new Error(`Unexpected path: ${filePath}`);
    });

    const results = await checkReadmeFiles(
      { path: "./README-1.md", contract },
      { path: "./README-2.md", contract },
    );

    expect(results).toHaveLength(2);
    expect(results[0]).toEqual({
      path: "./README-1.md",
      result: expect.objectContaining({ isValid: true }),
    });
    expect(results[1]).toEqual({
      path: "./README-2.md",
      result: expect.objectContaining({ isValid: true }),
    });
  });
});
