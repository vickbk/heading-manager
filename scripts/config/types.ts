import { z, ZodError } from "zod";
import { configSchema } from "./utils/config-schema";

/**
 * Runtime configuration object derived from the validated workflow environment.
 */
export type Config = z.infer<typeof configSchema>;

/**
 * Zod validation error envelope for configuration parsing failures.
 */
export type ConfigError = ZodError<Config>;
