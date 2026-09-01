## Documentation Guardrails & Drift Prevention

Establish automated guardrails that keep the README, API documentation, examples, changelog, package exports, and architecture rules synchronized with the implementation.

### Phase 1: Core Documentation Guardrails

- [ ] **Task 1 — Validate required README sections**

- **Status**: ⏳ Pending

- **Target**: TBD

- **Description**: Ensure the README always contains the required documentation sections and prevents accidental removal of important package documentation.

- **Steps**:
  - [x] Define the required README sections.
  - [x] Create an automated README section validator.
  - [ ] Fail CI when a required section is missing.
  - [ ] Add the validator to the documentation check command.

- [ ] **Task 2 — Validate public entry points against the README**

- **Status**: ⏳ Pending

- **Target**: TBD

- **Description**: Ensure every public package entry point defined by `package.json` exports is documented.

- **Steps**:
  - [ ] Extract public entry points from `package.json`.
  - [ ] Compare them against the README.
  - [ ] Report undocumented entry points.
  - [ ] Fail CI when an entry point is missing from the documentation.
  - [ ] Detect stale documented entry points that no longer exist.

- [ ] **Task 3 — Validate README and documentation links**

- **Status**: ⏳ Pending

- **Target**: TBD

- **Description**: Prevent broken internal documentation links and references to files or sections that no longer exist.

- **Steps**:
  - [ ] Validate internal README links.
  - [ ] Validate referenced documentation files.
  - [ ] Validate README anchors where practical.
  - [ ] Validate package/import references used in documentation.
  - [ ] Fail CI on broken references.

- [ ] **Task 4 — Make documentation examples executable**

- **Status**: ⏳ Pending

- **Target**: TBD

- **Description**: Ensure important README examples remain valid as the public API evolves.

- **Steps**:
  - [ ] Extract important examples into `docs/examples`.
  - [ ] Create a dedicated documentation TypeScript configuration.
  - [ ] Compile React examples.
  - [ ] Compile core utility examples.
  - [ ] Compile Playwright examples.
  - [ ] Run documentation example typechecking in CI.

- [ ] **Task 5 — Enforce TSDoc coverage for public APIs**

- **Status**: ⏳ Pending

- **Target**: TBD

- **Description**: Ensure public exports have appropriate API documentation and prevent undocumented public APIs from being introduced.

- **Steps**:
  - [ ] Identify public exports for each package entry point.
  - [ ] Define which TSDoc tags are mandatory.
  - [ ] Detect undocumented public functions, components, types, and constants.
  - [ ] Validate `@param` names against actual function parameters.
  - [ ] Validate `@returns` where applicable.
  - [ ] Fail CI when required documentation is missing or stale.

---

### Phase 2: API & Release Documentation Safety

- [ ] **Task 6 — Introduce a public API snapshot**

- **Status**: ⏳ Pending

- **Target**: TBD

- **Description**: Detect public API changes automatically so documentation and changelog updates cannot be accidentally skipped.

- **Steps**:
  - [ ] Generate a machine-readable public API snapshot.
  - [ ] Capture exports for every supported package entry point.
  - [ ] Store the snapshot under version control.
  - [ ] Compare the current API against the committed snapshot.
  - [ ] Report added, removed, and changed public APIs.
  - [ ] Require an intentional snapshot update when the API changes.

- [ ] **Task 7 — Add changelog drift guardrails**

- **Status**: ⏳ Pending

- **Target**: TBD

- **Description**: Ensure user-visible changes receive an appropriate changelog entry without requiring meaningless entries for internal changes.

- **Steps**:
  - [ ] Define which source changes are considered release-relevant.
  - [ ] Detect changes to public APIs, adapters, package exports, and user-visible behavior.
  - [ ] Require a changelog entry or changeset for release-relevant changes.
  - [ ] Allow explicit classification of internal-only changes.
  - [ ] Add CI validation for missing changelog metadata.

- [ ] **Task 8 — Introduce structured change entries**

- **Status**: ⏳ Pending

- **Target**: TBD

- **Description**: Use structured change files to make release-note generation deterministic and reduce manual changelog maintenance.

- **Steps**:
  - [ ] Create a `.changes/` directory convention.
  - [ ] Define change metadata such as `type` and `scope`.
  - [ ] Add entries for added, changed, fixed, and breaking changes.
  - [ ] Validate change-file structure in CI.
  - [ ] Generate changelog sections from structured changes during release preparation.

- [ ] **Task 9 — Detect breaking API changes**

- **Status**: ⏳ Pending

- **Target**: TBD

- **Description**: Detect potentially breaking changes to public APIs and require explicit documentation and release classification.

- **Steps**:
  - [ ] Compare the current public API against the previous release.
  - [ ] Detect removed exports.
  - [ ] Detect renamed exports.
  - [ ] Detect incompatible signature changes.
  - [ ] Detect changes to public types.
  - [ ] Require a breaking-change classification.
  - [ ] Require migration documentation where appropriate.

