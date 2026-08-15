/**
 * Builds a required fallback value for build-time or runtime configuration checks.
 *
 * @param isBuildPhase - Indicates whether the runtime is currently in a build pipeline context.
 * @param value - The raw configuration value to preserve when it is already defined.
 * @returns The provided value, or a build placeholder fallback when the current phase is a build and no value is present.
 */
export function buildRequired(isBuildPhase: boolean, value?: string) {
  return value || (isBuildPhase ? "build-placeholder" : undefined);
}
