# Testing

This folder contains the testing adapters for the project. The testing stack is intentionally decoupled from the core library so consumers can opt into framework-specific assertions without top-level side effects or tree-shaking surprises.

## Available adapters

| Adapter    | Subpath import                             | Documentation                               |
| ---------- | ------------------------------------------ | ------------------------------------------- |
| Playwright | `react-heading-manager/testing/playwright` | [Playwright README](./playwright/README.md) |

The detailed Playwright setup, matcher API, examples, and TypeScript augmentation live in the adapter-specific guide above.
