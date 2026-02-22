# Tasks: Abstract Parser/Schema Project Surface (refactor-010)

**Input**: Design documents from `specs/refactor/010-abstract-parser-schema/`
**Branch**: `refactor/010-abstract-parser-schema`

**Tests**: TDD is **MANDATORY** per Constitution Principle IV. Test tasks appear BEFORE their
implementation tasks. Tests must be written and verified to FAIL before implementation begins.

**Organization**: Tasks are grouped by implementation step, mapped to User Stories derived from
the spec's refactoring phases and success criteria.

## User Story Map

| Story | Priority | Description | Success Criteria |
|-------|----------|-------------|-----------------|
| **US1** | P1 🎯 MVP | Builder Interface | `ZodBuilder implements Builder`; `ParserOverride` returns `Builder\|void`; `string` return removed |
| **US2** | P1 🎯 MVP | Parser Interface + AbstractParser Rename | `Parser` interface exists; `AbstractParser` replaces `BaseParser` (deleted, not shimmed); registry widened |
| **US3** | P2 | SchemaInputAdapter Protocol + JsonSchemaAdapter | Custom adapter can be registered; JSON Schema path unchanged |
| **US4** | P2 | Adapter Pipeline Integration | `parseSchema` delegates to adapter; `AbstractParser` generalized |
| **US5** | P3 | Public API Surface + Final Validation | All new types exported; behavior snapshot verified |

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to
- Tests MUST be written and FAIL before implementation

---

## Phase 1: Setup (Environment Verification)

**Purpose**: Confirm the baseline environment is clean before any changes.

- [x] T001 Run `pnpm test` and confirm 100% pass rate; record output in `specs/refactor/010-abstract-parser-schema/metrics-before.md`
- [x] T002 Run `pnpm test --coverage` and record line/branch coverage in `specs/refactor/010-abstract-parser-schema/metrics-before.md`
- [x] T003 Confirm `pnpm build` succeeds with no TypeScript errors

**Checkpoint**: Environment verified — proceed to foundational gap remediation.

---

## Phase 2: Foundational — Testing Gap Remediation & Baseline

**Purpose**: Fill all critical and important testing gaps BEFORE any refactoring code is written.
Tests in this phase are behavior-preservation anchors for the entire refactoring.

**⚠️ CRITICAL**: No refactoring work (Phase 3+) can begin until this phase is complete.

### Critical Gap Tests (Gap 1–3 from testing-gaps.md)

- [x] T004 [P] Add boolean schema tests to `test/JsonSchema/parsers/parseSchema.test.ts` — `jsonSchemaToZod(true)` → `"z.any()"` and `jsonSchemaToZod(false)` → `"z.never()"`
- [x] T005 [P] Add `parserOverride` void-return (fallthrough) test to `test/JsonSchema/parsers/parseSchema.test.ts` — `parserOverride: () => undefined` causes `parseSchema` to fall through to the default parser and produce correct output; confirms the fallthrough branch is distinct from the override branch (Gap 2 — string path deleted; Builder-return path tested in T013)
- [x] T006 [P] Add circular reference depth-limit test to `test/JsonSchema/parsers/parseSchema.test.ts` — mutually recursive schema with `depth: 2` terminates with `z.any()` (Gap 3)

### Important Gap Tests (Gap 7–8 from testing-gaps.md)

- [x] T007 [P] Create `test/parsers/parseConditional.test.ts` — `if/then/else` schema produces valid Zod output (Gap 7)
- [x] T008 [P] Create `test/parsers/parseMultipleType.test.ts` — `type: ['string', 'null']` produces `z.union([z.string(), z.null()])` or equivalent (Gap 8)

### Smoke Test for All Parser Types (Gap 6 from testing-gaps.md)

- [x] T009 Create `test/JsonSchema/parsers/smoke-all-types.test.ts` — one round-trip assertion per parser type: ObjectParser, ArrayParser, StringParser, NumberParser, IntegerParser, BooleanParser, NullParser, AnyOfParser, AllOfParser, OneOfParser, EnumParser, ConstParser, NullableParser, TupleParser, MultipleTypeParser, ConditionalParser, NotParser, RecordParser (18 types — covers all parsers listed in plan.md) (Gap 6)

