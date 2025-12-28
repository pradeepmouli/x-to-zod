# Refactor Spec: Inject Build Factory via Dependency Injection

**Refactor ID**: refactor-007
**Branch**: `refactor/007-inject-build-factory`
**Created**: 2025-12-27
**Type**: [X] Architecture
**Impact**: [ ] High Risk [X] Medium Risk [ ] Low Risk
**Status**: [X] Planning [ ] Baseline Captured [ ] In Progress [ ] Validation [ ] Complete

## Input
User description: "separate factories for v3 and v4, we in fact don't have to pass options to the factory methods at all... have the refs include the builder in the context... the build factory, i mean"

## Clarifications

### Session 2025-12-27

**Architectural Decisions**:

1. **Separate Version-Specific Factories**: Create buildV3 and buildV4 factory objects in separate files (v3.ts and v4.ts)
   - Each factory creates builders with appropriate version injected
   - No mixed version logic in single factory
   - Easy to extend with future versions (v5, v6, etc.)

2. **Dependency Injection Pattern**: Inject selected build factory into Context type at entry point
   - Context becomes: `{ build, path, seen }`
   - Version selection happens once at entry point, not repeatedly in factories
   - Parsers become version-agnostic by using injected factory

3. **Eliminate Options Parameter**: Update builder constructors from `(params?, options?: Options)` to `(params?, version?: 'v3' | 'v4')`
   - Removes unnecessary dependency on full Options object
   - Builders only need version string, not entire context
   - Simpler, more focused constructor signatures

4. **Remove Runtime Detection**: Eliminate complex runtime checks to distinguish Options from params
   - Current approach uses fragile checks for 'seen'/'path'/'zodVersion' properties
   - New approach: factories pass correct params, no ambiguity
   - Compile-time type safety instead of runtime inspection

5. **Parser Updates**: Change parsers from importing build to using refs.build
   - Makes parsers version-agnostic
   - Testable via mock context
   - No direct imports of factory, uses injected dependency

## Motivation

### Current State Problems

**Code Smell(s)**:
- [X] Complex Conditionals - Runtime detection of Options vs params using property inspection
- [X] Primitive Obsession - Version selection repeated in every factory method
- [X] God Object - Options parameter carries too much context for builder needs
- [X] Tight Coupling - Parsers directly import build factory

**Concrete Examples**:
- `src/ZodBuilder/index.ts`: Complex runtime detection:
  ```typescript
  const isOptions = paramsOrOptions && typeof paramsOrOptions === 'object' && 
    ('zodVersion' in paramsOrOptions || 'seen' in paramsOrOptions || 'path' in paramsOrOptions);
  if (isOptions) {
    return new StringBuilder(undefined, paramsOrOptions as Options);
  }
  return new StringBuilder(paramsOrOptions as Parameters<typeof z.string>[0]);
  ```
- All parsers: Direct import `import { build } from '../ZodBuilder'` creates tight coupling
- Builder constructors: Accept Options parameter but only need version string
- Version selection: Made repeatedly in every factory call instead of once at entry

### Business/Technical Justification

**Why this refactoring is needed NOW**:
- [X] Technical debt accumulation - Runtime detection is fragile and hard to maintain
- [X] Developer velocity impact - Complex factory logic slows feature development
- [X] Code quality - Mixed concerns in factory makes version handling unclear

**Justification**: 
The current implementation of params support (enhance-002) introduced runtime detection to distinguish between Options and params. While functional, this approach has several problems:
1. **Fragile**: Property checks can break with object shapes that look like Options
2. **Repeated Logic**: Version decision made in every factory method call
3. **Mixed Concerns**: Factory handles both version selection and builder creation
4. **Testing Difficulty**: Hard to mock or test version-specific behavior
5. **Future Scaling**: Adding v5 would require more complex conditions

By separating factories and injecting via Context, we:
- Make version selection explicit and centralized
- Simplify factory implementations
- Improve testability through dependency injection
- Make parsers version-agnostic
- Set foundation for easier version additions

## Proposed Improvement

### Refactoring Pattern/Technique

**Primary Technique**: Dependency Injection + Separation of Concerns

**High-Level Approach**:
Create separate factory objects (buildV3, buildV4) in dedicated files. Each factory creates builders with the appropriate version. Update Context type to include build property. Inject selected factory at entry point based on zodVersion option. Update all builders to accept version string instead of Options. Update all parsers to use refs.build instead of importing build directly. Remove runtime detection logic from factory functions.

**Files Affected**:
- **Created** (2):
  - `src/ZodBuilder/v3.ts` - Version 3 factory with buildV3 object
  - `src/ZodBuilder/v4.ts` - Version 4 factory with buildV4 object

