# Tasks: Parser/Builder API Symmetry

**Feature**: Make parser API symmetric with builder API for JSON Schema-compatible types
**Branch**: `refactor/009-make-parser-api`
**Type**: Refactor (API Enhancement)
**Estimated Duration**: 12 days

## Task Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- All file paths are absolute from repository root

---

## Phase 0: Setup (Infrastructure Discovery)

**Purpose**: Understand current implementation and identify what exists vs what needs creation

- [ ] T001 Verify branch refactor/009-make-parser-api is created and checked out
- [ ] T002 [P] Read src/JsonSchema/parsers/EnumParser.ts to confirm existing implementation
- [ ] T003 [P] Read src/JsonSchema/parsers/ConstParser.ts to confirm existing implementation
- [ ] T004 [P] Read src/JsonSchema/parsers/registry.ts to verify EnumParser and ConstParser registration
- [ ] T005 Read src/JsonSchema/parsers/index.ts to confirm current 9 parser methods

---

## Phase 1: Testing Gap Assessment (Foundational)

**Purpose**: Establish comprehensive test coverage BEFORE capturing baseline metrics

**⚠️ CRITICAL**: Must complete before Phase 2. Cannot verify behavior preservation without tests.

### Coverage Assessment

- [ ] T006 Run `pnpm test --coverage` to capture current test coverage metrics
- [ ] T007 Analyze coverage for src/JsonSchema/parsers/index.ts and document in testing-gaps.md
- [ ] T008 [P] Analyze coverage for src/JsonSchema/parsers/EnumParser.ts and document in testing-gaps.md
- [ ] T009 [P] Analyze coverage for src/JsonSchema/parsers/ConstParser.ts and document in testing-gaps.md
- [ ] T010 [P] Analyze coverage for src/JsonSchema/parsers/registry.ts and document in testing-gaps.md
- [ ] T011 [P] Analyze coverage for src/JsonSchema/index.ts and document in testing-gaps.md
- [ ] T012 Identify critical gaps and prioritize test creation in testing-gaps.md

### Test Suite Creation for Existing Parsers

- [ ] T013 Create test/JsonSchema/parsers/EnumParser.test.ts with string enum test
- [ ] T014 Add number enum test to test/JsonSchema/parsers/EnumParser.test.ts
- [ ] T015 Add mixed value enum test to test/JsonSchema/parsers/EnumParser.test.ts
- [ ] T016 Add single value enum edge case test to test/JsonSchema/parsers/EnumParser.test.ts
- [ ] T017 Add empty enum edge case test to test/JsonSchema/parsers/EnumParser.test.ts
- [ ] T018 Run EnumParser tests and verify > 90% coverage for src/JsonSchema/parsers/EnumParser.ts
- [ ] T019 Create test/JsonSchema/parsers/ConstParser.test.ts with string const test
- [ ] T020 Add number const test to test/JsonSchema/parsers/ConstParser.test.ts
- [ ] T021 Add boolean const test to test/JsonSchema/parsers/ConstParser.test.ts
- [ ] T022 Add null const test to test/JsonSchema/parsers/ConstParser.test.ts
- [ ] T023 Add object const test to test/JsonSchema/parsers/ConstParser.test.ts
- [ ] T024 Add array const test to test/JsonSchema/parsers/ConstParser.test.ts
- [ ] T025 Run ConstParser tests and verify > 90% coverage for src/JsonSchema/parsers/ConstParser.ts

### Test Suite for Parser API Methods

- [ ] T026 Create test/parsers/api-methods.test.ts with test structure and test refs setup
- [ ] T027 Add parse.object() test to test/parsers/api-methods.test.ts
- [ ] T028 [P] Add parse.array() test to test/parsers/api-methods.test.ts
- [ ] T029 [P] Add parse.string() test to test/parsers/api-methods.test.ts
- [ ] T030 [P] Add parse.number() test to test/parsers/api-methods.test.ts
- [ ] T031 [P] Add parse.boolean() test to test/parsers/api-methods.test.ts
- [ ] T032 [P] Add parse.null() test to test/parsers/api-methods.test.ts
- [ ] T033 [P] Add parse.anyOf() test to test/parsers/api-methods.test.ts
- [ ] T034 [P] Add parse.allOf() test to test/parsers/api-methods.test.ts
- [ ] T035 [P] Add parse.oneOf() test to test/parsers/api-methods.test.ts
- [ ] T036 Run parser API methods tests and verify all 9 existing methods tested