### Baseline Capture

- [x] T010 Verify all gap tests from T004–T009 pass; run `pnpm test` and confirm 100% pass rate
- [x] T011 Create git tag `pre-refactor-010`: `git tag pre-refactor-010 -m "Baseline before refactor-010"` and push tag

**Checkpoint**: All gap tests pass; baseline tagged — refactoring can begin.

---

## Phase 3: User Story 1 — Builder Interface (Priority: P1) 🎯 MVP

**Goal**: Extract a `Builder` interface from `ZodBuilder`, make `ZodBuilder` implement it, and
update `ParserOverride` / `ParserSelector` types to use `Builder` instead of the concrete class.
Remove the `string` return from `ParserOverride` entirely — callers must use `refs.build.code(str)`.
After this phase, all parser outputs are typed against the interface, not the implementation.

**Independent Test**: `pnpm test` passes 100%; new builder-interface tests compile and pass;
`ZodBuilder` is verifiably assignable to `Builder` at the type level.

### Tests for User Story 1

> **Write these FIRST — they must compile-error or fail before implementation begins**

- [x] T012 [P] [US1] Create `test/Builder/builder-interface.test.ts` — type-level test: declare `const b: Builder = zodBuilderInstance`, call chain `b.optional().describe('x').nullable()`, assert `b.text()` returns expected string; verify `ZodBuilder satisfies Builder` (Gap 4)
- [x] T013 [P] [US1] Add `parserOverride` Builder return test to `test/JsonSchema/parsers/parseSchema.test.ts` — `parserOverride: (_, refs) => refs.build.number()` produces output containing `z.number()`

### Implementation for User Story 1

- [x] T014 [US1] Create `src/Builder/index.ts` — `Builder` interface with 13 methods: `typeKind`, `text()`, `optional()`, `nullable()`, `default()`, `describe()`, `brand()`, `readonly()`, `catch()`, `refine()`, `superRefine()`, `meta()`, `transform()` (see contracts/builder.interface.ts)
- [x] T015 [US1] Add `implements Builder` to `ZodBuilder` class in `src/ZodBuilder/BaseBuilder.ts` — additive only; no logic changes; confirm `this` return types satisfy `Builder` return types structurally
- [x] T016 [US1] Update `ParserOverride` in `src/Types.ts` — change return type from `BaseBuilder | string | void` to `Builder | void`; remove the `string` branch entirely (breaking change; callers must switch to `refs.build.code(str)`)
- [x] T017 [US1] Update `ParserSelector` in `src/Types.ts` — change return type from `BaseBuilder` to `Builder`
- [x] T018 [US1] Remove the `typeof custom === 'string'` branch in `src/JsonSchema/parsers/parseSchema.ts` — delete the branch entirely; no shim or console.warn
- [x] T019 [US1] Export `Builder` from `src/index.ts`
- [x] T020 [US1] Run `pnpm test` — must pass 100%; run `pnpm build` — must compile with no errors

**Checkpoint**: `Builder` interface is live. `ZodBuilder` implements it. `ParserOverride` returns
`Builder|void` — `string` return is a compile error. All tests pass. Commit before Phase 4.

---

## Phase 4: User Story 2 — Parser Interface + AbstractParser Rename (Priority: P1) 🎯 MVP

**Goal**: Extract a minimal `Parser` interface (typeKind + parse) from `BaseParser`, rename the
class to `AbstractParser`, delete `BaseParser.ts` entirely, widen the registry type from the
explicit class union to `ParserConstructor`, and update all 18 concrete parser classes.

**Independent Test**: `pnpm test` passes 100%; a hand-written class implementing only `Parser`
can be registered and dispatched; any import of `BaseParser` is a compile error.

### Tests for User Story 2

> **Write these FIRST — they must compile-error or fail before implementation begins**