- **Modified** (~25):
  - `src/Types.ts` - Add build property to Context type
  - `src/ZodBuilder/index.ts` - Export v3, v4 factories; remove runtime detection
  - `src/ZodBuilder/BaseBuilder.ts` - Update constructor signature (remove Options)
  - `src/ZodBuilder/string.ts` - Update constructor to accept version string
  - `src/ZodBuilder/number.ts` - Update constructor to accept version string
  - `src/ZodBuilder/boolean.ts` - Update constructor to accept version string
  - `src/ZodBuilder/object.ts` - Update constructor to accept version string
  - `src/ZodBuilder/array.ts` - Update constructor to accept version string
  - `src/ZodBuilder/bigint.ts` - Update constructor to accept version string
  - `src/ZodBuilder/date.ts` - Update constructor to accept version string
  - `src/ZodBuilder/*.ts` - Update remaining builders (52 additional files: any, array, base64, bigint, boolean, codec, const, cuid, custom, date, datetime, discriminatedUnion, duration, email, emoji, enum, file, function, generic, intersection, ip, json, keyof, lazy, literal, map, nan, nanoid, nativeEnum, never, null, number, object, pipe, preprocess, promise, record, set, string, symbol, templateLiteral, time, tuple, ulid, undefined, union, unknown, url, uuid, versions, void, xor)
  - `src/jsonSchemaToZod.ts` - Main entry point (confirmed)
  - `src/JsonSchema/toZod.ts` - Internal entry point that calls parseSchema with context
  - `src/JsonSchema/parsers/parseString.ts` - Use refs.build instead of import
  - `src/JsonSchema/parsers/parseNumber.ts` - Use refs.build instead of import
  - `src/JsonSchema/parsers/parseBoolean.ts` - Use refs.build instead of import
  - `src/JsonSchema/parsers/parseObject.ts` - Use refs.build instead of import
  - `src/JsonSchema/parsers/parseArray.ts` - Use refs.build instead of import
  - `src/JsonSchema/parsers/*.ts` - Update all remaining parsers (17 files total: parseAllOf, parseAnyOf, parseArray, parseBoolean, parseConst, parseDefault, parseEnum, parseIfThenElse, parseMultipleType, parseNot, parseNull, parseNullable, parseNumber, parseObject, parseOneOf, parseSchema, parseString)
  - `src/JsonSchema/toZod.ts` - Update to pass build in context (main entry point for library)

- **Deleted**: None (internal refactor only)
- **Moved**: None

### Design Improvements

**Before** (Runtime Detection):
```typescript
// Factory with runtime detection
export const build = {
  string: (paramsOrOptions?: Parameters<typeof z.string>[0] | Options) => {
    const isOptions = paramsOrOptions && typeof paramsOrOptions === 'object' && 
      ('zodVersion' in paramsOrOptions || 'seen' in paramsOrOptions || 'path' in paramsOrOptions);
    if (isOptions) {
      return new StringBuilder(undefined, paramsOrOptions as Options);
    }
    return new StringBuilder(paramsOrOptions as Parameters<typeof z.string>[0]);
  }
};

// Parser imports build
import { build } from '../ZodBuilder';
const code = build.string().min(5).text();
```

**After** (Dependency Injection):
```typescript
// v3.ts - Separate factory for version 3
export const buildV3 = {
  string: (params?: Parameters<typeof z.string>[0]) => 
    new StringBuilder(params, 'v3')
};

// v4.ts - Separate factory for version 4
export const buildV4 = {
  string: (params?: Parameters<typeof z.string>[0]) => 
    new StringBuilder(params, 'v4')
};

// Types.ts - Context includes build
import type { buildV3 } from './ZodBuilder/v3.js';
import type { buildV4 } from './ZodBuilder/v4.js';

export type Context = Options & {
  build: typeof buildV3 | typeof buildV4;
  path: (string | number)[];
  seen: Map<object | boolean, { n: number; r: BaseBuilder | undefined }>;
};

// Entry point - Select and inject
const build = options.zodVersion === 'v3' ? buildV3 : buildV4;
const context: Context = { build, path: [], seen: new Map() };

// Parser uses injected build
const code = refs.build.string().min(5).text();
```

### Metrics

**Baseline** (Before Refactor):
- Lines of runtime detection code: ~30 (measurement: count lines in isOptions checks across all factory methods in src/ZodBuilder/index.ts)
- Builder constructor parameters: 2 (params, options)
- Version decisions per parse: ~50+ (every factory call)
- Direct imports of build: ~15+ (all parsers)
- Test suite: 263 passed, 2 skipped

**Target** (After Refactor):
- Lines of runtime detection code: 0
- Builder constructor parameters: 2 (params, version)
- Version decisions per parse: 1 (at entry point only)
- Direct imports of build: 0 (all use refs.build)
- Test suite: 263 passed, 2 skipped (behavior preserved)

**Success Criteria**:
- Zero runtime detection code remaining
- All parsers use refs.build
- All tests pass unchanged
- TypeScript compilation clean
- ESM/CJS builds successful
- Generated code identical to baseline