### Test Scaffolding for New Features

- [ ] T037 Create test/parsers/api-symmetry.test.ts with test structure
- [ ] T038 Add todo test for parse.enum() to test/parsers/api-symmetry.test.ts
- [ ] T039 Add todo test for parse.const() to test/parsers/api-symmetry.test.ts
- [ ] T040 Add todo tests for parse.tuple() (prefixItems and items array) to test/parsers/api-symmetry.test.ts
- [ ] T041 Add todo tests for convenience aliases (union, intersection, discriminatedUnion) to test/parsers/api-symmetry.test.ts
- [ ] T042 Add todo tests for special types (any, unknown, never) to test/parsers/api-symmetry.test.ts
- [ ] T043 Add todo test for parse.record() to test/parsers/api-symmetry.test.ts

**Checkpoint**: All testing gaps addressed, ready to capture baseline

---

## Phase 2: Baseline Capture

**Purpose**: Document current state before making changes

- [ ] T044 Run `pnpm test` to verify all tests pass before capturing baseline
- [ ] T045 Run `pnpm test --coverage` to capture baseline test coverage
- [ ] T046 Verify metrics-before.md is generated with baseline metrics
- [ ] T047 Document behavioral snapshot in behavioral-snapshot.md
- [ ] T048 Create git tag pre-refactor-009: `git tag pre-refactor-009 -m "Baseline before parser API symmetry"`

**Checkpoint**: Baseline established, safe to begin implementation

---

## Phase 3: Implementation (Core Parsers)

**Purpose**: Create TupleParser and expose enum/const/tuple via parser API

### TupleParser Implementation

- [ ] T049 Create src/JsonSchema/parsers/TupleParser.ts with BaseParser extension and typeKind property
- [ ] T050 Implement parseImpl() method handling prefixItems in src/JsonSchema/parsers/TupleParser.ts
- [ ] T051 Add items array support (draft-07) to parseImpl() in src/JsonSchema/parsers/TupleParser.ts
- [ ] T052 Implement canProduceType() method in src/JsonSchema/parsers/TupleParser.ts
- [ ] T053 Add empty tuple edge case handling to src/JsonSchema/parsers/TupleParser.ts

### TupleParser Tests

- [ ] T054 Create test/JsonSchema/parsers/TupleParser.test.ts with prefixItems test
- [ ] T055 Add items array (draft-07) test to test/JsonSchema/parsers/TupleParser.test.ts
- [ ] T056 Add empty tuple test to test/JsonSchema/parsers/TupleParser.test.ts
- [ ] T057 Add nested schema tuple test to test/JsonSchema/parsers/TupleParser.test.ts
- [ ] T058 Run TupleParser tests and verify > 90% coverage for src/JsonSchema/parsers/TupleParser.ts

### Registry Updates

- [ ] T059 Import TupleParser in src/JsonSchema/parsers/registry.ts
- [ ] T060 Add TupleParser to ParserClass union type in src/JsonSchema/parsers/registry.ts
- [ ] T061 Add prefixItems detection to selectParserClass() in src/JsonSchema/parsers/registry.ts
- [ ] T062 Add items array detection to selectParserClass() in src/JsonSchema/parsers/registry.ts (after const check)
- [ ] T063 Create or update test/JsonSchema/parsers/registry.test.ts with TupleParser selection tests
- [ ] T064 Run registry tests and verify TupleParser selection works correctly

### Parser API Method Additions

- [ ] T065 Import EnumParser in src/JsonSchema/parsers/index.ts
- [ ] T066 Import ConstParser in src/JsonSchema/parsers/index.ts
- [ ] T067 Import TupleParser in src/JsonSchema/parsers/index.ts
- [ ] T068 Add parse.enum() method with JSDoc to src/JsonSchema/parsers/index.ts
- [ ] T069 Add parse.const() method with JSDoc to src/JsonSchema/parsers/index.ts
- [ ] T070 Add parse.tuple() method with JSDoc to src/JsonSchema/parsers/index.ts
- [ ] T071 Convert parse.enum() todo to real test in test/parsers/api-symmetry.test.ts
- [ ] T072 Convert parse.const() todo to real test in test/parsers/api-symmetry.test.ts
- [ ] T073 Convert parse.tuple() todos to real tests in test/parsers/api-symmetry.test.ts
- [ ] T074 Run api-symmetry tests and verify all Phase 3 methods work