- [x] T021 [P] [US2] Create `test/Parser/parser-interface.test.ts` — type-level test: minimal class `class MyParser { typeKind = 'x' as const; parse() { return refs.build.any(); } }` satisfies `Parser`; assign instance to `Parser` typed variable; verify no TypeScript error (Gap 5a)
- [x] T022 [P] [US2] Create `test/SchemaInput/third-party-parser.test.ts` — runtime test: register `MinimalParser` via `registerParser('x-custom', MinimalParser)`; call `parseSchema({ type: 'x-custom' }, refs)`; assert output is `z.any()` (Gap 5b)

### Implementation for User Story 2

- [x] T024 [US2] Create `src/Parser/index.ts` — `Parser` interface (`typeKind: string`, `parse(): Builder`) and `ParserConstructor = new(schema: any, refs: Context) => Parser` (see contracts/parser.interface.ts and research.md §2 for the `any` rationale)
- [x] T025 [US2] Create `src/JsonSchema/parsers/AbstractParser.ts` — move content from `BaseParser.ts`; rename class `BaseParser` → `AbstractParser`; add `implements Parser`; change `parse()` and `parseImpl()` return types from `ZodBuilder` to `Builder`; update generic params from `<TypeKind, Version, JS>` to `<TypeKind extends string = string, S extends object = JSONSchemaObject<SchemaVersion>>` (drop `Version`; `JS` becomes `S` in second position)
- [x] T026 [US2] Delete `src/JsonSchema/parsers/BaseParser.ts` — no shim, no re-export; any consumer importing `BaseParser` will get a compile error (breaking change)
- [x] T027 [US2] Update `src/JsonSchema/parsers/registry.ts` — replace `type ParserClass = typeof ObjectParser | typeof ArrayParser | ...` union with `type ParserClass = ParserConstructor` imported from `src/Parser/index.ts`; add or update `registerParser(typeKind: string, cls: ParserConstructor): void` function with runtime assertion `typeof instance.parse === 'function' && typeof instance.typeKind === 'string'` (per spec Risk 7); export `registerParser` from `registry.ts`
- [x] T028 [US2] Update all 18 concrete parser classes in `src/JsonSchema/parsers/` to `extend AbstractParser` instead of `BaseParser` — update the import path and class name; also update type params from `<TypeKind, Version, JS>` to `<TypeKind, JS>` (object, array, string, number, boolean, null, anyOf, allOf, oneOf, enum, const, not, nullable, multipleType, conditional, tuple, record, and parseDefault)
- [x] T029 [US2] Export `Parser`, `ParserConstructor`, `AbstractParser` from `src/index.ts` — do NOT re-export `BaseParser`
- [x] T030 [US2] Run `pnpm test` — must pass 100%; run `pnpm build` — must compile with no errors; confirm smoke test (`smoke-all-types.test.ts`) still passes for all 18 parser types

**Checkpoint**: `Parser` interface + `AbstractParser` base class live. Registry widened.
18 parser classes updated. `BaseParser.ts` deleted. All tests pass. Commit before Phase 5.

---

## Phase 5: User Story 3 — SchemaInputAdapter Protocol + JsonSchemaAdapter (Priority: P2)

**Goal**: Define the `SchemaInputAdapter` interface and `SchemaMetadata` type, implement the
`JsonSchemaAdapter` class wrapping existing JSON Schema logic, and expose `registerAdapter()`.

**Independent Test**: `pnpm test` passes 100%; a minimal custom adapter can be instantiated
and its methods called directly; `JsonSchemaAdapter.isValid()` returns true for valid JSON Schema.

### Tests for User Story 3

> **Write these FIRST — they must fail before implementation begins**

