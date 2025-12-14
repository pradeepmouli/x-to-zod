# Tasks: refactor-003 Apply Fluent Zod-like Builders

Feature: Fluent Zod-like Builders for ZodBuilder

## Phase 1: Setup

- [ ] T001 Capture baseline metrics via script
- [ ] T002 Ensure all tests pass (baseline)
- [ ] T003 Create branch and confirm spec artifacts exist

## Phase 2: Foundational

- [ ] T004 [P] Add base fluent wrapper in src/ZodBuilder/fluent.ts
- [ ] T005 Update src/ZodBuilder/index.ts to export builder factories

## Phase 3: Number Builder

- [ ] T006 Implement NumberBuilder class in src/ZodBuilder/number.ts
- [ ] T007 Wire `build.number()` factory in src/ZodBuilder/index.ts
- [ ] T008 Integrate NumberBuilder in src/parsers/parseNumber.ts and preserve chain order
- [ ] T009 Run tests and compare outputs (no changes allowed)
 - [ ] T009a Gate: Run tests BEFORE code changes; confirm baseline green
 - [ ] T009b Gate: Run tests AFTER integration; compare against behavioral snapshot

## Phase 4: String Builder

- [ ] T010 [P] Implement StringBuilder in src/ZodBuilder/string.ts
- [ ] T011 [P] Wire `build.string()` and integrate in src/parsers/parseString.ts
- [ ] T012 Run tests and verify parity
 - [ ] T012a Gate: Run tests BEFORE code changes
 - [ ] T012b Gate: Run tests AFTER integration; snapshot compare

## Phase 5: Array Builder

- [ ] T013 [P] Implement ArrayBuilder in src/ZodBuilder/array.ts
- [ ] T014 [P] Wire `build.array()` and integrate in src/parsers/parseArray.ts
- [ ] T015 Run tests and verify parity
 - [ ] T015a Gate: Run tests BEFORE code changes
 - [ ] T015b Gate: Run tests AFTER integration; snapshot compare

## Phase 6: Object/Boolean/Null/Enum/Const Builders

- [ ] T016 [P] Implement ObjectBuilder in src/ZodBuilder/object.ts
- [ ] T017 [P] Integrate in src/parsers/parseObject.ts
- [ ] T018 [P] Implement BooleanBuilder in src/ZodBuilder/boolean.ts (methods parity)
- [ ] T019 [P] Implement NullBuilder in src/ZodBuilder/null.ts
- [ ] T020 [P] Implement EnumBuilder in src/ZodBuilder/enum.ts
- [ ] T021 [P] Implement ConstBuilder in src/ZodBuilder/const.ts
- [ ] T022 Update exports and integrations where needed
- [ ] T023 Run full test suite and verify parity
 - [ ] T023a Gate: Run tests BEFORE phase work begins
 - [ ] T023b Gate: Run tests AFTER all integrations; snapshot compare

## Phase 7: Validation

- [ ] T024 Re-measure metrics (after)
- [ ] T025 Compare behavioral snapshot outputs (identical)
- [ ] T026 Code review checklist compliance
 - [ ] T030 Validate ESM/CJS parity (build both, verify post-build outputs unchanged)
 - [ ] T031 Validate CLI parity (run CLI on sample schemas and compare to baseline outputs)
 - [ ] T032 Final export/index verification in src/ZodBuilder/index.ts

## Final Phase: Polish & Cross-Cutting

- [ ] T027 [P] Update README.md with internal fluent notes (non-public)
- [ ] T028 [P] Add minimal wrapper-level tests if coverage gaps (no assertion weakening)
- [ ] T029 [P] Ensure ESM/CJS outputs unchanged; inspect post-build scripts

## Dependencies (Story Order)

- Number → String → Array → Object/Boolean/Null/Enum/Const
- Validation depends on all builders integrated

## Parallel Execution Examples

- [P] T010/T011 (String) can run in parallel with T013/T014 (Array) once Number phase passes
- [P] T016–T021 can be parallelized across files as they touch distinct modules
- [P] T027–T029 can run in parallel post-integration

## Implementation Strategy (MVP first)

- MVP: Phase 3 (NumberBuilder) integrated with tests passing
- Incremental delivery: Add next builders in phases, always keeping tests green

---
Format validation: All tasks follow `- [ ] T### [P?] Description with file path`.