### Naming Consistency

- [ ] T075 Rename parse.Schema to parse.schema in src/JsonSchema/index.ts
- [ ] T076 Rename parse.Ref to parse.ref in src/JsonSchema/index.ts
- [ ] T077 Add deprecated parse.Schema alias pointing to parse.schema in src/JsonSchema/index.ts
- [ ] T078 Add deprecated parse.Ref alias pointing to parse.ref in src/JsonSchema/index.ts
- [ ] T079 Add @deprecated JSDoc tags for parse.Schema and parse.Ref in src/JsonSchema/index.ts
- [ ] T080 Update internal usage from parse.Schema to parse.schema if any exist
- [ ] T081 Create naming consistency tests in test/parsers/api-methods.test.ts
- [ ] T082 Run naming tests and verify both old and new names work

**Checkpoint**: Core parser implementation complete, API has 12 methods (9 + 3 new)

---

## Phase 4: Implementation (Aliases & Remaining Features)

**Purpose**: Add convenience aliases, special types, and RecordParser

### Convenience Alias Methods

- [ ] T083 Add parse.union() alias method with JSDoc to src/JsonSchema/parsers/index.ts
- [ ] T084 Add parse.intersection() alias method with JSDoc to src/JsonSchema/parsers/index.ts
- [ ] T085 Add parse.discriminatedUnion() alias method with JSDoc to src/JsonSchema/parsers/index.ts
- [ ] T086 Convert alias todos to real tests in test/parsers/api-symmetry.test.ts
- [ ] T087 Run alias tests and verify output matches original methods

### Special Type Methods

- [ ] T088 Add parse.any() method with JSDoc to src/JsonSchema/parsers/index.ts
- [ ] T089 Add parse.unknown() method with JSDoc to src/JsonSchema/parsers/index.ts
- [ ] T090 Add parse.never() method with JSDoc to src/JsonSchema/parsers/index.ts
- [ ] T091 Convert special type todos to real tests in test/parsers/api-symmetry.test.ts
- [ ] T092 Run special type tests and verify correct builder types returned

### RecordParser Implementation

- [ ] T093 Create src/JsonSchema/parsers/RecordParser.ts with BaseParser extension
- [ ] T094 Implement parseImpl() handling additionalProperties schema in src/JsonSchema/parsers/RecordParser.ts
- [ ] T095 Add additionalProperties: true handling in src/JsonSchema/parsers/RecordParser.ts
- [ ] T096 Add additionalProperties: false fallback in src/JsonSchema/parsers/RecordParser.ts
- [ ] T097 Implement canProduceType() method in src/JsonSchema/parsers/RecordParser.ts

### RecordParser Tests

- [ ] T098 Create test/JsonSchema/parsers/RecordParser.test.ts with additionalProperties schema test
- [ ] T099 Add additionalProperties: true test to test/JsonSchema/parsers/RecordParser.test.ts
- [ ] T100 Add complex value type test to test/JsonSchema/parsers/RecordParser.test.ts
- [ ] T101 Run RecordParser tests and verify > 90% coverage for src/JsonSchema/parsers/RecordParser.ts

### RecordParser Integration

- [ ] T102 Import RecordParser in src/JsonSchema/parsers/registry.ts
- [ ] T103 Add RecordParser to ParserClass union type in src/JsonSchema/parsers/registry.ts
- [ ] T104 Evaluate if selectParserClass() needs record detection logic in src/JsonSchema/parsers/registry.ts
- [ ] T105 Import RecordParser in src/JsonSchema/parsers/index.ts
- [ ] T106 Add parse.record() method with JSDoc to src/JsonSchema/parsers/index.ts
- [ ] T107 Convert parse.record() todo to real test in test/parsers/api-symmetry.test.ts
- [ ] T108 Run record tests and verify parse.record() works correctly

**Checkpoint**: Parser API complete with 18+ methods, all features implemented

---

## Phase 5: Documentation

**Purpose**: Comprehensive documentation of API symmetry and design decisions

### API Documentation Updates

- [ ] T109 Add "Parser API vs Builder API" section to docs/API.md with symmetry table
- [ ] T110 Document all new parser methods in docs/API.md with examples
- [ ] T111 Add convenience alias explanation section to docs/API.md
- [ ] T112 Add Zod-only types section to docs/API.md (no parser equivalents)
- [ ] T113 Add usage examples for direct parser API to docs/API.md
- [ ] T114 Add usage examples for convenience aliases to docs/API.md