- [x] T031 [P] [US3] Create `test/SchemaInput/schema-input-adapter.test.ts` — import `JsonSchemaAdapter`; assert `adapter.isValid({ type: 'string' })` is true; assert `adapter.isValid('not-a-schema')` is false; assert `adapter.getRef({ $ref: '#/foo' })` returns `'#/foo'`; assert `adapter.getMetadata({ description: 'x', default: 1 })` returns `{ description: 'x', default: 1 }` (Gap 5)
- [x] T032 [P] [US3] Add `registerAdapter` test to `test/SchemaInput/schema-input-adapter.test.ts` — register a no-op adapter; call `registerAdapter(noopAdapter)`; assert it replaces the global default without throwing

### Implementation for User Story 3

- [x] T033 [US3] Create `src/SchemaInput/index.ts` — `type SchemaInput = unknown`; `interface SchemaMetadata { description?, default?, readOnly? }`; `interface SchemaInputAdapter { isValid, selectParser, getRef, getMetadata }`; `let _globalAdapter: SchemaInputAdapter`; `export function registerAdapter(adapter: SchemaInputAdapter): void` (sets `_globalAdapter`); `export function getGlobalAdapter(): SchemaInputAdapter` (returns `_globalAdapter ?? jsonSchemaAdapter`) (see contracts/schema-input.interface.ts)
- [x] T034 [US3] Create `src/SchemaInput/JsonSchemaAdapter.ts` — `class JsonSchemaAdapter implements SchemaInputAdapter` with: `isValid` delegates to `isJSONSchema()`; `selectParser` delegates to `selectParserClass()`; `getRef` returns `(input as any).$ref ?? undefined` if string; `getMetadata` extracts `description`, `default`, `readOnly` from schema cast to `JSONSchemaObject`; export singleton `export const jsonSchemaAdapter = new JsonSchemaAdapter()`
- [x] T035 [US3] Export `SchemaInput`, `SchemaMetadata`, `SchemaInputAdapter`, `registerAdapter`, `jsonSchemaAdapter` from `src/index.ts`
- [x] T036 [US3] Run `pnpm test` — must pass 100%; run `pnpm build` — must compile with no errors

**Checkpoint**: `SchemaInputAdapter` interface defined. `JsonSchemaAdapter` implements it.
`registerAdapter` works. All tests pass. Commit before Phase 6.

---

## Phase 6: User Story 4 — Adapter Pipeline Integration (Priority: P2)

**Goal**: Wire the adapter into `parseSchema` (replace hard-coded JSON Schema logic with adapter
calls), add `adapter?` to `Context`, and generalize `AbstractParser.applyMetadata` to delegate
metadata extraction to the adapter.

**Independent Test**: `pnpm test` passes 100%; passing a custom adapter via `Context.adapter`
changes which parser is selected; `JsonSchemaAdapter` as default preserves existing behavior.

### Tests for User Story 4

> **Write these FIRST — they must fail before implementation begins**

- [x] T037 [P] [US4] Add adapter integration test to `test/SchemaInput/schema-input-adapter.test.ts` — call `parseSchema(myCustomSchema, { ...defaultRefs, adapter: myCustomAdapter })`; assert the custom adapter's `selectParser` is invoked and its returned parser class is used

### Implementation for User Story 4

- [x] T038 [US4] Add `adapter?: SchemaInputAdapter` to `Context` type in `src/Types.ts` — optional field; defaults to `jsonSchemaAdapter` when not provided
- [x] T039 [US4] Update `src/JsonSchema/parsers/parseSchema.ts` — resolve adapter at top: `const adapter = refs.adapter ?? getGlobalAdapter()`; replace `if (isJSONSchema(schema))` with `if (adapter.isValid(schema))`; replace `schema.$ref` access block with `const ref = adapter.getRef(schema); if (ref) { ... use ref ... }`; replace `selectParserClass(schema)` call with `adapter.selectParser(schema, refs)`
- [x] T040 [US4] Update `AbstractParser.applyMetadata()` in `src/JsonSchema/parsers/AbstractParser.ts` — delegate to `this.refs.adapter?.getMetadata(this.schema) ?? legacyExtract(this.schema)` where `legacyExtract` contains the current field-access logic; this allows adapters to override metadata without subclassing `AbstractParser`
- [x] T041 [US4] Run `pnpm test` — must pass 100%; run `pnpm build` — must compile with no errors; the full behavioral snapshot in `behavioral-snapshot.md` must be verified (all 28 behaviors pass)

