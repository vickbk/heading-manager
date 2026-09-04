import { isNotFoundError, readTextFileAsync } from "@/scripts/shared/files";
import path from "node:path";
import { README_ERROR_LOG_FILE } from "./config";

const LOG_FILE_PATH = path.join(".dump", README_ERROR_LOG_FILE);

export async function getErrorLogContent(): Promise<string | null> {
  try {
    return await readTextFileAsync({
      filePath: LOG_FILE_PATH,
    });
  } catch (err) {
    if (isNotFoundError(err)) {
      return null;
    }
    throw err;
  }
}
