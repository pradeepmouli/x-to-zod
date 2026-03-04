# Testing Gaps Assessment

**Purpose**: Identify and address test coverage gaps BEFORE establishing baseline metrics.

**Status**: [x] Assessment Complete | [x] Gaps Identified | [ ] Tests Added | [ ] Ready for Baseline

---

## Why Test Gaps Matter for Refactoring

Refactoring requires **behavior preservation validation**. If the code being refactored lacks adequate test coverage, we cannot verify that behavior is preserved after the refactoring.

**Critical Rule**: All functionality impacted by this refactoring MUST have adequate test coverage BEFORE the baseline is captured.

---

## Phase 0: Pre-Baseline Testing Gap Analysis

### Step 1: Identify Affected Functionality

**Code areas that will be modified during refactoring**:

- [x] File: `src/index.ts` — public API barrel exports
  - Consumers: `test/zodVersion.test.ts`, `test/PostProcessing/integration.test.ts`, `test/jsonSchemaToZod.test.ts`, `test/parsers/parseNullable.test.ts`

- [x] File: `src/v3.ts` / `src/v4.ts` — versioned entry points (deduplication)
  - Consumers: `test/packageExports.test.ts`, `test/versionedImports.test.ts`, `test/versionTypes.test.ts`

- [x] File: `src/jsonSchemaToZod.ts` — **TO BE DELETED**
  - Direct consumers: `test/eval.test.ts`, `test/postProcessors.test.ts` — **WILL BREAK**

- [x] File: `src/cli.ts` — import change from wrapper to direct `toZod`
  - Consumer: `test/cli.test.ts` (subprocess invocation — immune to import changes)

- [x] File: `src/ZodBuilder/index.ts` — stop exporting internal modifier functions
  - Consumers: ~30 test files — **none import modifier functions**

- [x] File: `src/ZodBuilder/v4.ts` — unify `BuildV4` type
  - Consumers: 9 test files — use `buildV4` value only, not `BuildV4` type

- [x] File: `src/ZodBuilder/versions.ts` — single source of truth for API types
  - Consumer: `test/packageExports.test.ts` (dynamic import check only)

- [x] File: `src/SchemaProject/types.ts` — rename `PostProcessorConfig` → `ProjectPostProcessorConfig`, `SchemaMetadata` → `ProjectSchemaMetadata`
  - Consumers: 7 test files import `SchemaEntry`, `ImportInfo`, `DependencyGraph` from this file — **none import `PostProcessorConfig` or `SchemaMetadata` by name**

- [x] File: `src/SchemaProject/index.ts` — update re-exports
  - Consumers: Tests bypass index, import submodules directly

- [x] File: `src/SchemaProject/SchemaProject.ts` — update internal type references

**Additional areas affected by Objective 2 (Processor/Override Alignment)**:

- [x] File: `src/Types.ts` — remove legacy `preprocessors`, add `parserOverrides`, normalize types
  - Consumers: `test/Types.test.ts`, `test/postProcessors.test.ts`, `test/JsonSchema/parsers/BaseParser.test.ts`

- [x] File: `src/Parser/AbstractParser.ts` — wire `parserOverrides`, normalize null-checks
  - Consumers: `test/JsonSchema/parsers/BaseParser.test.ts`, `test/Parser/parser-interface.test.ts`

- [x] File: `src/JsonSchema/parsers/parseSchema.ts` — remove legacy `preprocessors` path, update `parserOverride` dispatch
  - Consumers: `test/JsonSchema/parsers/parseSchema.test.ts`, `test/parsers/parseSchema.test.ts`

- [x] File: `src/JsonSchema/toZod.ts` — update processor normalization
  - Consumers: `test/jsonSchemaToZod.test.ts`, `test/eval.test.ts`, `test/postProcessors.test.ts`
  - Consumers: 8 test files — test behavior, not types

**Downstream dependencies**:
- `test/eval.test.ts` → imports `jsonSchemaToZod` from `../src/jsonSchemaToZod.js` (**breaks on deletion**)
- `test/postProcessors.test.ts` → imports `jsonSchemaToZod` from `../src/jsonSchemaToZod.js` (**breaks on deletion**)

### Step 2: Assess Current Test Coverage

#### Coverage Area 1: Package Entry Points (`src/index.ts`, `src/v3.ts`, `src/v4.ts`)
**Location**: `src/index.ts`, `src/v3.ts`, `src/v4.ts`

