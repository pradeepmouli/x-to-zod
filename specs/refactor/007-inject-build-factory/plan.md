# Implementation Plan: Inject Build Factory via Dependency Injection

**Branch**: `refactor/007-inject-build-factory` | **Date**: 2025-12-27 | **Status**: Planning | **Spec**: specs/refactor/007-inject-build-factory/
**Input**: Refactor to separate v3/v4 factories and inject build factory into Context

**Status**: 🟡 PLANNED - Architecture design for dependency injection pattern

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Refactor the builder factory architecture to eliminate the Options parameter and runtime version detection by:
1. Creating separate v3 and v4 factory objects (buildV3, buildV4) in dedicated files
2. Injecting the selected build factory into the Context type
3. Updating all builders to accept version string instead of Options
4. Updating all parsers to use `refs.build` instead of importing build directly
5. Selecting the appropriate factory once at the entry point based on zodVersion option

This eliminates runtime detection complexity, makes parsers version-agnostic, and provides cleaner separation of concerns.

**Key Improvements**:
- ✨ Separate v3/v4 factory files eliminate mixed version logic
- ✨ Dependency injection makes parsers version-agnostic
- ✨ Compile-time version selection replaces runtime detection
- ✨ Cleaner builder constructors without Options parameter
- ✨ Single responsibility: version selection happens once at entry point

## Implementation Architecture

**Current State**:
```typescript
// Factory functions accept params OR Options (runtime detection)
export const build = {
  string: (paramsOrOptions?: Parameters<typeof z.string>[0] | Options) => {
    const isOptions = /* complex runtime check for seen/path/zodVersion */;
    if (isOptions) {
      return new StringBuilder(undefined, paramsOrOptions as Options);
    }
    return new StringBuilder(paramsOrOptions as Parameters<typeof z.string>[0]);
  }
};

// Parsers import and use build directly
import { build } from '../ZodBuilder';
const code = build.string().min(5).text();
```

**Target State**:
```typescript
// v3.ts - Version 3 factory
export const buildV3 = {
  string: (params?: Parameters<typeof z.string>[0]) =>
    new StringBuilder(params, 'v3')
};

// v4.ts - Version 4 factory
export const buildV4 = {
  string: (params?: Parameters<typeof z.string>[0]) =>
    new StringBuilder(params, 'v4')
};

// Types.ts - Context includes build factory
export type Context = {
  build: typeof buildV3 | typeof buildV4;
  path: string[];
  seen: Map<unknown, string>;
};

// Parsers use injected build from context
const parseString = (schema: JsonSchema, refs: Context): string => {
  return refs.build.string(params).min(5).text();
};

// Entry point selects and injects factory
const jsonSchemaToZod = (schema: JsonSchema, options: Options): string => {
  const build = options.zodVersion === 'v3' ? buildV3 : buildV4;
  const context: Context = { build, path: [], seen: new Map() };
  return parseSchema(schema, context);
};
```

**Lazy Evaluation Pattern** (Preserved):
All builders continue to follow the lazy evaluation pattern:
1. Constructor initializes with params and version
2. Modifier methods store constraint metadata
3. `.text()` method generates code on demand
4. Version-specific logic handled within builder implementations

**Dependency Injection Flow**:
```
Entry Point → Select Factory (v3/v4) → Inject into Context → Pass to Parsers → Use refs.build
```

## Technical Context

