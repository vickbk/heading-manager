import type { Config } from "../types";
import { expandEnv } from "./expand-env";
import { getConfig } from "./get-config";

expandEnv();

export const config = new Proxy({} as Config, {
  get(_, prop) {
    return getConfig()[prop as keyof Config];
  },
});