### Parser Architecture Documentation

- [ ] T115 Add "API Design Principles" section to docs/parser-architecture.md
- [ ] T116 Document symmetry goal and naming rationale in docs/parser-architecture.md
- [ ] T117 Add "When to Use Parser API vs parseSchema" guidance to docs/parser-architecture.md
- [ ] T118 Add "Adding New Parser Methods" instructions to docs/parser-architecture.md

### API Symmetry Reference

- [ ] T119 Create docs/api-symmetry.md with comprehensive reference table
- [ ] T120 Document JSON Schema to parser/builder mapping in docs/api-symmetry.md
- [ ] T121 Add Zod-only types table with alternatives to docs/api-symmetry.md
- [ ] T122 Add naming rationale section to docs/api-symmetry.md
- [ ] T123 Add migration guide section to docs/api-symmetry.md

**Checkpoint**: All documentation complete and accurate

---

## Phase 6: Validation & Quality Assurance

**Purpose**: Verify implementation correctness and behavior preservation

### Test Execution

- [ ] T124 Run full test suite with `pnpm test` and verify 100% pass rate
- [ ] T125 Run coverage with `pnpm test --coverage` and verify no coverage regression
- [ ] T126 Check for any new test warnings or errors
- [ ] T127 Verify all new parser methods have > 90% test coverage

### Metrics Capture

- [ ] T128 Run `pnpm test --coverage` to capture post-refactor metrics
- [ ] T129 Verify metrics-after.md is generated
- [ ] T130 Compare coverage: current vs baseline (target: maintained or increased)
- [ ] T131 Compare test count: current vs baseline (expect increase)
- [ ] T132 Verify no performance regression (parseSchema timing)

### Behavioral Verification

- [ ] T133 Re-run behavioral snapshot tests from behavioral-snapshot.md
- [ ] T134 Verify parseSchema selects correct parsers (same as before for existing types)
- [ ] T135 Verify existing parser methods produce identical output
- [ ] T136 Verify context threading works correctly with new parsers
- [ ] T137 Verify post-processors apply to new parser outputs
- [ ] T138 Verify circular references handled correctly with new parsers
- [ ] T139 Verify export structure unchanged (backward compatibility)

### API Symmetry Verification

- [ ] T140 Count parser API methods and verify 18+ methods exist
- [ ] T141 List all builder methods and identify JSON Schema-compatible types
- [ ] T142 Calculate symmetry ratio for JSON Schema types (target: 1.0)
- [ ] T143 Verify all JSON Schema-compatible types have parser methods
- [ ] T144 Verify Zod-only types documented without parsers

### Code Quality

- [ ] T145 Run linter with `pnpm run lint` and fix any new errors
- [ ] T146 Review all new code for adherence to TypeScript strict mode
- [ ] T147 Verify JSDoc completeness for all new public methods
- [ ] T148 Check for any TODO or FIXME comments that need resolution

**Checkpoint**: All validation passed, ready for peer review

---

## Phase 7: Review & Integration

**Purpose**: External validation and preparation for merge

### Peer Review

- [ ] T149 Request peer review of refactor-spec.md accuracy
- [ ] T150 Request peer review of implementation correctness
- [ ] T151 Request peer review of test coverage adequacy
- [ ] T152 Request peer review of documentation completeness
- [ ] T153 Request peer review of API design decisions
- [ ] T154 Address all peer review feedback
- [ ] T155 Obtain approval for merge

### Pre-Merge Preparation

- [ ] T156 Rebase refactor/009-make-parser-api on latest master branch
- [ ] T157 Resolve any merge conflicts from rebase
- [ ] T158 Run full test suite post-rebase and verify all pass
- [ ] T159 Run build with `pnpm run build` and verify success
- [ ] T160 Final lint check with `pnpm run lint`

### Changelog Update

- [ ] T161 Add "Added" section to CHANGELOG.md for new parser methods
- [ ] T162 Add "Changed" section to CHANGELOG.md for naming consistency
- [ ] T163 Add "Documentation" section to CHANGELOG.md
- [ ] T164 Add "Improved" section to CHANGELOG.md for API discoverability
- [ ] T165 Review changelog entry for completeness and user clarity

