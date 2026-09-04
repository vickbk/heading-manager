import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as filesModule from "@/scripts/shared/files";
import { shutConsole } from "@/tests/setup/console";
import { README_ERROR_LOG_FILE } from "./config";
import { getErrorLogContent } from "./get-error-log-content";

describe("getErrorLogContent", () => {
  const expectedPath = path.join(".dump", README_ERROR_LOG_FILE);

  beforeEach(() => {
    vi.resetAllMocks();
    shutConsole();
    vi.spyOn(filesModule, "readTextFileAsync");
    vi.spyOn(filesModule, "isNotFoundError");
  });

  describe("Successful Reading", () => {
    it("should return file content when reading succeeds", async () => {
      const mockContent = "Error: Missing heading in README.md";
      vi.mocked(filesModule.readTextFileAsync).mockResolvedValue(mockContent);

      const result = await getErrorLogContent();

      expect(filesModule.readTextFileAsync).toHaveBeenCalledTimes(1);
      expect(filesModule.readTextFileAsync).toHaveBeenCalledWith({
        filePath: expectedPath,
      });
      expect(filesModule.isNotFoundError).not.toHaveBeenCalled();
      expect(result).toBe(mockContent);
    });

    it("should return empty string when log file exists but is empty", async () => {
      vi.mocked(filesModule.readTextFileAsync).mockResolvedValue("");

      const result = await getErrorLogContent();

      expect(filesModule.readTextFileAsync).toHaveBeenCalledWith({
        filePath: expectedPath,
      });
      expect(result).toBe("");
    });
  });

  describe("Not Found Handling (ENOENT)", () => {
    it("should catch missing file error and return null when filesModule.isNotFoundError is true", async () => {
      const enoentError = new Error("ENOENT: no such file or directory");
      vi.mocked(filesModule.readTextFileAsync).mockRejectedValue(enoentError);

      const result = await getErrorLogContent();

      expect(filesModule.readTextFileAsync).toHaveBeenCalledWith({
        filePath: expectedPath,
      });
      expect(filesModule.isNotFoundError).toHaveBeenCalledTimes(1);
      expect(filesModule.isNotFoundError).toHaveBeenCalledWith(enoentError);
      expect(result).toBeNull();
    });
  });

  describe("Unexpected Error Propagation", () => {
    it("should rethrow non-ENOENT file system errors (e.g. EACCES permission denied)", async () => {
      const eaccesError = new Error("EACCES: permission denied");
      vi.mocked(filesModule.readTextFileAsync).mockRejectedValue(eaccesError);

      await expect(getErrorLogContent()).rejects.toThrow(eaccesError);

      expect(filesModule.isNotFoundError).toHaveBeenCalledWith(eaccesError);
    });

    it("should rethrow generic runtime errors", async () => {
      const genericError = new Error("Disk read failure");
      vi.mocked(filesModule.readTextFileAsync).mockRejectedValue(genericError);

      await expect(getErrorLogContent()).rejects.toThrow(genericError);
    });
  });
});
