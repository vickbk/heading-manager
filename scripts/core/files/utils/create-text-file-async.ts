import fs from "node:fs/promises";
import path from "node:path";
import { CreateTextFileOptions } from "../types";
import { DUMP_DIR } from "./config";

export async function createTextFileAsync({
  filePath,
  content,
  baseDir = DUMP_DIR,
  overwrite = true,
}: CreateTextFileOptions): Promise<string> {
  const resolvedBase = path.resolve(baseDir);
  const fullPath = path.resolve(resolvedBase, filePath);

  const relative = path.relative(resolvedBase, fullPath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Access denied: Target path outside "${resolvedBase}"`);
  }

  await fs.mkdir(path.dirname(fullPath), { recursive: true });

  const flag = overwrite ? "w" : "wx";
  await fs.writeFile(fullPath, content, { encoding: "utf8", flag });

  return fullPath;
}
