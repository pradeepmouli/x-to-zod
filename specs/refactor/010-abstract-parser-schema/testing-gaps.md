# Testing Gaps Assessment — refactor-010

**Purpose**: Identify and address test coverage gaps BEFORE establishing baseline metrics.

**Status**: [ ] Assessment Complete | [ ] Gaps Identified | [ ] Tests Added | [ ] Ready for Baseline

**Date Assessed**: 2026-02-20
**Assessed By**: AI Agent (speckit.refactor)
**Test Framework**: see package.json (likely Vitest or Jest)
**Coverage Tool**: run `npm run test:coverage` to determine

---

## Why Test Gaps Matter for Refactoring

Refactoring requires **behavior preservation validation**. This refactoring modifies three core files
(`parseSchema.ts`, `BaseParser.ts`, `registry.ts`) that every input flows through. If any parser path
is untested, we cannot verify that the abstract adapter layer preserves identical behavior.

**Critical Rule**: All functionality impacted by this refactoring MUST have adequate test coverage
BEFORE the baseline is captured.

---

## Phase 0: Pre-Baseline Testing Gap Analysis

### Step 1: Identify Affected Functionality

**Code areas that will be modified during refactoring**:

- [x] File: `src/JsonSchema/parsers/parseSchema.ts`
  - Functions: `parseSchema`, `selectParser`, `addDescribes`, `addDefaults`, `addAnnotations`
  - Circular-ref guard logic, pre-processor loop, `parserOverride` branch

- [x] File: `src/JsonSchema/parsers/BaseParser.ts`
  - Classes: `BaseParser`
  - Methods: `parse`, `applyPreProcessors`, `applyPostProcessors`, `applyMetadata`,
    `filterPreProcessors`, `filterPostProcessors`, `createChildContext`, `parseChild`

- [x] File: `src/JsonSchema/parsers/registry.ts`
  - Functions: `selectParserClass`
  - The entire priority-ordered branch tree (nullable → not → enum → const → tuple → multipleType → conditional → combinators → explicit type → type inference)

- [x] File: `src/JsonSchema/types/index.ts`
  - Functions: `isJSONSchema`, `getSchemaVersion`, `isVersion`

- [x] File: `src/JsonSchema/is.ts`
  - Functions: `is.nullable`, `is.not`, `is.const`, `is.multipleType`, `is.conditional`, `is.anyOf`, `is.allOf`, `is.oneOf`, `is.object`, `is.array`, `is.primitive`

- [x] File: `src/SchemaProject/parseRef.ts`
  - Functions: `parseRef` (ref-resolution used in `parseSchema.ts`)

- [x] File: `src/Types.ts`
  - Types: `Context`, `PreProcessor`, `PostProcessor`, `PostProcessorConfig`, `ParserOverride`, `ParserSelector`

- [x] File: `src/ZodBuilder/BaseBuilder.ts`
  - Classes: `ZodBuilder` — the class that will be made to implement the new `Builder` interface
  - Methods: `text()`, `optional()`, `nullable()`, `default()`, `describe()`, `brand()`, `readonly()`, `catch()`, `refine()`, `superRefine()`, `meta()`, `transform()`

**Downstream dependencies** (code that calls the above and must not regress):
- [x] `src/JsonSchema/toZod.ts` → calls `parseSchema()`
- [x] `src/jsonSchemaToZod.ts` → wraps `toZod()`
- [x] `src/cli.ts` → invokes `jsonSchemaToZod()` and `SchemaProject`
- [x] `src/SchemaProject/SchemaProject.ts` → calls `parseSchema()` per-schema
- [x] All `src/JsonSchema/parsers/*.ts` parser classes → extend `BaseParser`

---

### Step 2: Assess Current Test Coverage

#### Coverage Area 1: `selectParserClass` (registry.ts)

**Location**: `src/JsonSchema/parsers/registry.ts:71-149`

**Current Test Coverage**:
- Test file: TBD — run `npm run test:coverage` to check
- Coverage: Unknown
- Test types: [ ] Unit [x] Integration (via end-to-end `jsonSchemaToZod` calls)

**Coverage Assessment**:
- [ ] ✅ Adequate - covers all critical paths
- [x] ⚠️ Partial - likely missing direct unit tests for `selectParserClass` branches
- [ ] ❌ Insufficient - missing critical functionality

