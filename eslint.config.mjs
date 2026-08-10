import { defineConfig, globalIgnores } from "eslint/config";
import { parser, plugin } from "typescript-eslint";

const eslintConfig = defineConfig([
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:

    "out/**",
    "build/**",
    "coverage/",
    "playwright-report/",
    "test-results/",
  ]),
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": plugin,
    },
    settings: {
      // 2. The crucial piece: instructs ESLint resolution engines
      // to read your tsconfig.json compilerOptions.paths
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          // Point to your config if it's named differently,
          // but true defaults to checking the root tsconfig.json
        },
      },
    },
  },
]);

export default eslintConfig;