**Checkpoint**: Pipeline fully decoupled from JSON Schema specifics. Adapter is pluggable.
All 28 behavioral snapshots verified. Commit before Phase 7.

---

## Phase 7: User Story 5 — Public API Surface + Final Validation (Priority: P3)

**Goal**: Ensure all new types are exported from `src/index.ts`, JSDoc migration notes are in
place, the quickstart.md custom adapter example works end-to-end, and final metrics confirm no
regression.

**Independent Test**: A fresh project importing `x-to-zod` can import all new types; the
quickstart.md example compiles and produces the expected Zod output; `pnpm test` passes 100%.

### Implementation for User Story 5

- [x] T042 [P] [US5] Verify `src/index.ts` exports all planned symbols: `Builder`, `Parser`, `ParserConstructor`, `AbstractParser`, `SchemaInput`, `SchemaMetadata`, `SchemaInputAdapter`, `registerAdapter`, `registerParser`, `jsonSchemaAdapter` — add any missing exports; confirm `BaseParser` is NOT exported
- [x] T043 [P] [US5] Add JSDoc to `registerAdapter` in `src/SchemaInput/index.ts` documenting the global vs per-call pattern (from quickstart.md §Extension Point 1 Step 4)
- [x] T045 [US5] Validate quickstart.md §Extension Point 2 minimal parser example end-to-end: write the `CustomDateTimeParser` class from quickstart.md as a test in `test/SchemaInput/third-party-parser.test.ts`; register it; assert `parseSchema({ type: 'custom-datetime' }, refs).text()` returns `'z.string().datetime()'`
- [x] T046 [US5] Run full test suite `pnpm test` — must pass 100%; compare coverage to baseline in `specs/refactor/010-abstract-parser-schema/metrics-before.md`; document final metrics in `specs/refactor/010-abstract-parser-schema/metrics-after.md`
- [x] T047 [US5] Update status checkboxes in `specs/refactor/010-abstract-parser-schema/spec.md` Post-Refactoring Verification Checklist — mark all completed items

**Checkpoint**: All User Stories delivered. All exports confirmed. Quickstart validated.
Final metrics captured.

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: Clean up, mark spec artifacts complete, prepare for review and merge.

- [x] T048 [P] Update `specs/refactor/010-abstract-parser-schema/behavioral-snapshot.md` — fill in all "Actual Output (after)" fields for new behaviors (Parser interface, AbstractParser rename, `string` parserOverride compile error)
- [x] T049 [P] Update `specs/refactor/010-abstract-parser-schema/testing-gaps.md` status fields — mark all 13 test cases as Complete (14 originally planned; BaseParser alias test removed after backward compat decision)
- [x] T050 [P] Update `specs/refactor/010-abstract-parser-schema/spec.md` status header — check `[x] Baseline Captured`, `[x] In Progress`, `[x] Validation`; leave `[ ] Complete` unchecked until deployment is confirmed
- [x] T051 [P] Verify performance targets: (a) run `time pnpm build` and confirm build time does not regress vs baseline (~2 s from metrics-before.md); (b) run a parse-throughput spot check — `jsonSchemaToZod` on 100 representative schemas — and confirm no regression > 5%; record results in `specs/refactor/010-abstract-parser-schema/metrics-after.md`
- [x] T052 [P] Run `pnpm build` one final time — confirm ESM and CJS outputs both build cleanly; confirm `dist/` contains all new module exports
- [x] T053 Create final commit on `refactor/010-abstract-parser-schema` with summary of all changes; push to `claude/refactor-parser-schema-tZoHq` (depends on T048–T052 all complete)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — **BLOCKS all user stories**
- **US1 (Phase 3)**: Depends on Phase 2 — foundational tests must exist first
- **US2 (Phase 4)**: Depends on Phase 3 — `Builder` interface must exist before `Parser.parse(): Builder`
- **US3 (Phase 5)**: Depends on Phase 4 — `ParserConstructor` must exist for `SchemaInputAdapter.selectParser()` return type
- **US4 (Phase 6)**: Depends on Phase 5 — `SchemaInputAdapter` must be defined before wiring into `parseSchema`
- **US5 (Phase 7)**: Depends on Phase 6 — all implementations must be complete before final validation
- **Polish (Final)**: Depends on Phase 7