**Specific Gaps Identified**:
1. ⚠️ `is.nullable(schema)` → `NullableParser` branch — verify integration test exists
2. ⚠️ `is.not(schema)` → `NotParser` branch — verify integration test exists
3. ⚠️ `'enum' in schema && Array.isArray(...)` → `EnumParser` (empty enum array edge case)
4. ⚠️ `is.const(schema)` → `ConstParser` branch — verify integration test exists
5. ⚠️ `'prefixItems' in schema` → `TupleParser` (draft 2020-12 tuple) — verify covered
6. ⚠️ `'items' as array` → `TupleParser` (draft-07 tuple) — verify covered
7. ⚠️ `is.multipleType(schema)` → `MultipleTypeParser` — verify covered
8. ⚠️ `is.conditional(schema)` → `ConditionalParser` — verify covered
9. ⚠️ Fallback (returns `undefined`) → `parseDefault` — verify covered

#### Coverage Area 2: `parseSchema` (parseSchema.ts)

**Location**: `src/JsonSchema/parsers/parseSchema.ts:17-109`

**Current Test Coverage**:
- Test file: TBD
- Coverage: Unknown
- Test types: [x] Integration (via `jsonSchemaToZod`)

**Coverage Assessment**:
- [ ] ✅ Adequate
- [x] ⚠️ Partial — several branches need direct verification
- [ ] ❌ Insufficient

**Specific Gaps Identified**:
1. ⚠️ `isJSONSchema(schema)` returns `false` branch (boolean schema `true` → `z.any()`)
2. ⚠️ `isJSONSchema(schema)` returns `false` branch (boolean schema `false` → `z.never()`)
3. ⚠️ `refs.refResolver` + `schema.$ref` early-return path — may not be covered by unit tests
4. ⚠️ `refs.preprocessors` loop (legacy `preprocessors` key, distinct from `preProcessors`)
5. ⚠️ `refs.parserOverride` returning a `string` → `refs.build.code(custom)`
6. ⚠️ `refs.parserOverride` returning a `ZodBuilder`
7. ⚠️ Circular reference: `seen.r !== undefined` (cached result path)
8. ⚠️ Circular reference: `seen.n >= refs.depth` (depth-limit path → `z.any()`)
9. ⚠️ `blockMeta = true` path (metadata annotations skipped)

#### Coverage Area 3: `BaseParser` methods (BaseParser.ts)

**Location**: `src/JsonSchema/parsers/BaseParser.ts:36-281`

**Current Test Coverage**:
- Test file: TBD (tested indirectly via concrete parser tests)
- Coverage: Unknown
- Test types: [x] Integration

**Coverage Assessment**:
- [ ] ✅ Adequate
- [x] ⚠️ Partial — lifecycle hooks (`applyPreProcessors`, `applyPostProcessors`) may not be unit-tested
- [ ] ❌ Insufficient

**Specific Gaps Identified**:
1. ⚠️ `applyPreProcessors` with multiple processors — verify chaining behavior
2. ⚠️ `applyPostProcessors` with `pathPattern` filter — verify path-scoped processor applies only on match
3. ⚠️ `applyPostProcessors` with `typeFilter` — verify type-scoped processor applies only on type match
4. ⚠️ `applyMetadata` with `description` field — verify `.describe()` called
5. ⚠️ `applyMetadata` with `default` field — verify `.default()` called
6. ⚠️ `createChildContext` — verify child path propagation is correct
7. ⚠️ `parseChild` without `_parseSchema` set — verify error thrown

#### Coverage Area 4: Boolean schema handling

**Location**: `src/JsonSchema/parsers/parseSchema.ts:105-108`

**Specific Gaps Identified**:
1. ❌ `jsonSchemaToZod(true)` → `"z.any()"` — may not have an explicit test
2. ❌ `jsonSchemaToZod(false)` → `"z.never()"` — may not have an explicit test

#### Coverage Area 5: `is.ts` type guards

**Location**: `src/JsonSchema/is.ts`

**Coverage Assessment**:
- [ ] ✅ Adequate
- [x] ⚠️ Partial — guards are unit-testable directly but likely only tested indirectly

---

## Testing Gaps Summary

### Critical Gaps (MUST fix before baseline)
These gaps prevent us from validating behavior preservation:

1. **Gap 1**: Boolean schema (`true`/`false`) handling has no confirmed explicit test
   - **Impact**: Cannot verify that `jsonSchemaToZod(true)` → `z.any()` is preserved through the adapter abstraction
   - **Priority**: 🔴 Critical
   - **Action**: Add explicit unit test in the relevant test file

2. **Gap 2**: `parserOverride` with a raw `string` return value — this branch is being **removed**
   - **Impact**: The `typeof custom === 'string'` branch in `parseSchema.ts` is the legacy escape hatch being replaced by the `Builder` interface. We must verify:
     a. The old behaviour (`parserOverride: () => 'z.custom()'`) produces `z.custom()` output (snapshot the current behaviour before removing)
     b. The new behaviour (`parserOverride: (_, refs) => refs.build.code('z.custom()')`) produces identical output
     c. A `parserOverride` returning a `Builder` (e.g., `refs.build.number()`) routes correctly
   - **Priority**: 🔴 Critical
   - **Action**: Add tests for all three sub-cases before the migration step

3. **Gap 3**: Circular reference depth-limit path (`seen.n >= refs.depth` → `z.any()`)
   - **Impact**: This is a correctness path that prevents infinite recursion; if broken, deeply recursive schemas throw stack overflows
   - **Priority**: 🔴 Critical
   - **Action**: Add a test with a mutually recursive schema and `depth: 2` option

4. **Gap 4**: `Builder` interface contract — `ZodBuilder` chaining methods return `this`
   - **Impact**: When `parseImpl()` return type changes from `ZodBuilder` to `Builder`, callers that chain modifier methods (e.g., `builder.optional().describe('...')`) must verify the chain still type-checks and produces correct output. If the `Builder` interface doesn't declare chainable returns correctly, TypeScript will error or callers lose type information.
   - **Priority**: 🔴 Critical
   - **Action**: Add a type-level test (using `satisfies` or `expectType`) verifying `ZodBuilder implements Builder` and that all chained calls on a `Builder` reference compile and produce identical `text()` output

### Important Gaps (SHOULD fix before baseline)
These gaps reduce confidence but don't block refactoring:

1. **Gap 4**: `ConditionalParser` coverage — `if/then/else` schema handling
   - **Impact**: Lower confidence that conditional logic is preserved through adapter
   - **Priority**: 🟡 Important

2. **Gap 5**: `MultipleTypeParser` coverage — `type: ["string", "null"]` schemas
   - **Impact**: Multi-type arrays are a common JSON Schema pattern
   - **Priority**: 🟡 Important

3. **Gap 6**: Pre/post-processor `pathPattern` and `typeFilter` scoping in `BaseParser`
   - **Impact**: If path/type filtering breaks, processors run on wrong schema nodes
   - **Priority**: 🟡 Important

4. **Gap 7**: `refs.preprocessors` (legacy key, distinct from `preProcessors`) in `parseSchema.ts`
   - **Impact**: Undocumented compat shim; if removed during refactor it silently breaks legacy callers
   - **Priority**: 🟡 Important

### Nice-to-Have Gaps (CAN be deferred)
These can be addressed later:

1. **Gap 8**: Direct unit tests for each `is.*` guard in `is.ts`
   - **Impact**: Minimal — indirectly covered by integration tests
   - **Can be deferred**: Yes

2. **Gap 9**: `createChildContext` path-propagation unit test in `BaseParser`
   - **Impact**: Minimal — covered indirectly by nested object/array integration tests
   - **Can be deferred**: Yes

---

## Test Addition Plan

### Tests to Add Before Baseline

#### Test Suite: (existing integration test file for `jsonSchemaToZod`)

**New Test Cases**:

1. ✅ Test: `boolean schema true → z.any()`
   - Input: `jsonSchemaToZod(true)`
   - Expected: string containing `z.any()`
   - Status: [ ] Not Started [ ] In Progress [ ] Complete

2. ✅ Test: `boolean schema false → z.never()`
   - Input: `jsonSchemaToZod(false)`
   - Expected: string containing `z.never()`
   - Status: [ ] Not Started [ ] In Progress [ ] Complete

3. ✅ Test: `parserOverride returning string`
   - Input: `parseSchema({ type: 'string' }, { ..., parserOverride: () => 'z.custom()' })`
   - Expected: `ZodBuilder` wrapping `z.custom()`
   - Status: [ ] Not Started [ ] In Progress [ ] Complete

