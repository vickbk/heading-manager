const regex = /\${([^}]+)}/g;

/**
 * Recursively expands environment variables containing ${VAR_NAME} placeholders.
 *
 * @param maxPasses Safety ceiling to prevent unbounded iterations (default: 10).
 */
export function expandEnv(maxPasses = 10): void {
  let hasChanged = true;
  let pass = 0;

  while (hasChanged && pass < maxPasses) {
    hasChanged = false;
    pass++;

    for (const key in process.env) {
      const value = process.env[key];

      if (typeof value === "string" && value.includes("${")) {
        const nextValue = value.replace(regex, (_, varName: string) => {
          return process.env[varName] ?? "";
        });

        // Only mark as changed if an actual replacement altered the string
        if (nextValue !== value) {
          process.env[key] = nextValue;
          hasChanged = true;
        }
      }
    }
  }
}
