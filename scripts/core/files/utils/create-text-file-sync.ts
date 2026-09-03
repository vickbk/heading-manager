import fs from "node:fs";
import path from "node:path";
import { CreateTextFileOptions } from "../types";
import { DUMP_DIR } from "./config";

export function createTextFileSync({
  filePath,
  content,
  baseDir = DUMP_DIR,
  overwrite = true,
}: CreateTextFileOptions): string {
  const resolvedBase = path.resolve(baseDir);
  const fullPath = path.resolve(resolvedBase, filePath);

  // Prevent path traversal outside baseDir
  const relative = path.relative(resolvedBase, fullPath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Access denied: Target path outside "${resolvedBase}"`);
  }

  fs.mkdirSync(path.dirname(fullPath), { recursive: true });

  const flag = overwrite ? "w" : "wx"; // 'wx' fails if file already exists
  fs.writeFileSync(fullPath, content, { encoding: "utf8", flag });

  return fullPath;
}
