# README validation module

This module owns the domain logic for validating markdown README files against a documentation contract.

## Intent

The purpose of this module is to answer one question reliably: does a README contain the required sections, in the expected order, and with the expected identity?

It does this by separating the workflow into a small pipeline:

1. Parse headings from the README source.
2. Ignore content that belongs to fenced code blocks.
3. Match discovered headings to the contract metadata.
4. Detect missing required sections.
5. Detect ordering violations against the preferred sequence.
6. Return a normalized validation result for the consuming file-level utility.

## File responsibilities

### `headings/`

Contains the markdown-heading parsing utilities.

- `parse-readme-headings.ts` scans the README line by line and extracts valid H1/H2-style heading entries while ignoring fenced code blocks.
- `parse-heading-line.ts` converts a single markdown heading line into the normalized heading model.
- `clean-heading-text.ts` strips markdown decorations from heading labels.
- `normalize-heading-text.ts` generates a stable comparison key for contract matching.
- `extract-heading-match.ts` detects and extracts heading syntax.
- `parse-code-fence.ts` tracks whether the parser is inside a fenced code block.
- `is-code-fence.ts` identifies fence markers.

### `contract/`

Contains the contract lookup and heading-to-section matching logic.

- `get-contract-section.ts` resolves a contract entry by section id.
- `match-heading-to-section.ts` resolves a heading label to the matching contract section by comparing normalized text and aliases.

### `sections/`

Contains diagnostic generation for validation failures.

- `find-missing-section-diagnostics.ts` reports required sections absent from the README.
- `find-ordering-violation-diagnostics.ts` reports headings that violate the preferred section ordering.

### Root module files

- `parse-readme-headings.ts` is the public heading parsing entry point for the readme domain.
- `get-matched-readme-sections.ts` filters relevant headings and resolves them to section ids.
- `check-readme-sections.ts` aggregates the full validation result for a single README body.
- `types.ts` holds the domain-specific types used across the readme validation pipeline.

## Typical flow

The high-level flow is intentionally straightforward:

```ts
const matchedSections = getMatchedReadmeSections(readme, contract);
const diagnostics = [
  ...findMissingSectionDiagnostics(
    matchedSections.map((section) => section.id),
    contract,
  ),
  ...findOrderingViolationDiagnostics(matchedSections, contract),
];

return {
  isValid: diagnostics.length === 0,
  diagnostics,
  foundSectionIds: matchedSections.map((section) => section.id),
  missingRequiredSections: ..., // computed from contract and matched ids
  sections: matchedSections.map(...),
};
```

## Why the module is structured this way

This module is intentionally organized by behavior rather than by technical taxonomy. The logic is grouped around the actual validation lifecycle:

- heading extraction
- contract matching
- section diagnostics
- full README validation

That keeps the code easy to test, easy to read, and aligned with the real problem the module solves.
