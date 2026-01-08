# Tasks: Post-Processing API

**Input**: Design documents from `/specs/enhance/003-enhancement-003-post/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Tests are required for this enhancement (per spec). Use TDD ordering within the user story phase.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing. Only one user story (Post-Processing API) is needed for this enhancement.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare scaffolding for new post-processing utilities.

- [X] T001 Create PostProcessing scaffolding (src/PostProcessing/, test/PostProcessing/) and export stub barrel if needed.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Ensure build/test configs account for new module area before user story work.

- [X] T002 Confirm tsconfig builds include src/PostProcessing and adjust path/compilation configs if required (tsconfig.json, tsconfig.esm.json, tsconfig.cjs.json).

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Post-Processing API (Priority: P1) 🎯 MVP

**Goal**: Enable path-aware post-processing of builders during parsing with presets, type guards, and CLI support.

**Independent Test**: Running vitest should show post-processors applied per patterns (strict objects, optional metadata, branded ids) without breaking existing behavior.

### Tests for User Story 1 (write first)

- [X] T003 [P] [US1] Add failing path matcher unit tests covering $, $.properties.*, $.properties.**, $..field, and cache behavior in test/PostProcessing/pathMatcher.test.ts.
- [X] T004 [P] [US1] Add failing preset helper tests (strictObjects, nonemptyArrays, brandIds, makeOptional, makeRequired, matchPath wrapper) in test/PostProcessing/presets.test.ts.
- [X] T005 [P] [US1] Add failing integration tests ensuring postProcessors run during parsing (strict objects, optional path, branded id) in test/PostProcessing/integration.test.ts.
- [X] T006 [P] [US1] Add failing builder type-guard coverage for new guards in test/utils/is.test.ts.

### Implementation for User Story 1

- [X] T007 [US1] Implement path parsing/matching with caching in src/PostProcessing/pathParser.ts and src/PostProcessing/pathMatcher.ts to satisfy T003.
- [X] T008 [US1] Introduce PostProcessor types/context and applyPostProcessors hook in src/JsonSchema/parsers/BaseParser.ts; plumb postProcessors through src/jsonSchemaToZod.ts and src/index.ts to builder creation.
- [X] T009 [US1] Implement preset helpers in src/PostProcessing/presets.ts (strictObjects, nonemptyArrays, brandIds, makeOptional, makeRequired, matchPath); add exports/barrel as needed.
- [X] T010 [US1] Extend builder type guards in src/utils/is.ts to cover object/string/array/number/union builders and any new predicates; ensure exported for presets/tests.
- [X] T011 [US1] Add CLI flag to load postProcessors module (src/cli.ts) aligned with research decision; validate argument parsing and error messages.
- [X] T012 [US1] Add documentation in docs/post-processing.md (plus README cross-link if appropriate) reflecting examples and CLI usage; ensure quickstart.md alignment if needed.

**Checkpoint**: User Story 1 complete and independently testable via vitest.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup.

- [X] T013 [P] Run full test suite and lint (`pnpm test`, `pnpm run lint`) to validate integration; address any failures.
- [X] T014 [P] Verify ESM/CJS exports for post-processing utilities (build outputs and package exports) and adjust index/barrel files if required.

---

## Dependencies & Execution Order

- Phase 1 → Phase 2 → Phase 3 → Phase 4.
- Within Phase 3 (US1): tests (T003–T006) precede implementations (T007–T012); tasks marked [P] can run in parallel if files are independent.
- Post-story polish (T013–T014) runs after US1 implementation.

## Parallel Opportunities

- T003–T006 can run in parallel (separate test files).
- T009–T010 may run in parallel once path matcher (T007) and plumbing (T008) are in place.
- T013–T014 can run in parallel after implementation completion.
