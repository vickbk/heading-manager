export function buildRequired(isBuildPhase: boolean, value?: string) {
  return value || (isBuildPhase ? "build-placeholder" : undefined);
}
