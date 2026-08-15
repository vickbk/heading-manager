const regex = /\${([^}]+)}/g;

/**
 * Recursively expands environment variable placeholders such as ${GITHUB_REF_NAME}.
 * This keeps workflow values resolvable without requiring each call site to manually interpolate them.
 *
 * @param maxPasses - Maximum passes allowed before the expansion loop stops to avoid runaway iteration.
 * @returns void - Mutates the current process environment in place.
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
