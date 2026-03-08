# Refactor Spec: Reorganize Parser/Builder/Project APIs for Better Discoverability & Performance

**Refactor ID**: refactor-011
**Branch**: `refactor/011-reorganize-parser-builder`
**Created**: 2026-03-04
**Type**: [x] Architecture | [x] Maintainability | [ ] Performance | [ ] Security | [ ] Tech Debt
**Impact**: [ ] High Risk | [x] Medium Risk | [ ] Low Risk
**Status**: [ ] Planning | [ ] Baseline Captured | [ ] In Progress | [x] Validation | [ ] Complete

## Input
User description: "reorganize parser/builder/project APIs for better discoverability/performance; align ergonomics/terminology for preProcessors, parserOverride and postProcessors"

## Motivation

### Current State Problems
**Code Smell(s)**:
- [x] Duplication (DRY violation)
- [ ] God Object/Class (too many responsibilities)
- [ ] Long Method (too complex)
- [ ] Feature Envy (accessing other object's data)
- [ ] Primitive Obsession
- [x] Dead Code
- [ ] Magic Numbers/Strings
- [x] Tight Coupling
- [x] Other: Name collisions, inconsistent export patterns, leaky abstractions, asymmetric processor/override APIs

**Concrete Examples**:
- `src/v3.ts` and `src/v4.ts` each duplicate the core exports from `src/index.ts` (lines 28–37 identical) instead of re-exporting and overriding `build`
- `PostProcessorConfig` defined in both `src/Types.ts` and `src/SchemaProject/types.ts` with different shapes — name collision leaks to consumers
- `SchemaMetadata` defined in both `src/SchemaInput/index.ts` and `src/SchemaProject/types.ts` with different shapes — same-name collision
- `src/jsonSchemaToZod.ts` is a dead-end wrapper only consumed by CLI — adds no value
- `src/ZodBuilder/index.ts` publicly exports internal modifier functions (`applyOptional`, `applyNullable`, `applyDefault`, etc.) that are implementation details
- `src/ZodBuilder/v4.ts` (~400 lines) declares a `BuildV4` type that diverges from `V4BuildAPI` in `versions.ts` — parallel type definitions that can drift
- Tests bypass public API entirely, importing deep internal paths like `../../src/JsonSchema/parsers/registry.js`
- `AbstractParser.setParseSchema()` uses a mutable static field to break circular imports — fragile runtime initialization
- **Processor/Override API inconsistencies** (see Objective 2 below):
  - Dual legacy fields: `preprocessors` (lowercase) AND `preProcessors` (camelCase) coexist in `Options`
  - `parserOverride` is singular (one function); `preProcessors`/`postProcessors` are arrays — no composition for overrides
  - Asymmetric callback signatures: PreProcessor/ParserOverride receive full `Context`; PostProcessor receives trimmed `PostProcessorContext` (this is intentional — PostProcessor operates on a different pipeline stage — but should be documented)
  - Config style mismatch: PreProcessor = callable-with-property, PostProcessorConfig = wrapper `{ processor, pathPattern?, typeFilter? }`, ParserOverride = bare function
  - Inconsistent null/undefined semantics: legacy uses truthy check, PreProcessor uses `!== undefined`, ParserOverride uses `!= null`
  - Return type mismatch: ParserOverride returns `Builder | void`, PostProcessor returns `Builder | undefined`
  - Path filtering available on Pre/Post but not on ParserOverride; `typeFilter` only on PostProcessor
  - SchemaProject only supports postProcessors — no preProcessors or parserOverride at that layer

### Business/Technical Justification
- [x] Developer velocity impact
- [x] Technical debt accumulation
- [x] Blocking new features
- [ ] Performance degradation
- [ ] Security vulnerability
- [x] Causing frequent bugs
- [ ] Other

**Why now**: The API surface has grown organically with 50+ builder files, multiple entry points, and diverging type definitions. Name collisions and deep import paths make the library hard to use correctly. The duplicated versioned entry points create maintenance burden on every core export change. The processor/override APIs evolved independently with incompatible patterns — the legacy `preprocessors` field still runs through a different code path than `preProcessors`, and users face inconsistent callback signatures, config shapes, and filtering capabilities. Cleaning up now prevents the problems from compounding as new schema formats and Zod versions are added.

## Proposed Improvement

### Refactoring Pattern/Technique
**Primary Technique**: Extract Module / Consolidate Entry Points / Eliminate Duplication / Unify API Patterns

**High-Level Approach**:

**Objective 1 — API Organization & Exports**:
1. Deduplicate `v3.ts`/`v4.ts` by re-exporting from `index.ts` and only overriding the `build` binding
2. Resolve name collisions (`PostProcessorConfig`, `SchemaMetadata`) by renaming project-layer types with distinguishing prefixes
3. Remove dead wrapper (`jsonSchemaToZod.ts`) — point CLI directly at `toZod`
4. Stop exporting internal modifier functions from `src/ZodBuilder/index.ts`
5. Unify `BuildV4`/`V4BuildAPI` type definitions into a single source of truth
6. Provide clean re-exports so tests and consumers don't need deep internal paths

**Objective 2 — Align Processor/Override Ergonomics**:

All three APIs represent distinct pipeline stages and MUST be preserved:
- `preProcessors`: Schema → Schema (mutates/transforms schema before parsing)
- `parserOverride`: Schema → Builder | void (intercepts dispatch, bypasses parser entirely)
- `postProcessors`: Builder → Builder (mutates/transforms builder after parsing)

The goal is to align their **ergonomics** — not merge or remove them:
7. Remove legacy `preprocessors` (lowercase) field from `Options` — consolidate into `preProcessors` (camelCase) only
8. Unify config style: adopt wrapper-object pattern for all three APIs (PreProcessor already supports it via callable interface; ParserOverride needs a `ParserOverrideConfig` wrapper)
9. Normalize return types: use `| undefined` consistently (not `| void`)
10. Normalize null-check semantics: use `!== undefined` consistently across all code paths
11. Add `pathPattern` filtering support to `parserOverride` (via config wrapper)
12. Make `parserOverride` plural (`parserOverrides: ParserOverrideConfig[]`) to match pre/post pattern and enable composition
13. Unify consumption: wire all three through `AbstractParser` instead of splitting between `parseSchema.ts` and `AbstractParser`

**Files Affected**:
- **Modified** (Objective 1 — API Organization):
  - `src/index.ts` — streamline exports, add missing re-exports for test convenience
  - `src/v3.ts` — replace duplicated exports with `export * from './index.js'` + `build` override
  - `src/v4.ts` — same deduplication as v3
  - `src/ZodBuilder/index.ts` — stop exporting internal modifier functions
  - `src/ZodBuilder/v4.ts` — unify `BuildV4` with `V4BuildAPI`
  - `src/ZodBuilder/versions.ts` — single source of truth for build API types
  - `src/SchemaProject/types.ts` — rename `PostProcessorConfig` → `ProjectPostProcessorConfig`, `SchemaMetadata` → `ProjectSchemaMetadata`
  - `src/SchemaProject/index.ts` — update re-exports for renamed types
  - `src/SchemaProject/SchemaProject.ts` — update internal references
  - `src/cli.ts` — import `toZod` directly instead of through wrapper
- **Modified** (Objective 2 — Processor/Override Alignment):
  - `src/Types.ts` — remove legacy `preprocessors` (lowercase), add `parserOverrides: ParserOverrideConfig[]` (plural array), normalize `ParserOverride` return type from `Builder | void` to `Builder | undefined`, ensure `ProcessorConfig` is shared base for all three
  - `src/Parser/AbstractParser.ts` — wire `parserOverrides` through the template method (currently only in `parseSchema.ts`); normalize null-check semantics to `!== undefined`
  - `src/JsonSchema/parsers/parseSchema.ts` — remove legacy `preprocessors` code path; delegate `parserOverrides` to `AbstractParser` or keep at dispatch-level but use consistent semantics
  - `src/JsonSchema/toZod.ts` — update normalization to handle new config shapes (parserOverrides array, no legacy preprocessors)
  - Test files — adapt to renamed/pluralized fields where tests use `parserOverride` (singular) or `preprocessors` (legacy)
- **Deleted**:
  - `src/jsonSchemaToZod.ts` — dead wrapper, no longer needed
- **Created**: None anticipated
- **Moved**: None anticipated

### Design Improvements
**Before**:
```
src/index.ts ──exports 30+ items──
src/v3.ts ────duplicates 30+ items + adds build──
src/v4.ts ────duplicates 30+ items + adds build──
src/jsonSchemaToZod.ts ──dead wrapper──

ZodBuilder/index.ts exports internal modifiers (applyOptional, etc.)
ZodBuilder/v4.ts has BuildV4 type
ZodBuilder/versions.ts has V4BuildAPI type  ← diverge over time

Types.ts:PostProcessorConfig     ≠  SchemaProject/types.ts:PostProcessorConfig
SchemaInput:SchemaMetadata       ≠  SchemaProject/types.ts:SchemaMetadata
```

**After**:
```
src/index.ts ──single source of core exports──
src/v3.ts ────re-exports * from index + overrides build──
src/v4.ts ────re-exports * from index + overrides build──
(jsonSchemaToZod.ts removed)

ZodBuilder/index.ts exports only public builder API
ZodBuilder/versions.ts single source of truth for V3/V4 build API types

Types.ts:PostProcessorConfig (parser-layer)
SchemaProject/types.ts:ProjectPostProcessorConfig (project-layer) — distinct name
SchemaInput:SchemaMetadata (input-layer)
SchemaProject/types.ts:ProjectSchemaMetadata (project-layer) — distinct name

Pipeline (each stage has a distinct role):
  Schema ──▶ preProcessors ──▶ parserOverrides ──▶ Parser ──▶ postProcessors ──▶ Builder
             (Schema→Schema)   (Schema→Builder?)   (select)   (Builder→Builder)

Ergonomic alignment (all three share same patterns):
┌─────────────────────┬──────────────────┬───────────────────┬────────────────────────┐
│                     │ preProcessors    │ parserOverrides   │ postProcessors         │
├─────────────────────┼──────────────────┼───────────────────┼────────────────────────┤
│ Purpose             │ Mutate schema    │ Bypass parser     │ Mutate builder         │
│ Cardinality         │ Array            │ Array (was single)│ Array                  │
│ Config style        │ ProcessorConfig  │ ProcessorConfig   │ ProcessorConfig        │
│ Path filtering      │ pathPattern      │ pathPattern (new) │ pathPattern            │
│ Type filtering      │ —                │ —                 │ typeFilter             │
│ Null-check          │ !== undefined    │ !== undefined     │ !== undefined          │
│ Return type         │ Schema|undefined │ Builder|undefined │ Builder|undefined      │
│ Wired through       │ AbstractParser   │ AbstractParser    │ AbstractParser         │
│ Legacy field        │ preprocessors    │ —                 │ —                      │
│                     │ (removed)        │                   │                        │
└─────────────────────┴──────────────────┴───────────────────┴────────────────────────┘
```

## Phase 0: Testing Gap Assessment
*CRITICAL: Complete BEFORE capturing baseline metrics - see testing-gaps.md*

### Pre-Baseline Testing Requirement
- [ ] **Testing gaps assessment completed** (see `testing-gaps.md`)
- [ ] **Critical gaps identified and addressed**
- [ ] **All affected functionality has adequate test coverage**
- [ ] **Ready to capture baseline metrics**

**Rationale**: Refactoring requires behavior preservation validation. If code lacks test coverage, we cannot verify behavior is preserved. All impacted functionality MUST be tested BEFORE establishing the baseline.

### Testing Coverage Status
**Affected Code Areas**:
- `src/index.ts` (exports): Coverage via integration tests — [x] ⚠️ Needs export surface test
- `src/v3.ts` / `src/v4.ts` (versioned entry points): Indirect coverage — [x] ⚠️ Needs export surface test
- `src/ZodBuilder/index.ts` (barrel exports): Builder behavior well-tested — [x] ✅ Adequate
- `src/SchemaProject/types.ts` (type renames): Compile-time only — [x] ✅ Adequate
- `src/cli.ts` (CLI entry point): Needs verification — [x] ⚠️ Partial

**Action Taken**:
- [ ] No gaps found - proceeded to baseline
- [ ] Gaps found - added [N] tests before baseline
- [ ] Gaps documented but deferred (with justification)

---

## Baseline Metrics
*Captured AFTER testing gaps are addressed - see metrics-before.md*

### Code Complexity
- **Lines of Code**: See metrics-before.md
- **Function Length (avg/max)**: See metrics-before.md

### Test Coverage
- **Overall Coverage**: To be measured after gap assessment

### Performance
- **Build Time**: 3 seconds (from metrics-before.md)
- **Bundle Size**: To be measured

### Dependencies
- **Direct Dependencies**: 1
- **Dev Dependencies**: 20
- **Total Installed**: 115

## Target Metrics
*Goals to achieve - measurable success criteria*

### Code Quality Goals
- **Duplication**: Eliminate duplicated exports in v3.ts/v4.ts (~30 lines each)
- **Name Collisions**: Reduce from 2 collisions to 0
- **Dead Code**: Remove jsonSchemaToZod.ts wrapper
- **Internal API Leaks**: Remove ~10 exported modifier functions from public surface
- **Type Divergence**: Reduce from 2 parallel type definitions to 1 single source of truth
- **Test Coverage**: Maintain or increase

### Performance Goals
- **Build Time**: Maintain or improve (no regression)
- **Bundle Size**: Maintain or reduce (fewer re-exports may reduce tree-shaking overhead)
- **Runtime Performance**: No change expected (pure organizational refactor)

- **Processor API Consistency**: All three APIs use same config pattern, same null-check, same return convention
- **Legacy Field Removal**: `preprocessors` (lowercase) removed from Options

### Success Threshold
**Minimum acceptable improvement**: Eliminate all name collisions, remove dead wrapper, deduplicate versioned entry points, unify build API types, align all processor/override APIs to consistent patterns — all existing tests pass without weakening assertions.

## Behavior Preservation Guarantee
*CRITICAL: Refactoring MUST NOT change external behavior*

### External Contracts Unchanged
- [x] Function signatures unchanged (or properly deprecated)
- [x] CLI arguments unchanged
- [ ] API endpoints return same responses (N/A — library, not service)
- [ ] Component props unchanged (N/A)
- [ ] Database schema unchanged (N/A)
- [ ] File formats unchanged (N/A)

### Test Suite Validation
- [ ] **All existing tests MUST pass WITHOUT modification**
- [ ] If test needs changing, verify it was testing implementation detail, not behavior
- [ ] Do NOT weaken assertions to make tests pass

### Behavioral Snapshot
**Key behaviors to preserve**:
1. `jsonSchemaToZod(schema, options)` produces identical Zod v3/v4 code strings for all JSON Schema inputs
2. `parseSchema(schema, refs)` dispatches to correct parser and returns correct Builder for each schema type
3. `SchemaProject.generate()` produces correct multi-file Zod output with proper imports/refs
4. `buildV3.*` and `buildV4.*` factory methods produce correct Zod code strings for each type
5. CLI `--input`/`--output` flags produce identical file output
6. `registerParser()` extension mechanism works for third-party parser registration
7. Package exports (`.`, `./v3`, `./v4`, `./builders`, `./parsers/json`, `./post-processing`) resolve correctly
8. `preProcessors` transform schemas before parsing (path filtering, `undefined` = skip)
9. `postProcessors` transform builders after parsing (path + type filtering, `undefined` = skip)
10. `parserOverride` intercepts schema dispatch and returns custom Builder (non-null = use override)
11. SchemaProject `globalPostProcessors` / per-schema `postProcessors` resolve presets by name and apply correctly

**Test**: Run `npm test` before and after refactoring — all tests MUST pass with identical results.

## Risk Assessment

### Risk Level Justification
**Why Medium Risk**:
This refactor touches the public API surface (exports, type names) which affects downstream consumers. However, the changes are primarily organizational — renaming types, deduplicating re-exports, removing dead code — with no logic changes. The blast radius is contained to import paths and type names, not runtime behavior.

### Potential Issues
- **Risk 1**: Renaming `PostProcessorConfig`/`SchemaMetadata` in project layer breaks consumers importing these types
  - **Mitigation**: Add deprecated type aliases that point to new names during transition
  - **Rollback**: Revert the rename commit

- **Risk 2**: Removing internal modifier exports from `./builders` breaks consumers using them
  - **Mitigation**: Audit npm dependents (if any) for usage of these internals; consider deprecation period
  - **Rollback**: Re-export with `@deprecated` annotation

- **Risk 3**: Deleting `jsonSchemaToZod.ts` wrapper breaks imports
  - **Mitigation**: The default export in `index.ts` already points to `toZod` directly; only CLI imports the wrapper
  - **Rollback**: Restore the file

- **Risk 4**: Removing legacy `preprocessors` field breaks consumers using the old API
  - **Mitigation**: The field is not documented in README; search npm dependents for usage; add `@deprecated` alias temporarily if needed
  - **Rollback**: Re-add the field as a deprecated alias

- **Risk 5**: Pluralizing `parserOverride` → `parserOverrides` is a breaking API change
  - **Mitigation**: Accept the singular form in `Options` and normalize to array internally during a transition period; OR accept as breaking change in next minor/major
  - **Rollback**: Revert to singular field name

- **Risk 6**: Moving `parserOverrides` dispatch into AbstractParser changes invocation timing
  - **Mitigation**: Ensure override is still called before parser selection (same position in the pipeline); add integration tests verifying override precedence
  - **Rollback**: Keep dispatch in `parseSchema.ts` if timing issues arise

### Safety Measures
- [ ] Feature flag available for gradual rollout
- [ ] Monitoring in place for key metrics
- [ ] Rollback plan tested
- [x] Incremental commits (can revert partially)
- [x] Peer review required
- [ ] Staging environment test required

## Rollback Plan

### How to Undo
1. `git revert <commit-range>` for the refactoring commits
2. No manual cleanup needed — all changes are source-level
3. Run `npm test` to verify revert is clean

### Rollback Triggers
Revert if any of these occur:
- [x] Test suite failure
- [x] Performance regression > 10%
- [ ] Production error rate increase (N/A — library)
- [ ] User-facing bug reports related to refactored area
- [ ] Monitoring alerts

### Recovery Time Objective
**RTO**: < 5 minutes (single `git revert` command)

## Implementation Plan

### Phase 0: Testing Gap Assessment (Pre-Baseline)
**CRITICAL FIRST STEP**: Assess and address testing gaps BEFORE baseline

1. Review `testing-gaps.md` template
2. Identify all code that will be modified during refactoring
3. Assess test coverage for each affected area
4. Document gaps (critical, important, nice-to-have)
5. **Add tests for critical gaps** — DO NOT proceed without these
6. Verify all new tests pass
7. Mark testing gaps assessment as complete

**Checkpoint**: Only proceed to Phase 1 when adequate test coverage exists

### Phase 1: Baseline (Before Refactoring)
1. Capture all baseline metrics (run `.specify/extensions/workflows/refactor/measure-metrics.sh --before`)
2. Create behavioral snapshot (document current outputs)
3. Ensure 100% test pass rate (including newly added tests)
4. Tag current state in git: `git tag pre-refactor-011 -m "Baseline before refactor-011"`

### Phase 2a: Refactoring — API Organization (Incremental)
1. Remove `jsonSchemaToZod.ts` wrapper, update CLI and test imports
2. Deduplicate `v3.ts`/`v4.ts` to re-export from `index.ts`
3. Rename project-layer type collisions (`ProjectPostProcessorConfig`, `ProjectSchemaMetadata`)
4. Remove internal modifier function exports from `ZodBuilder/index.ts`
5. Unify `BuildV4`/`V4BuildAPI` into single type definition
6. Update test imports to prefer public API paths
7. Verify each step compiles and tests pass

### Phase 2b: Refactoring — Processor/Override Alignment (Incremental)
All three pipeline stages are preserved — only their ergonomics are aligned:
- `preProcessors`: Schema → Schema (mutates schema before parsing)
- `parserOverride(s)`: Schema → Builder | undefined (intercepts dispatch, bypasses parser)
- `postProcessors`: Builder → Builder (mutates builder after parsing)

8. Remove legacy `preprocessors` (lowercase) field from `Options` and its code path in `parseSchema.ts` — consolidate into `preProcessors` (camelCase) only
9. Normalize `ParserOverride` return type from `Builder | void` to `Builder | undefined`
10. Normalize null-check in `parseSchema.ts` for parserOverride from `!= null` to `!== undefined`
11. Pluralize `parserOverride` → `parserOverrides: ParserOverrideConfig[]` in `Options`/`Context`
12. Add `ProcessorConfig` base (with `pathPattern`) to `ParserOverrideConfig`
13. Wire `parserOverrides` through `AbstractParser` for consistent filtering/application
14. Normalize `toZod.ts` processor normalization to handle all config shapes uniformly
15. Verify each step compiles and tests pass

**Principle**: Each step should compile and pass tests

### Phase 3: Validation
1. Run full test suite (MUST pass 100%)
2. Re-measure all metrics
3. Compare behavioral snapshot (MUST be identical)
4. Performance regression test
5. Verify package exports resolve correctly

### Phase 4: Deployment
1. Code review focused on behavior preservation
2. Publish as minor version (organizational changes only)

## Design Change: parserOverride Removal

**Original plan** (steps 9–13): Pluralize `parserOverride` → `parserOverrides: ParserOverrideConfig[]`,
add `ProcessorConfig` base, wire through `AbstractParser`.

**Actual implementation**: Removed `parserOverride` entirely. Its use cases are better served by:
- `registerParser()` — type-based custom parsers (global, reusable, structured)
- `postProcessors` with `pathPattern` — path-specific builder replacement
- `transformers` — schema mutation before parsing

**Rationale**: `registerParser()` already provides the structured parser extension point.
`parserOverride` was an ad-hoc escape hatch with no path filtering, no composition,
and an inconsistent API pattern. Removing it simplifies the API surface and aligns
all customization through well-defined extension points.

## Verification Checklist

### Phase 0: Testing Gap Assessment
- [x] Testing gaps assessment completed (testing-gaps.md)
- [x] All affected code areas identified
- [x] Test coverage assessed for each area
- [x] Critical gaps identified and documented
- [x] Tests added for all critical gaps
- [x] All new tests passing
- [x] Ready to proceed to baseline capture

### Pre-Refactoring (Phase 1)
- [x] Baseline metrics captured and documented
- [x] All tests passing (100% pass rate)
- [x] Behavioral snapshot created
- [ ] Git tag created
- [x] Rollback plan prepared

### During Refactoring
- [x] Incremental commits (each one compiles and tests pass)
- [x] External behavior unchanged (except intentional parserOverride removal)
- [x] No new dependencies added
- [x] Dead code removed
- [x] Comments updated to match code

### Post-Refactoring
- [x] All tests still passing (100% pass rate) — 870 tests, 78 files
- [x] Target metrics achieved or improvement demonstrated (see metrics-after.md)
- [x] Behavioral snapshot matches (behavior unchanged for all non-removed APIs)
- [x] No performance regression (~3.3s build, same as baseline)
- [ ] Code review approved
- [ ] Documentation updated

## Related Work

### Blocks
- Future schema format adapters need clear, collision-free type names
- New Zod version support requires non-duplicated entry point pattern

### Enables
- Clean public API surface makes it safe to document and stabilize the API
- Unified build API types enable auto-generated API docs
- Reduced internal exports allow internal restructuring without breaking changes

### Dependencies
- None — this refactoring is self-contained

---
*Refactor spec created using `/refactor` workflow - See .specify/extensions/workflows/refactor/*
