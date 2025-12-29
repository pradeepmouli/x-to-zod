# Tasks: refactor-007 Inject Build Factory via Dependency Injection

Feature: Dependency Injection Pattern for Version-Specific Factories

**Branch**: `refactor/007-inject-build-factory`
**Status**: ✅ COMPLETED - All phases implemented and validated
**Test Baseline**: 263 passed, 2 skipped
**TypeScript Status**: 0 errors

## Phase 0: Setup and Baseline

- [X] T001 Run full test suite and capture baseline (expect 263 passed, 2 skipped)
- [X] T002 Verify TypeScript compilation clean (0 errors)
- [X] T003 Create branch `refactor/007-inject-build-factory` (COMPLETED - branch already exists)
- [X] T004 Document current architecture (runtime detection in factory functions)

## Phase 1: Create Version-Specific Factory Files

- [X] T005 Create `src/ZodBuilder/v3.ts` with buildV3 factory object
  - Files: `src/ZodBuilder/v3.ts`
  - Export buildV3 with all factory methods (string, number, boolean, object, array, bigint, date, etc.)
  - Each factory method creates builder with params and version 'v3'
  - Example: `string: (params?: Parameters<typeof z.string>[0]) => new StringBuilder(params, 'v3')`

- [X] T006 Create `src/ZodBuilder/v4.ts` with buildV4 factory object
  - Files: `src/ZodBuilder/v4.ts`
  - Export buildV4 with all factory methods (same as v3 but version 'v4')
  - Example: `string: (params?: Parameters<typeof z.string>[0]) => new StringBuilder(params, 'v4')`

- [X] T007 Update `src/ZodBuilder/index.ts` to export new factories
  - Files: `src/ZodBuilder/index.ts`
  - Export { buildV3 } from './v3'
  - Export { buildV4 } from './v4'
  - Export buildV4 as default build
  - Keep existing builder class exports

- [X] T008 Run tests to verify factories compile (expect 263 passed)

## Phase 2: Update Type Definitions

- [X] T009 Update Context type in `src/Types.ts`
  - Files: `src/Types.ts`
  - Import buildV3 and buildV4 types: `import type { buildV3 } from './ZodBuilder/v3.js'; import type { buildV4 } from './ZodBuilder/v4.js';`
  - Add `build: typeof buildV3 | typeof buildV4` property to Context type
  - Full Context type: `Context = Options & { build: typeof buildV3 | typeof buildV4; path: (string | number)[]; seen: Map<object | boolean, { n: number; r: BaseBuilder | undefined }> }`
  - Preserve existing Options & structure

- [X] T010 Verify TypeScript compilation (0 errors expected at this stage)

## Phase 3: Update Builder Constructors

- [X] T011 Update BaseBuilder constructor signature
  - Files: `src/ZodBuilder/BaseBuilder.ts`
  - Change from `constructor(options?: Options)` to `constructor(params?: P, version?: 'v3' | 'v4')`
  - Store version internally if needed
  - Remove Options dependency

- [X] T012 [P] Update StringBuilder constructor
  - Files: `src/ZodBuilder/string.ts`
  - Change to `constructor(params?: Parameters<typeof z.string>[0], version?: 'v3' | 'v4')`
  - Pass version to super()

- [X] T013 [P] Update NumberBuilder constructor
  - Files: `src/ZodBuilder/number.ts`
  - Same pattern as StringBuilder

- [X] T014 [P] Update BooleanBuilder constructor
  - Files: `src/ZodBuilder/boolean.ts`
  - Same pattern as StringBuilder

- [X] T015 [P] Update ObjectBuilder constructor
  - Files: `src/ZodBuilder/object.ts`
  - Params at index [1], version parameter

- [X] T016 [P] Update ArrayBuilder constructor
  - Files: `src/ZodBuilder/array.ts`
  - Params at index [1], version parameter

- [X] T017 [P] Update BigIntBuilder constructor
  - Files: `src/ZodBuilder/bigint.ts`
  - Same pattern as StringBuilder

- [X] T018 [P] Update DateBuilder constructor
  - Files: `src/ZodBuilder/date.ts`
  - Same pattern as StringBuilder