**Language/Version**: TypeScript (strict mode)
**Primary Dependencies**: None at runtime; dev: vitest, oxlint; outputs target Zod API strings
**Storage**: N/A
**Testing**: vitest
**Target Platform**: Node.js library (ESM + CJS builds)
**Project Type**: Single library project
**Performance Goals**: Maintain current build and runtime performance (no regressions)
**Constraints**: Dual-module exports; CLI-first contract; behavior preservation; all tests must pass
**Scale/Scope**: Internal refactor of factory architecture and dependency injection; affects all parsers

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- ✅ Parser Architecture: Preserve stateless parsers; dependency injection via Context parameter
- ✅ Dual-Module Export: No change to build outputs; ensure ESM/CJS remain identical
- ✅ CLI-First Contract: No CLI changes; outputs MUST remain identical
- ✅ Test-First Development: All 263 tests must continue passing; no assertion changes
- ✅ Type Safety & Zod Correctness: Generated code MUST remain valid and match JSON Schema semantics
- ✅ Backward Compatibility: Public API unchanged; internal refactoring only

**Status**: PASSED (Planning Phase). Re-evaluate after Phase 1 design outputs.

Gates to enforce during implementation:
- Per-phase TDD: Before any code change in a phase, run tests and confirm green; after changes, rerun tests and compare outputs against snapshot
- ESM/CJS parity: Build both targets and verify `postesm.js`/`postcjs.js` outputs remain unchanged
- CLI parity: Run CLI with baseline sample schemas and verify outputs identical
- Zero Regressions: All 263 tests must pass throughout implementation

## Project Structure

```
src/
  ZodBuilder/
    v3.ts              # NEW: Version 3 factory object
    v4.ts              # NEW: Version 4 factory object
    index.ts           # MODIFIED: Export v3, v4, and default build (v4)
    BaseBuilder.ts     # MODIFIED: Constructor accepts version string
    string.ts          # MODIFIED: Constructor signature updated
    number.ts          # MODIFIED: Constructor signature updated
    boolean.ts         # MODIFIED: Constructor signature updated
    object.ts          # MODIFIED: Constructor signature updated
    array.ts           # MODIFIED: Constructor signature updated
    [all other builders...] # MODIFIED: Constructor signature updated

  Types.ts             # MODIFIED: Context type includes build property
  jsonSchemaToZod.ts   # MODIFIED: Select factory and inject into context

  JsonSchema/
    parsers/
      parseString.ts   # MODIFIED: Use refs.build instead of import
      parseNumber.ts   # MODIFIED: Use refs.build instead of import
      parseBoolean.ts  # MODIFIED: Use refs.build instead of import
      parseObject.ts   # MODIFIED: Use refs.build instead of import
      parseArray.ts    # MODIFIED: Use refs.build instead of import
      [all other parsers...] # MODIFIED: Use refs.build instead of import

test/
  [all existing tests] # NO CHANGES: Must continue passing
```

## File Organization

**New Files**:
- `src/ZodBuilder/v3.ts` - Version 3 factory with buildV3 object
- `src/ZodBuilder/v4.ts` - Version 4 factory with buildV4 object

**Modified Files**:
- `src/Types.ts` - Add build property to Context
- `src/ZodBuilder/BaseBuilder.ts` - Update constructor signature
- `src/ZodBuilder/index.ts` - Export v3, v4 factories; simplify
- `src/ZodBuilder/*.ts` - Update all builder constructors (8+ files)
- `src/jsonSchemaToZod.ts` - Inject factory at entry point
- `src/JsonSchema/parsers/*.ts` - Update all parsers to use refs.build (15+ files)

**Removed Logic**:
- Runtime detection of Options vs params in factory functions
- Complex isOptions checks using 'seen'/'path'/'zodVersion' properties
- Options parameter from builder constructors

## Dependencies and Constraints

**Dependencies**:
- Must complete in order: Types → Factories → Builders → Entry Point → Parsers
- Factories must be created before updating builders
- Entry point must be updated before updating parsers
- All phases must maintain test suite passing

**Constraints**:
- Zero breaking changes to public API
- All 263 tests must pass throughout
- Generated Zod code must remain identical
- TypeScript compilation must be clean (0 errors)
- ESM/CJS builds must both succeed
- No performance regressions

## Risk Assessment

**Low Risk**:
- Creating new factory files (v3.ts, v4.ts)
- Adding build property to Context type
- Updating builder constructors (straightforward signature change)