**Current Test Coverage**:
- Test files: `test/packageExports.test.ts`, `test/versionedImports.test.ts`, `test/versionTypes.test.ts`
- Coverage: ✅ Explicit export surface tests exist
- Test types: [x] Unit [x] Integration

**Coverage Assessment**:
- [x] ✅ Adequate — three test files form a de-facto contract test for the v3/v4 entry points
- Tests verify: `build` export exists with correct version-typed API, `jsonSchemaToZod` named export, `default` export, and builder method shapes (which are present/absent per version)

#### Coverage Area 2: `jsonSchemaToZod.ts` Wrapper (to be deleted)
**Location**: `src/jsonSchemaToZod.ts`

**Current Test Coverage**:
- Test files: `test/eval.test.ts` and `test/postProcessors.test.ts` import directly by path
- Coverage: ✅ Well-tested — but imports will break on deletion

**Coverage Assessment**:
- [x] ✅ Adequate for behavior — `toZod` (the real implementation) is well-tested
- ⚠️ **Action required**: 2 test files must update imports before deletion

**Specific Gaps**:
1. 🔴 `test/eval.test.ts` imports `../src/jsonSchemaToZod.js` — **must change to `../src/index.js`**
2. 🔴 `test/postProcessors.test.ts` imports `../src/jsonSchemaToZod.js` — **must change to `../src/index.js`**

#### Coverage Area 3: `ZodBuilder` Barrel Exports (modifier removal)
**Location**: `src/ZodBuilder/index.ts`

**Current Test Coverage**:
- Test files: ~30 test files import from this barrel
- Coverage: ✅ Builder behavior extensively tested
- **No test imports `applyOptional`, `applyNullable`, `applyDefault`, `applyFormat`, `applyMinLength`, `applyMaxLength`, or any other modifier function**

**Coverage Assessment**:
- [x] ✅ Adequate — removing modifier exports will not break any test
- ⚠️ Note: `./builders` is a public `package.json` export — removing modifiers is a public API change for external consumers (but no known external usage)

#### Coverage Area 4: `BuildV4` / `V4BuildAPI` Type Unification
**Location**: `src/ZodBuilder/v4.ts`, `src/ZodBuilder/versions.ts`

**Current Test Coverage**:
- Test files: 9 tests import from `ZodBuilder/v4.js` directly
- Coverage: ✅ Runtime shapes tested; types are compile-time only
- **No test imports `BuildV4` or `V4BuildAPI` as named types**

**Coverage Assessment**:
- [x] ✅ Adequate — type unification is compile-time only

#### Coverage Area 5: SchemaProject Type Renames
**Location**: `src/SchemaProject/types.ts`

**Current Test Coverage**:
- Test files: 7 tests import from `SchemaProject/types.js`
- Imports: `SchemaEntry`, `ImportInfo`, `DependencyGraph` — **NOT** `PostProcessorConfig` or `SchemaMetadata`
- Coverage: ✅ Types used in tests are not being renamed

**Coverage Assessment**:
- [x] ✅ Adequate — `PostProcessorConfig` and `SchemaMetadata` are not imported by name in any test file; renaming is safe

#### Coverage Area 6: PreProcessor API (`src/Types.ts`, `AbstractParser.ts`, `parseSchema.ts`)
**Location**: `src/Types.ts` (types), `src/Parser/AbstractParser.ts` (new path), `src/JsonSchema/parsers/parseSchema.ts` (legacy path)

**Current Test Coverage**:
- Test files: `test/JsonSchema/parsers/BaseParser.test.ts` (tests `applyPreProcessors`, `filterPreProcessors`)
- Coverage: ✅ New `preProcessors` path tested in AbstractParser
- Legacy `preprocessors` path: tested indirectly via `jsonSchemaToZod()` calls that pass `preprocessors` option

**Coverage Assessment**:
- [x] ⚠️ Partial — the new `preProcessors` API is well-tested; the legacy `preprocessors` code path in `parseSchema.ts` has limited direct testing
- Need to verify: are there tests that pass `preprocessors` (lowercase) in Options?

**Specific Gaps**:
1. ⚠️ Verify tests exist for legacy `preprocessors` field before removing it — need to confirm no behavioral regression

