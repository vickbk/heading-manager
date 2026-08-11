import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
  // 1. Global Ignores
  globalIgnores([
    "out/**",
    "build/**",
    "dist/",
    "coverage/",
    "playwright-report/",
    "test-results/",
  ]),

  // 2. Base TypeScript Recommended Rules
  ...tseslint.configs.recommended,

  // 3. Project File Overrides & Specific Variable Rules
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        // Enable type-aware linting if tsconfig is present
        projectService: true,
      },
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
    rules: {
      // Warn on variables used before they are defined
      "@typescript-eslint/no-use-before-define": [
        "warn",
        { functions: false, classes: true, variables: true },
      ],

      // Disable core JS unused-vars to prevent false positives in TypeScript
      "no-unused-vars": "off",

      // Warn on unused variables (allows underscores as unused parameters, e.g. `_req`)
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      // Warn on undeclared/missing variables
      // Note: TypeScript compiler catches missing variables natively (TS2304).
      // Turn this on if you specifically need ESLint to catch missing global variables.
      // "no-undef": "warn",

      // Warn on shadowing variables in parent scopes
      "@typescript-eslint/no-shadow": "warn",
    },
  },
]);
