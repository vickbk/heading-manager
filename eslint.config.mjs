import boundaries from "eslint-plugin-boundaries";
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

  // 3. Project Architecture Boundaries (Applies to ALL files)
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        projectService: true,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      boundaries,
    },
    settings: {
      "import/parsers": {
        "@typescript-eslint/parser": [".ts", ".tsx"],
      },
      "import/resolver": {
        "eslint-import-resolver-typescript": {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        },
      },

      // Cleaned up: Removed hallucinated "boundaries/files"
      "boundaries/elements": [
        {
          type: "src-core",
          pattern: ["src/core/*", "src/core/**", "src/core/*/**"],
          capture: ["src-core-name"],
        },
        {
          type: "src-shared",
          pattern: ["src/shared/**", "src/shared/*/**"],
          capture: ["src-shared-name"],
        },
        {
          type: "src-adapter",
          pattern: ["src/adapters/*", "src/adapters/**", "src/adapters/*/**"],
          capture: ["src-adapter-name"],
        },
        {
          type: "src-main",
          pattern: "src/main/**",
        },
        {
          type: "script-bin",
          pattern: ["src/bin/*", "scripts/bin/**", "scripts/bin/*/**"],
        },
        {
          type: "script-config",
          pattern: [
            "scripts/config/*",
            "scripts/config/**",
            "scripts/config/*/**",
          ],
        },
        {
          type: "script-core",
          pattern: ["scripts/core/*", "scripts/core/**", "scripts/core/*/**"],
          capture: ["script-core-name"],
        },
        {
          type: "script-feat",
          pattern: [
            "scripts/features/*",
            "scripts/features/**",
            "scripts/features/*/**",
          ],
          capture: ["script-feat-name"],
        },
        {
          type: "script-shared",
          pattern: [
            "scripts/shared/*",
            "scripts/shared/**",
            "scripts/shared/*/**",
          ],
        },
        {
          type: "tests",
          pattern: "tests/**", // Fixed to properly capture files inside root tests folder
        },
        // Fallbacks for root level items
        { type: "src", pattern: "src/**" },
        { type: "scripts", pattern: "scripts/**" },
      ],
    },

    rules: {
      "@typescript-eslint/no-use-before-define": [
        "warn",
        { functions: false, classes: true, variables: true },
      ],
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-shadow": "warn",

      "boundaries/dependencies": [
        "error",
        {
          default: "allow",
          policies: [
            // Block Cross-Adapter pollution
            {
              from: { element: { type: "src-adapter" } },
              disallow: { to: { element: { type: "src-adapter" } } },
              message:
                'Cross-adapter contamination: Adapter "{{from.captured.src-adapter-name}}" cannot import from adapter "{{to.captured.src-adapter-name}}".',
            },

            // Core-to-Core isolation protection
            {
              from: { element: { type: "src-core" } },
              disallow: { to: { element: { type: "src-core" } } },
              message:
                'Cross-core contamination: Core bundle "{{from.captured.src-core-name}}" cannot import from core bundle "{{to.captured.src-core-name}}".',
            },

            // Script-Feature to Script-Feature isolation protection
            {
              from: { element: { type: "script-feat" } },
              disallow: { to: { element: { type: "script-feat" } } },
              message:
                'Cross-feature contamination: Automation feature "{{from.captured.script-feat-name}}" cannot cross-import feature "{{to.captured.script-feat-name}}".',
            },

            // Script-Core to Script-Core isolation protection
            {
              from: { element: { type: "script-core" } },
              disallow: { to: { element: { type: "script-core" } } },
              message:
                'Cross-core automation contamination: "{{from.captured.script-core-name}}" cannot import from execution helper "{{to.captured.script-core-name}}".',
            },

            // FIX: Expanded Domain Violations (Because element types are mutually exclusive)
            {
              from: {
                element: {
                  type: [
                    "src",
                    "src-core",
                    "src-shared",
                    "src-adapter",
                    "src-main",
                  ],
                },
              },
              disallow: {
                to: {
                  element: {
                    type: [
                      "scripts",
                      "script-bin",
                      "script-config",
                      "script-core",
                      "script-feat",
                      "script-shared",
                    ],
                  },
                },
              },
              message:
                "Cross-domain pollution: Production source code cannot import infrastructure code ('scripts').",
            },
            {
              from: {
                element: {
                  type: [
                    "scripts",
                    "script-bin",
                    "script-config",
                    "script-core",
                    "script-feat",
                    "script-shared",
                  ],
                },
              },
              disallow: {
                to: {
                  element: {
                    type: [
                      "src",
                      "src-core",
                      "src-shared",
                      "src-adapter",
                      "src-main",
                    ],
                  },
                },
              },
              message:
                "Cross-domain pollution: Automation workflows ('scripts') cannot pull dependencies from package code ('src').",
            },

            // Layer Architecture Rules
            {
              from: { element: { type: "src-core" } },
              disallow: [
                { to: { element: { type: "src-adapter" } } },
                { to: { element: { type: "src-main" } } },
              ],
              message:
                'Layer Violation: Pure Core logic ("{{from.captured.src-core-name}}") cannot depend on consumer adapters or entrypoint routers.',
            },
            {
              from: { element: { type: "src-shared" } },
              disallow: [
                { to: { element: { type: "src-core" } } },
                { to: { element: { type: "src-adapter" } } },
                { to: { element: { type: "src-main" } } },
              ],
              message:
                "Layer Violation: Foundation primitives inside shared cannot depend on outer domain logic blocks.",
            },

            // Script Layer Dependencies
            {
              from: { element: { type: "script-config" } },
              disallow: [
                { to: { element: { type: "script-bin" } } },
                { to: { element: { type: "script-feat" } } },
                { to: { element: { type: "script-core" } } },
              ],
              message:
                "Layer Violation: Task runtime config must remain isolated and self-contained.",
            },
            {
              from: { element: { type: "script-shared" } },
              disallow: [
                { to: { element: { type: "script-bin" } } },
                { to: { element: { type: "script-feat" } } },
                { to: { element: { type: "script-core" } } },
                { to: { element: { type: "script-config" } } },
              ],
              message:
                "Layer Violation: Shared utility scripts cannot depend on core tasks or features.",
            },
            {
              from: { element: { type: "script-core" } },
              disallow: [
                { to: { element: { type: "script-feat" } } },
                { to: { element: { type: "script-bin" } } },
              ],
              message:
                "Layer Violation: Global automation infrastructure cannot depend on task implementations or binary entrypoints.",
            },
          ],
        },
      ],
    },
  },

  // 4. Production Sandbox Leak Protection (Native ESLint)
  // This explicitly EXCLUDES test files so they remain free to import test infrastructure.
  {
    files: ["src/**/*.ts", "src/**/*.tsx", "scripts/**/*.ts"],
    ignores: [
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/*.spec.ts",
      "**/*.spec.tsx",
      "**/__tests__/**",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["tests/*", "tests/**", "**/tests/**", "../**/tests/**"],
              message:
                "Leak Alert: Production application files are not allowed to import testing infrastructure tools or configurations.",
            },
          ],
        },
      ],
    },
  },
]);