### User Story Dependencies

```
Phase 1 Setup
    └─→ Phase 2 Foundational (gaps + baseline)
            └─→ US1 Builder Interface (Phase 3)
                    └─→ US2 Parser+AbstractParser (Phase 4)
                            └─→ US3 SchemaInputAdapter (Phase 5)
                                    └─→ US4 Adapter Wiring (Phase 6)
                                            └─→ US5 Public API (Phase 7)
                                                    └─→ Polish (Final)
```

### Parallel Opportunities Within Each Phase

- T004, T005, T006, T007, T008 can all run in parallel (different test files)
- T012, T013 (US1 tests) can run in parallel with each other
- T021, T022 (US2 tests) can run in parallel with each other
- T031, T032 (US3 tests) can run in parallel with each other
- T042, T043 (US5 polish) can run in parallel with each other
- T048, T049, T050, T051, T052 (Final polish) can all run in parallel with each other; T053 (commit) depends on all of them

---

## Parallel Example: Phase 2 (Foundational Gap Tests)

```bash
# Launch all gap test files simultaneously (different files, no dependencies):
Task: "Add boolean schema tests to test/JsonSchema/parsers/parseSchema.test.ts"       # T004
Task: "Add parserOverride tests to test/JsonSchema/parsers/parseSchema.test.ts"       # T005
Task: "Add circular reference depth-limit test to test/JsonSchema/parsers/parseSchema.test.ts" # T006
Task: "Create test/parsers/parseConditional.test.ts"                                   # T007
Task: "Create test/parsers/parseMultipleType.test.ts"                                  # T008
# NOTE: T004, T005, T006 target the same file — run sequentially within that file
# T007, T008 target different files — can run in parallel
```

## Parallel Example: Phase 4 (US2 Tests)

```bash
# Launch both US2 test files simultaneously:
Task: "Create test/Parser/parser-interface.test.ts"         # T021
Task: "Create test/SchemaInput/third-party-parser.test.ts"  # T022
```

---

## Implementation Strategy

### MVP First (US1 + US2 Only — Steps 0a and 0b)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: US1 — Builder Interface
4. Complete Phase 4: US2 — Parser Interface + AbstractParser
5. **STOP and VALIDATE**: Run `pnpm test`, confirm 100% pass; verify `Builder` and `Parser` are exported; demo that existing JSON Schema conversion is unchanged
6. This MVP satisfies the behaviour-preservation guarantee and the type-contract improvements

### Incremental Delivery

1. Setup + Foundational → Tests anchored, baseline tagged
2. US1 (Builder Interface) → Output contract enforced, `string` escape hatch removed (breaking)
3. US2 (Parser + AbstractParser) → Parser contract enforced, registry extensible
4. US3 (SchemaInputAdapter) → Protocol defined, default adapter implemented
5. US4 (Adapter Wiring) → Pipeline fully decoupled
6. US5 (Public API) → Ecosystem-ready, documented

---

## Notes

- `[P]` tasks operate on different files or are independently runnable within the same phase
- Each User Story checkpoint requires `pnpm test` to pass 100% before the next story begins
- Constitution Principle IV: every test MUST be written and verified to FAIL before its implementation task
- Constitution Principle IV red-green-refactor: after a test fails, implement only enough code to make it pass, then run again
- The smoke test `smoke-all-types.test.ts` (T009) is especially critical — run it after T028 (the mechanical rename) to confirm no parser type regressed
- Commit after each User Story checkpoint so each step is independently revertable
- `BaseParser` is deleted (T026) — no shim; this is a breaking change by design