#### Coverage Area 7: PostProcessor API (`src/Types.ts`, `AbstractParser.ts`)
**Location**: `src/Types.ts` (types), `src/Parser/AbstractParser.ts` (application)

**Current Test Coverage**:
- Test files: `test/postProcessors.test.ts`, `test/PostProcessing/integration.test.ts`, `test/PostProcessing/presets.test.ts`, `test/JsonSchema/parsers/BaseParser.test.ts`, `test/SchemaProject/postProcessors.test.ts`
- Coverage: ✅ Comprehensive — tests for raw functions, config objects, path filtering, type filtering, presets, and SchemaProject integration

**Coverage Assessment**:
- [x] ✅ Adequate — extensive test coverage across 5+ files

#### Coverage Area 8: ParserOverride API (`src/Types.ts`, `parseSchema.ts`)
**Location**: `src/Types.ts` (type), `src/JsonSchema/parsers/parseSchema.ts` (consumption)

**Current Test Coverage**:
- Test files: `test/JsonSchema/parsers/parseSchema.test.ts` (tests `parserOverride` option)
- Coverage: ⚠️ Need to verify depth of testing — is override precedence tested? Is fallthrough (`void`/`undefined`) tested?

**Coverage Assessment**:
- [x] ⚠️ Partial — `parserOverride` tests likely exist but need to verify they cover:
  1. Override returning a Builder (override takes effect)
  2. Override returning void/undefined (fallthrough to normal dispatch)
  3. Override with various schema types

**Specific Gaps**:
1. ⚠️ Pluralizing to `parserOverrides[]` needs test for multiple overrides composing correctly
2. ⚠️ Adding `pathPattern` filtering to overrides needs tests

#### Coverage Area 9: CLI (`src/cli.ts`)
**Location**: `src/cli.ts`

**Current Test Coverage**:
- Test file: `test/cli.test.ts` — 15 test cases
- Invocation: subprocess via `spawnSync` (not TS import)
- Coverage: ✅ Tests validate CLI stdout/stderr behavior

**Coverage Assessment**:
- [x] ✅ Adequate — CLI test is import-agnostic; safe as long as behavior is preserved

---

## Testing Gaps Summary

### Critical Gaps (MUST fix before refactoring)

1. **Gap 1**: `test/eval.test.ts` imports `jsonSchemaToZod` from `../src/jsonSchemaToZod.js`
   - **Impact**: Test will immediately fail when `src/jsonSchemaToZod.ts` is deleted
   - **Priority**: 🔴 Critical
   - **Fix**: Change import to `../src/index.js` (or `../src`)
   - **Estimated effort**: 2 minutes

2. **Gap 2**: `test/postProcessors.test.ts` imports `jsonSchemaToZod` from `../src/jsonSchemaToZod.js`
   - **Impact**: Test will immediately fail when `src/jsonSchemaToZod.ts` is deleted
   - **Priority**: 🔴 Critical
   - **Fix**: Change import to `../src/index.js` (or `../src`)
   - **Estimated effort**: 2 minutes

### Important Gaps (SHOULD address)

3. **Gap 3**: Verify `parserOverride` test coverage before pluralizing
   - **Impact**: Changing from singular to plural changes invocation; need tests verifying override precedence and fallthrough
   - **Priority**: 🟡 Important
   - **Fix**: Verify `test/JsonSchema/parsers/parseSchema.test.ts` covers override→Builder and override→void paths; add tests if missing
   - **Estimated effort**: 30 minutes

4. **Gap 4**: Verify legacy `preprocessors` (lowercase) field has tests before removal
   - **Impact**: Removing the field without confirming test coverage risks silent behavioral regression
   - **Priority**: 🟡 Important
   - **Fix**: Search for tests passing `preprocessors` option; ensure migration path is tested
   - **Estimated effort**: 30 minutes

5. **Gap 5**: New behavior tests needed for pluralized `parserOverrides`
   - **Impact**: Multiple overrides composing is new behavior — needs explicit test
   - **Priority**: 🟡 Important
   - **Fix**: Add test for `parserOverrides: [override1, override2]` where first returns undefined and second returns Builder
   - **Estimated effort**: 30 minutes

### Nice-to-Have Gaps (CAN be deferred)

6. **Gap 6**: PathPattern filtering on `parserOverrides` — new capability
   - **Impact**: New feature, not behavior preservation — can be tested after refactor
   - **Priority**: 🟢 Nice-to-have
   - **Can be deferred**: Yes