4. ✅ Test: `parserOverride returning ZodBuilder`
   - Input: `parseSchema({ type: 'string' }, { ..., parserOverride: (_, refs) => refs.build.number() })`
   - Expected: `ZodBuilder` for `z.number()`
   - Status: [ ] Not Started [ ] In Progress [ ] Complete

5. ✅ Test: circular reference depth limit
   - Input: mutually recursive schema with `depth: 2`
   - Expected: terminates and returns `z.any()` at depth limit (no stack overflow)
   - Status: [ ] Not Started [ ] In Progress [ ] Complete

6. ✅ Test: `ConditionalParser` — if/then/else schema
   - Input: `{ if: { type: 'string' }, then: { minLength: 1 }, else: { type: 'number' } }`
   - Expected: valid Zod output
   - Status: [ ] Not Started [ ] In Progress [ ] Complete

7. ✅ Test: `MultipleTypeParser` — type array schema
   - Input: `{ type: ['string', 'null'] }`
   - Expected: `z.union([z.string(), z.null()])` or equivalent
   - Status: [ ] Not Started [ ] In Progress [ ] Complete

8. ✅ Test: `parserOverride` returning a `Builder` (`refs.build.number()`)
   - Input: `parseSchema({ type: 'string' }, { parserOverride: (_, refs) => refs.build.number() })`
   - Expected: output contains `z.number()` (not `z.string()`)
   - Status: [ ] Not Started [ ] In Progress [ ] Complete

9. ✅ Test: `parserOverride` returning `refs.build.code('z.custom()')` produces same output as old `string` escape hatch
   - Input (old): `parserOverride: () => 'z.custom()'`
   - Input (new): `parserOverride: (_, refs) => refs.build.code('z.custom()')`
   - Expected: both produce output containing `z.custom()`; snapshot both before and after migration
   - Status: [ ] Not Started [ ] In Progress [ ] Complete

10. ✅ Test (type-level): `ZodBuilder satisfies Builder` — `ZodBuilder` implements full `Builder` interface
    - Verify: chaining `builder.optional().describe('x').nullable()` on a `Builder`-typed reference compiles and `text()` returns the expected string
    - Status: [ ] Not Started [ ] In Progress [ ] Complete

---

## Test Implementation Checklist

### Pre-Work
- [ ] Run `npm test` — confirm current pass rate
- [ ] Run `npm run test:coverage` — establish branch coverage baseline
- [ ] Identify test file(s) for integration tests

### Test Writing
- [ ] Write tests for Critical Gap 1 (boolean schemas)
- [ ] Write tests for Critical Gap 2 (parserOverride)
- [ ] Write tests for Critical Gap 3 (circular reference depth limit)
- [ ] Write tests for Important Gap 4 (ConditionalParser)
- [ ] Write tests for Important Gap 5 (MultipleTypeParser)
- [ ] Ensure all new tests pass before proceeding

### Validation
- [ ] Run full test suite — all tests pass
- [ ] Coverage tool shows improved branch coverage in `parseSchema.ts` and `registry.ts`
- [ ] Commit tests on a separate commit before refactoring begins

### Ready for Baseline
- [ ] All critical gaps addressed
- [ ] All new tests passing
- [ ] Coverage metrics captured
- [ ] Behavioral snapshot can now be validated

---

## Decision: Proceed or Delay Refactoring?

### Current Assessment
- [ ] **STOP**: Critical gaps found — add tests first (see Critical Gaps above)
- [ ] **PROCEED**: All critical gaps addressed — ready to capture baseline

> ⚠️ Assessment is currently **STOP** — the three critical gaps above must be addressed before baseline capture.

---

## Notes

**Additional Context**:
The codebase uses a registry pattern and template method pattern across the parser hierarchy. The
refactoring will touch type parameters threaded through every parser class, so broad integration
test coverage (exercising all 15+ parsers) is more valuable than deep unit tests on individual
parser internals. Focus critical gap remediation on the `parseSchema.ts` entry-point branches,
as these are the paths that the new `SchemaInputAdapter` abstraction will mediate.

---

*This testing gaps assessment is part of the enhanced refactor workflow. Complete this BEFORE running `measure-metrics.sh --before`.*
