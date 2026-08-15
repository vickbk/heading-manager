import type { Config } from "../types";
import { getConfig } from "./get-config";

export const config = new Proxy({} as Config, {
  get(_, prop) {
    return getConfig()[prop as keyof Config];
  },
});
