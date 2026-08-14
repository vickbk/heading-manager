import { z, ZodError } from "zod";
import { configSchema } from "./utils/config-schema";

export type Config = z.infer<typeof configSchema>;

export type ConfigError = ZodError<Config>;