- [X] T019 [P] Update remaining builders (52 files total)
  - Files: any.ts, base64.ts, codec.ts, const.ts, cuid.ts, custom.ts, datetime.ts, discriminatedUnion.ts, duration.ts, email.ts, emoji.ts, enum.ts, file.ts, function.ts, generic.ts, intersection.ts, ip.ts, json.ts, keyof.ts, lazy.ts, literal.ts, map.ts, nan.ts, nanoid.ts, nativeEnum.ts, never.ts, null.ts, pipe.ts, preprocess.ts, promise.ts, record.ts, set.ts, symbol.ts, templateLiteral.ts, time.ts, tuple.ts, ulid.ts, undefined.ts, union.ts, unknown.ts, url.ts, uuid.ts, versions.ts, void.ts, xor.ts, plus 8 already listed (string, number, boolean, object, array, bigint, date, unknown)
  - Update all constructors to accept (params?, version?) signature
  - Remove Options parameter

- [X] T020 Run tests after builder updates (expect 263 passed)

## Phase 4: Update Entry Point

- [X] T021 Modify entry points to inject factory
  - Files: `src/jsonSchemaToZod.ts` (main export) AND `src/JsonSchema/toZod.ts` (internal entry)
  - In toZod.ts: Import buildV3, buildV4 from ZodBuilder
  - Select factory based on options.zodVersion: `const build = options.zodVersion === 'v3' ? buildV3 : buildV4` (default v4)
  - Create context with build: `const context: Context = { ...rest, build, path: [], seen: new Map() }`
  - Pass context to parseSchema
  - Verify jsonSchemaToZod.ts delegates correctly to toZod

- [X] T022 Verify entry point compiles and tests run (expect 263 passed)

## Phase 5: Update All Parsers

**Note**: These can be done in parallel [P] since they don't depend on each other

- [X] T023 [P] Update parseString to use refs.build
  - Files: `src/JsonSchema/parsers/parseString.ts`
  - Remove `import { build } from '../ZodBuilder'`
  - Change `build.string()` to `refs.build.string()`

- [X] T024 [P] Update parseNumber to use refs.build
  - Files: `src/JsonSchema/parsers/parseNumber.ts`
  - Same pattern as parseString

- [X] T025 [P] Update parseBoolean to use refs.build
  - Files: `src/JsonSchema/parsers/parseBoolean.ts`
  - Same pattern as parseString

- [X] T026 [P] Update parseObject to use refs.build
  - Files: `src/JsonSchema/parsers/parseObject.ts`
  - Same pattern as parseString

- [X] T027 [P] Update parseArray to use refs.build
  - Files: `src/JsonSchema/parsers/parseArray.ts`
  - Same pattern as parseString

- [X] T028 [P] Update parseEnum to use refs.build
  - Files: `src/JsonSchema/parsers/parseEnum.ts`
  - Same pattern as parseString

- [X] T029 [P] Update parseConst to use refs.build
  - Files: `src/JsonSchema/parsers/parseConst.ts`
  - Same pattern as parseString

- [X] T030 [P] Update parseAllOf to use refs.build
  - Files: `src/JsonSchema/parsers/parseAllOf.ts`
  - Same pattern as parseString

- [X] T031 [P] Update parseAnyOf to use refs.build
  - Files: `src/JsonSchema/parsers/parseAnyOf.ts`
  - Same pattern as parseString

- [X] T032 [P] Update parseOneOf to use refs.build
  - Files: `src/JsonSchema/parsers/parseOneOf.ts`
  - Same pattern as parseString

- [X] T033 [P] Update parseNot to use refs.build
  - Files: `src/JsonSchema/parsers/parseNot.ts`
  - Same pattern as parseString

- [X] T034 [P] Update parseNullable to use refs.build (if applicable)
  - Files: `src/JsonSchema/parsers/parseNullable.ts`
  - Same pattern as parseString

- [X] T035 [P] Update parseMultipleType to use refs.build (if applicable)
  - Files: `src/JsonSchema/parsers/parseMultipleType.ts`
  - Same pattern as parseString

- [X] T036 [P] Update parseIfThenElse, parseNullable, parseDefault to use refs.build
  - Files: `src/JsonSchema/parsers/parseIfThenElse.ts`, `src/JsonSchema/parsers/parseNullable.ts`, `src/JsonSchema/parsers/parseDefault.ts`
  - Apply same pattern: remove build import, use refs.build
  - These are the 3 remaining parsers not explicitly listed (17 total parsers confirmed)