## Baseline Capture

### Pre-Refactor Metrics
- **Test Results**: 28 test files, 263 tests passed, 2 skipped
- **TypeScript Errors**: 0
- **Build Status**: Clean (ESM + CJS)
- **Performance**: Test suite ~2.5s
- **Complexity**: High (runtime detection in every factory method)
- **Coupling**: High (parsers directly import build)

### Pre-Refactor Artifacts
- Test output snapshot captured
- Current factory implementation documented
- Parser import patterns documented
- Builder constructor signatures documented

## Implementation Phases

See [plan.md](./plan.md) for detailed architecture and [tasks.md](./tasks.md) for task breakdown.

### Phase Summary

1. **Phase 0**: Setup and Baseline - Verify tests, create branch
2. **Phase 1**: Create Version-Specific Factories - Build v3.ts and v4.ts
3. **Phase 2**: Update Type Definitions - Add build to Context
4. **Phase 3**: Update Builder Constructors - Accept version string
5. **Phase 4**: Update Entry Point - Inject factory into context
6. **Phase 5**: Update All Parsers - Use refs.build
7. **Phase 6**: Cleanup and Validation - Remove old code, verify builds

## Risks and Mitigation

### Risk Assessment

**Low Risk**:
- Creating new factory files (isolated change)
- Adding build property to Context (additive change)
- Updating builder constructors (mechanical signature change)

**Medium Risk**:
- Updating all parsers (many files, but mechanical)
- Entry point injection (critical path, must be correct)

**High Risk**: None

### Mitigation Strategies

1. **Incremental Testing**: Run tests after each phase
2. **Atomic Commits**: Keep each phase in separate commits for rollback
3. **Multi-Replace Batching**: Use multi_replace tool for parser updates to reduce errors
4. **TypeScript Validation**: Verify compilation after each phase
5. **Baseline Comparison**: Compare generated outputs to ensure no behavioral changes

### Rollback Plan

**Per-Phase Rollback**:
- Each phase is atomic and can be reverted independently
- Tests provide safety net for validation
- Git commits allow fine-grained rollback

**Full Rollback**:
- All changes in feature branch
- Can discard branch and start over if needed
- No public API changes to roll back

## Validation Plan

### Constitution Compliance

- [X] Parser Architecture: Preserve stateless parsers ✓
- [X] Dual-Module Export: No change to ESM/CJS outputs ✓
- [X] CLI-First Contract: No CLI changes ✓
- [X] Test-First Development: All tests must pass ✓
- [X] Type Safety & Zod Correctness: Generated code remains valid ✓

### Test Strategy

**Unit Tests**: All existing unit tests must pass unchanged (263)

**Integration Tests**: CLI integration tests with sample schemas

**Regression Tests**: Compare generated outputs against baseline

**Type Tests**: TypeScript compilation must succeed

### Acceptance Criteria

- [ ] All 263 tests passing
- [ ] TypeScript compilation: 0 errors
- [ ] ESM build successful
- [ ] CJS build successful
- [ ] CLI output identical to baseline
- [ ] No runtime detection code remaining
- [ ] All parsers use refs.build
- [ ] All builders accept version parameter
- [ ] Context includes build property
- [ ] No Options parameter in builders
- [ ] No performance degradation

## Breaking Changes

**Breaking Changes**: [ ] No

**Justification**: This is an internal refactor only. Public API remains unchanged:
- jsonSchemaToZod() function signature unchanged
- Options type unchanged
- Generated output unchanged
- CLI interface unchanged

All changes are internal implementation details not exposed to users.

## Dependencies

### Prerequisites
- Params feature (enhance-002) must be complete ✓
- All tests passing (263) ✓
- Clean TypeScript compilation ✓

### Blockers
None - Ready to proceed

### Related Work
- Builds on refactor-006 (v3/v4 version support)
- Completes enhance-002 (params support) architecture cleanup

## Timeline Estimate

**Estimated Effort**: 4-6 hours
- Phase 1 (Factories): 30 minutes
- Phase 2 (Types): 15 minutes
- Phase 3 (Builders): 1 hour
- Phase 4 (Entry Point): 30 minutes
- Phase 5 (Parsers): 1.5 hours
- Phase 6 (Cleanup/Validation): 30 minutes
- Testing/Validation: 1 hour

**Complexity**: Medium
- Large number of files to update (25+)
- But most changes are mechanical
- Good test coverage provides safety

## Post-Refactor Review

_(To be filled after implementation)_

### Actual Metrics
- Test Results:
- Build Status:
- Performance:
- Lines Changed:

### Lessons Learned
- What worked well:
- What could be improved:
- Future considerations:

---
*Refactor spec follows project patterns - See specs/refactor/006-consider-https-zod/spec.md for reference*