**Medium Risk**:
- Updating all parsers to use refs.build (many files, but mechanical change)
- Entry point injection logic (critical path, must be correct)

**Mitigation Strategies**:
- Run tests after each phase
- Use multi_replace for batch updates to reduce errors
- Verify TypeScript compilation after each phase
- Keep changes atomic and reversible
- Document rollback steps for each phase

## Success Criteria

**Must Have**:
- ✅ All 263 tests passing
- ✅ TypeScript compilation clean (0 errors)
- ✅ Generated Zod code identical to current output
- ✅ ESM/CJS builds successful
- ✅ No runtime errors or warnings

**Should Have**:
- ✅ Cleaner code without runtime detection logic
- ✅ Better separation of concerns (v3/v4 separate)
- ✅ Improved testability through dependency injection

**Nice to Have**:
- ✅ Slightly better performance (fewer runtime checks)
- ✅ Easier to add new Zod versions in future

## Implementation Phases

See [tasks.md](./tasks.md) for detailed task breakdown.

**Phase 0**: Setup and Baseline
- Verify current tests pass (263 passed, 2 skipped)
- Create branch
- Document current state

**Phase 1**: Create Version-Specific Factories
- Create src/ZodBuilder/v3.ts with buildV3
- Create src/ZodBuilder/v4.ts with buildV4
- Export from index.ts

**Phase 2**: Update Type Definitions
- Add build property to Context in src/Types.ts
- Update Options if needed

**Phase 3**: Update Builder Constructors
- Update BaseBuilder constructor signature
- Update all builder subclasses (string, number, boolean, object, array, etc.)
- Remove Options parameter

**Phase 4**: Update Entry Point
- Modify src/jsonSchemaToZod.ts to select factory
- Inject build into context

**Phase 5**: Update All Parsers
- Update all parser files to use refs.build
- Remove build imports

**Phase 6**: Cleanup and Validation
- Remove old runtime detection logic
- Run full test suite
- Verify ESM/CJS builds
- Validate CLI output

## Testing Strategy

**Unit Tests**:
- All existing unit tests must pass unchanged
- No new tests required (internal refactor)

**Integration Tests**:
- Full test suite (28 files, 263 tests)
- CLI integration tests with sample schemas

**Regression Testing**:
- Compare generated outputs against baseline
- Verify identical Zod code generation
- Check for type errors

**Performance Testing**:
- Measure test suite execution time (should remain ~2.5s)
- No performance degradation expected

## Rollback Plan

If implementation fails:
1. Revert to previous commit
2. All changes are in separate branch
3. No public API changes to roll back
4. Tests provide safety net for incremental rollback

Per-phase rollback:
- Each phase is atomic
- Can revert individual files
- Tests validate each phase

## Notes

**Design Rationale**:
- **Dependency Injection**: Makes parsers version-agnostic and testable
- **Separate Factories**: Cleaner than mixed v3/v4 logic in single file
- **Context Property**: Natural place for shared state and dependencies
- **Version String**: Simpler than passing full Options object to builders
- **Entry Point Selection**: Version decision made once, not in every builder

**Migration Path**:
- Internal refactor only
- No user-facing changes
- Backward compatible
- Can be done incrementally with tests validating each step

**Future Considerations**:
- Easier to add v5 support (just create buildV5.ts)
- Could extend injection pattern to other dependencies
- Opens door for builder mocking/testing
- Simplifies version-specific customization

**Alternatives Considered**:
1. **Keep runtime detection**: Rejected due to complexity and fragility
2. **Single factory with version parameter**: Rejected; still mixed logic
3. **Builder registry pattern**: Over-engineering for current needs
4. **Version inheritance hierarchy**: Rejected; composition better than inheritance

---
*Refactor created following project spec patterns - See specs/refactor/003-apply-fluent-paradigms for reference structure*