**Checkpoint**: Pre-merge checks complete, ready to merge

---

## Phase 8: Merge & Monitor

**Purpose**: Integration and post-merge stability monitoring

### Merge Execution

- [ ] T166 Checkout master branch
- [ ] T167 Merge refactor/009-make-parser-api with `git merge --no-ff refactor/009-make-parser-api`
- [ ] T168 Push to remote with `git push origin master`
- [ ] T169 Verify CI passes on master branch
- [ ] T170 Create GitHub release notes if applicable

### Post-Merge Monitoring (2 weeks)

- [ ] T171 Monitor GitHub issues for parser API related problems
- [ ] T172 Track user questions about new methods in discussions
- [ ] T173 Watch for bug reports about enum/const/tuple parsing
- [ ] T174 Monitor for performance complaints or regressions
- [ ] T175 Watch for breaking change reports
- [ ] T176 Respond to critical issues within 24 hours
- [ ] T177 Document common questions in FAQ or docs
- [ ] T178 Create hotfix branch if critical bugs discovered

**Checkpoint**: Refactor complete, monitoring active 🎉

---

## Summary Statistics

**Total Tasks**: 178 tasks
**Parallelizable Tasks**: 21 tasks (marked with [P])
**Estimated Duration**: 12 working days

### Task Breakdown by Phase

| Phase | Task Range | Count | Duration |
|-------|------------|-------|----------|
| Phase 0: Setup | T001-T005 | 5 | 0.5 days |
| Phase 1: Testing | T006-T043 | 38 | 4.5 days |
| Phase 2: Baseline | T044-T048 | 5 | 0.5 days |
| Phase 3: Core Parsers | T049-T082 | 34 | 2 days |
| Phase 4: Aliases & Remaining | T083-T108 | 26 | 1.5 days |
| Phase 5: Documentation | T109-T123 | 15 | 2 days |
| Phase 6: Validation | T124-T148 | 25 | 1 day |
| Phase 7: Review | T149-T165 | 17 | 0.5 days |
| Phase 8: Merge | T166-T178 | 13 | 0.5 days |

### Parallel Execution Opportunities

**Phase 1 - Testing** (Tasks can run in parallel after T012):
- T013-T025: EnumParser and ConstParser tests (2 parsers in parallel)
- T028-T035: API method tests (7 methods in parallel)

**Phase 3 - Core Implementation** (After T058, before API additions):
- T059-T064: Registry updates can overlap with test creation elsewhere

### Critical Path

T001 → T006 → T044 → T049 → T059 → T065 → T075 → T083 → T093 → T109 → T124 → T149 → T156 → T166

**Blocking Dependencies**:
- Phase 1 MUST complete before Phase 2 (testing before baseline)
- Phase 2 MUST complete before Phase 3 (baseline before changes)
- Phase 3 MUST complete before Phase 4 (core before aliases)
- Phase 5 can partially overlap with Phase 6 (docs while testing)
- Phase 7 MUST wait for Phase 6 (review after validation)

### Success Criteria

- [ ] Parser API grows from 9 → 18+ methods
- [ ] 100% coverage of JSON Schema-compatible types with parser methods
- [ ] Test coverage > 95% for all code
- [ ] All 178 tasks completed
- [ ] No critical bugs in 2 weeks post-merge
- [ ] Positive user feedback on API improvements
- [ ] Documentation comprehensive and accurate
- [ ] No performance regression > 5%

---

## Risk Mitigation

**High-Risk Tasks**:
- T061-T062: TupleParser registry - may conflict with array detection
- T104: RecordParser registry - may conflict with ObjectParser
- T134-T139: Behavioral verification - must preserve exact behavior

**Mitigation Strategies**:
- Comprehensive test coverage BEFORE implementation
- Careful ordering of checks in selectParserClass()
- Behavioral snapshot validation
- Peer review of registry changes
- Rollback plan: Revert merge if critical issues found

---

## References

- [Refactor Spec](./refactor-spec.md) - Detailed specification
- [Implementation Plan](./plan.md) - Detailed implementation guidance
- [Testing Gaps](./testing-gaps.md) - Test coverage analysis
- [Behavioral Snapshot](./behavioral-snapshot.md) - Expected behaviors
- [Metrics Before](./metrics-before.md) - Baseline metrics
- [Parser Architecture](../../docs/parser-architecture.md) - Architecture docs
