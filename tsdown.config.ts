import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    testing: "src/__testing__/index.ts",
  },
  format: ["cjs", "esm"],
  dts: true, // Generates .d.ts bundling
  sourcemap: true,
  clean: true, // Cleans the /dist folder before building
  minify: false, // Keep readable for debugging; consumer bundlers will minify
  target: "es2025",
  treeshake: true,
  deps: {
    neverBundle: ["react", "react-dom", "happy-dom", "@playwright/test"],
  }, // Exclude peer dependencies from bundle
  banner: {
    // Preserves Next.js / React Server Components compatibility
    js: '"use client";',
  },
  outExtensions({ format }) {
    return {
      js: format === "cjs" ? ".cjs" : ".mjs",
    };
  },
});
