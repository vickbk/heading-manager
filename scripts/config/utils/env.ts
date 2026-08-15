import type { Config } from "../types";
import { getConfig } from "./get-config";

/**
 * Proxy-based runtime config accessor that lazily resolves the validated workflow configuration.
 * The proxy ensures callers receive the current config values without manually re-reading the environment.
 */
export const config = new Proxy({} as Config, {
  get(_, prop) {
    return getConfig()[prop as keyof Config];
  },
});