- [X] T037 Run full test suite after parser updates (expect 263 passed)

## Phase 6: Cleanup and Validation

- [X] T038 Remove old runtime detection logic from `src/ZodBuilder/index.ts`
  - Files: `src/ZodBuilder/index.ts`
  - Remove isOptions checks
  - Remove complex runtime detection code
  - Simplify factory exports

- [X] T039 Run full test suite (expect 263 passed, 2 skipped)

- [X] T040 Verify TypeScript compilation clean (0 errors)

- [X] T041 Build ESM target and verify success
  - Command: `npm run build:esm` or equivalent

- [X] T042 Build CJS target and verify success
  - Command: `npm run build:cjs` or equivalent

- [X] T043 Run CLI with sample schemas and compare outputs to baseline
  - Verify generated Zod code is identical

- [X] T044 Check for any remaining Options imports in builder files
  - Command: `grep -r "import.*Options" src/ZodBuilder/`
  - Verify: Should find 0 matches (Options only in Types.ts now)

- [X] T044a Verify runtime detection code removed
  - Command: `grep -r "isOptions\|zodVersion.*in\|seen.*in\|path.*in" src/ZodBuilder/index.ts`
  - Verify: Should find 0 matches in factory functions

- [X] T045 Update any internal documentation if needed

## Phase 7: Final Validation

- [X] T046 Run complete test suite one final time (263 passed, 2 skipped)

- [X] T047 Measure test execution time (should remain ~2.5s)

- [X] T048 Review all modified files for consistency

- [X] T049 Verify no performance regressions

- [X] T050 Mark refactor as complete

## Dependencies (Execution Order)

**Sequential Dependencies**:
- Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7
- Phase 1 must complete before Phase 3 (builders need factories defined)
- Phase 2 must complete before Phase 4 (entry point needs Context type)
- Phase 3 must complete before Phase 4 (entry point creates builders via factories)
- Phase 4 must complete before Phase 5 (parsers need refs.build available)

**Parallel Opportunities**:
- Phase 1: T005, T006 can run in parallel (v3.ts and v4.ts independent)
- Phase 3: T012-T019 can run in parallel (all builder updates independent)
- Phase 5: T023-T036 can run in parallel (all parser updates independent)
- Phase 6: T041, T042 can run in parallel (ESM and CJS builds independent)

## Test Checkpoints

**After Each Phase**:
- Phase 1: Tests should compile and pass
- Phase 2: TypeScript compilation clean
- Phase 3: Tests should pass (263)
- Phase 4: Tests should pass (263)
- Phase 5: Tests should pass (263)
- Phase 6: Tests should pass, builds succeed

**Failure Recovery**:
- If any phase fails, revert that phase and investigate
- Tests must pass before moving to next phase
- Keep git commits atomic per phase for easy rollback

## Acceptance Criteria

- ✅ All 263 tests passing
- ✅ 2 tests skipped (unchanged)
- ✅ TypeScript compilation: 0 errors
- ✅ ESM build successful
- ✅ CJS build successful
- ✅ CLI output identical to baseline
- ✅ No runtime detection code remaining
- ✅ All parsers use refs.build
- ✅ All builders accept version parameter
- ✅ Context includes build property
- ✅ No Options parameter in builders
- ✅ No performance degradation

## Files Modified Summary

**New Files (2)**:
- src/ZodBuilder/v3.ts
- src/ZodBuilder/v4.ts

**Modified Files (~25+)**:
- src/Types.ts (Context type)
- src/ZodBuilder/index.ts (exports)
- src/ZodBuilder/BaseBuilder.ts (constructor)
- src/ZodBuilder/string.ts (constructor)
- src/ZodBuilder/number.ts (constructor)
- src/ZodBuilder/boolean.ts (constructor)
- src/ZodBuilder/object.ts (constructor)
- src/ZodBuilder/array.ts (constructor)
- src/ZodBuilder/bigint.ts (constructor)
- src/ZodBuilder/date.ts (constructor)
- src/ZodBuilder/*.ts (remaining builders)
- src/jsonSchemaToZod.ts (entry point)
- src/JsonSchema/parsers/*.ts (all parsers - 15+ files)

**No Changes**:
- test/*.ts (all tests run unchanged)
- Public API files
- CLI interface

---
*Task breakdown follows project patterns - See specs/refactor/003-apply-fluent-paradigms/tasks.md for reference*