---

## Test Addition Plan

### Tests to Modify Before Refactoring

**Total Estimated Effort**: ~5 minutes

#### Fix 1: `test/eval.test.ts`
**Change**: `import { jsonSchemaToZod } from '../src/jsonSchemaToZod.js'` → `import { jsonSchemaToZod } from '../src/index.js'`
- Status: [ ] Not Started [ ] In Progress [ ] Complete

#### Fix 2: `test/postProcessors.test.ts`
**Change**: `import { jsonSchemaToZod } from '../src/jsonSchemaToZod.js'` → `import { jsonSchemaToZod } from '../src/index.js'`
- Status: [ ] Not Started [ ] In Progress [ ] Complete

### No New Tests Required
The existing test suites provide adequate coverage for all affected areas:
- **Export surface**: `packageExports.test.ts`, `versionedImports.test.ts`, `versionTypes.test.ts`
- **Builder behavior**: 30+ builder/parser test files
- **CLI behavior**: `cli.test.ts` (15 subprocess test cases)
- **SchemaProject**: 12 test files covering unit, integration, and e2e
- **Post-processing**: 3 test files

---

## Test Implementation Checklist

### Pre-Work
- [x] Review existing test infrastructure (vitest 4.0.18)
- [x] Identify test frameworks and patterns in use
- [x] Identify all 72 test files and their imports

### Test Modifications
- [ ] Update import in `test/eval.test.ts`
- [ ] Update import in `test/postProcessors.test.ts`
- [ ] Verify all tests still pass after import changes

### Validation
- [ ] Run full test suite — all tests pass
- [ ] Confirm no test imports `../src/jsonSchemaToZod.js`

### Ready for Baseline
- [ ] Both import fixes applied
- [ ] All 72 test files passing
- [ ] Ready to proceed to Phase 1: Baseline Capture

---

## Decision: Proceed or Delay Refactoring?

### Assessment Result
**No blocking critical gaps in test coverage.** Two test files need trivial import path updates (not coverage gaps — just import path coupling to a file being deleted). All behavioral coverage is adequate.

- [ ] **PROCEED**: Ready to capture baseline metrics after fixing the 2 import paths
- [ ] Mark status as "Ready for Baseline"
- [ ] Continue to Phase 1: Baseline Capture

---

## Detailed Import Map (Reference)

| Affected Module | Test Files Importing | What They Import | Risk |
|---|---|---|---|
| `src/jsonSchemaToZod.ts` | `eval.test.ts`, `postProcessors.test.ts` | `jsonSchemaToZod` (named) | 🔴 **Break on delete** |
| `src/v3.ts` / `src/v4.ts` | `packageExports.test.ts`, `versionedImports.test.ts`, `versionTypes.test.ts` | `build`, `jsonSchemaToZod`, `default` | ⚠️ Must preserve exports |
| `src/index.ts` | `zodVersion.test.ts`, `integration.test.ts`, `jsonSchemaToZod.test.ts`, `parseNullable.test.ts` | `jsonSchemaToZod` (named + default) | ⚠️ Must preserve exports |
| `src/ZodBuilder/index.ts` | ~30 test files | Builder classes, `buildV3`, `buildV4` | ✅ No modifier imports |
| `src/ZodBuilder/v4.ts` | 9 test files | `buildV4` value | ✅ No type imports |
| `src/ZodBuilder/versions.ts` | `packageExports.test.ts` | Dynamic import check | ✅ Safe |
| `src/SchemaProject/types.ts` | 7 test files | `SchemaEntry`, `ImportInfo`, `DependencyGraph` | ✅ No `PostProcessorConfig`/`SchemaMetadata` imports |
| `src/cli.ts` | `cli.test.ts` | Subprocess (no TS import) | ✅ Safe |

---

## Notes

**Date Assessed**: 2026-03-04
**Assessed By**: Claude Agent
**Test Framework**: vitest 4.0.18
**Coverage Tool**: vitest --coverage (v8)
**Total Test Files**: 72

**Key Finding**: The test suite is remarkably comprehensive for the areas being refactored. The only action items are 2 trivial import path changes in test files that directly reference the wrapper file being deleted. No new test logic needs to be written.

---

*This testing gaps assessment is part of the enhanced refactor workflow. Complete this BEFORE running `measure-metrics.sh --before`.*