- [ ] **Task 10 — Validate examples against the built package**

- **Status**: ⏳ Pending

- **Target**: TBD

- **Description**: Ensure documentation examples work against the actual published package surface rather than only the source tree.

- **Steps**:
  - [ ] Build the package.
  - [ ] Resolve documentation examples against the generated package.
  - [ ] Compile examples against `dist`.
  - [ ] Validate documented subpath imports.
  - [ ] Validate generated package exports.
  - [ ] Fail CI when source exports work but packaged exports do not.

---

### Phase 3: Architecture & Repository Guardrails

- [ ] **Task 11 — Enforce architecture dependency boundaries**

- **Status**: ⏳ Pending

- **Target**: TBD

- **Description**: Turn the documented `shared → core → adapters → main` architecture into an executable repository constraint.

- **Steps**:
  - [ ] Define allowed dependency directions.
  - [ ] Detect `shared → core` violations.
  - [ ] Detect `core → adapters` violations.
  - [ ] Detect adapter-to-adapter dependencies where prohibited.
  - [ ] Detect business logic leaking into `main`.
  - [ ] Fail CI when architectural boundaries are violated.

- [ ] **Task 12 — Create a documentation manifest**

- **Status**: ⏳ Pending

- **Target**: TBD

- **Description**: Maintain an explicit mapping between public package APIs and their required documentation coverage.

- **Steps**:
  - [ ] Define documentation ownership for each public entry point.
  - [ ] Define documented exports per entry point.
  - [ ] Define required examples per major API.
  - [ ] Define required migration documentation for breaking APIs.
  - [ ] Validate the manifest against the actual package exports.

- [ ] **Task 13 — Build the unified documentation checker**

- **Status**: ⏳ Pending

- **Target**: TBD

- **Description**: Provide a single command that executes all documentation and API consistency checks.

- **Steps**:
  - [ ] Create `npm run docs:check`.
  - [ ] Run README section validation.
  - [ ] Run entry-point validation.
  - [ ] Run public API documentation validation.
  - [ ] Run documentation link validation.
  - [ ] Run documentation example compilation.
  - [ ] Run API snapshot validation.
  - [ ] Run changelog validation.
  - [ ] Produce actionable error messages.
  - [ ] Return a non-zero exit code when a guardrail fails.

---

### Phase 4: CI & Release Integration

- [ ] **Task 14 — Integrate documentation guardrails into CI**

- **Status**: ⏳ Pending

- **Target**: TBD

- **Description**: Make documentation consistency a blocking part of the normal CI pipeline.

- **Steps**:
  - [ ] Add `docs:check` to the CI workflow.
  - [ ] Run documentation checks after typechecking/build validation.
  - [ ] Ensure failures block merges.
  - [ ] Display actionable documentation drift diagnostics in CI.
  - [ ] Verify the workflow on pull requests.

- [ ] **Task 15 — Integrate API and documentation checks into releases**

- **Status**: ⏳ Pending

- **Target**: TBD

- **Description**: Prevent publishing a package when its public API, documentation, changelog, or generated artifacts are inconsistent.

- **Steps**:
  - [ ] Run the full documentation check before publishing.
  - [ ] Validate the API snapshot.
  - [ ] Validate release notes.
  - [ ] Validate package entry points.
  - [ ] Validate examples against the production build.
  - [ ] Prevent release publication when a required documentation contract fails.

---

### Phase 5: Documentation Quality & Maintenance

- [ ] **Task 16 — Generate API/reference documentation**

- **Status**: ⏳ Pending

- **Target**: TBD

- **Description**: Reduce manually maintained API reference material by generating reference documentation from the typed public API.

- **Steps**:
  - [ ] Select an API documentation generator.
  - [ ] Generate documentation from public TSDoc.
  - [ ] Generate documentation per package entry point.
  - [ ] Integrate generated documentation into the repository or release artifacts.
  - [ ] Ensure generated output remains synchronized with the API snapshot.

- [ ] **Task 17 — Establish documentation ownership rules**

- **Status**: ⏳ Pending

- **Target**: TBD

- **Description**: Define which documentation is generated, which is machine-validated, and which requires human review.

- **Steps**:
  - [ ] Mark generated documentation.
  - [ ] Mark contractually validated documentation.
  - [ ] Define human-reviewed conceptual documentation.
  - [ ] Document the update workflow for each category.
  - [ ] Add contribution guidelines for documentation changes.

- [ ] **Task 18 — Document the documentation workflow**

- **Status**: ⏳ Pending

- **Target**: TBD

- **Description**: Give contributors a clear workflow for keeping API docs, examples, changelog entries, and migration notes synchronized with implementation changes.

- **Steps**:
  - [ ] Document when a README change is required.
  - [ ] Document when a changelog/changeset entry is required.
  - [ ] Document when an API snapshot must be updated.
  - [ ] Document how to add executable examples.
  - [ ] Document how to run `docs:check` locally.
  - [ ] Document how documentation validation participates in CI and releases.
