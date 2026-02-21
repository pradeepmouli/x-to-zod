# Refactor Spec: Abstract Parser/Schema Project Surface for Non-JSONSchema Inputs

**Refactor ID**: refactor-010
**Branch**: `refactor/010-abstract-parser-schema`
**Created**: 2026-02-20
**Type**: [x] Architecture | [x] Maintainability | [x] Tech Debt
**Impact**: [x] High Risk
**Status**: [x] Planning | [ ] Baseline Captured | [ ] In Progress | [ ] Validation | [ ] Complete

## Input
User description: "abstract parser/schema project surface to permit non third-party/non-jsonschema inputs to x-to-zod"

## Motivation

### Current State Problems
**Code Smell(s)**:
- [ ] Duplication (DRY violation)
- [ ] God Object/Class (too many responsibilities)
- [ ] Long Method (too complex)
- [ ] Feature Envy (accessing other object's data)
- [ ] Primitive Obsession
- [ ] Dead Code
- [ ] Magic Numbers/Strings
- [x] Tight Coupling
- [x] Other: Input format hard-coded to JSON Schema object shape

**Concrete Examples**:
- `src/JsonSchema/parsers/BaseParser.ts` lines 36-40: Generic type parameters `JS extends JSONSchemaAny<Version>` and `Version extends SchemaVersion` bake JSON Schema version semantics into the base parser abstraction. Any new input format must masquerade as a `JSONSchema`.
- `src/JsonSchema/parsers/parseSchema.ts` lines 17-26: `parseSchema` signature accepts only `JSONSchema<Version>` and calls `isJSONSchema()` immediately to gate all parsing. No extension point exists for non-JSON-Schema inputs.
- `src/JsonSchema/parsers/registry.ts` lines 24-57: `ParserClass` union and `parserRegistry` Map are typed and keyed exclusively to the JSON Schema type vocabulary (`'object'`, `'array'`, `'string'`, etc.). Registering a parser for a foreign schema dialect requires monkey-patching this map.
- `src/JsonSchema/parsers/registry.ts` lines 71-149: `selectParserClass` hard-codes JSON Schema feature detection (`is.nullable`, `is.not`, `is.conditional`, `'enum' in schema`, `'prefixItems' in schema`, etc.). Any alternative schema format would require its own parallel selection function with no shared protocol.
- `src/JsonSchema/types/index.ts`: `JSONSchemaAny`, `JSONSchemaObject`, and `SchemaVersion` are re-exported from the top-level `src/index.ts`, surfacing the JSON Schema dependency as a first-class part of the public API contract rather than an implementation detail.
- `src/JsonSchema/parsers/BaseParser.ts` line 47: Constructor expects `JSONSchemaObject<Version>` directly, so third-party input format adapters cannot subclass `BaseParser` without first converting their input to a `JSONSchemaObject`.
- `src/JsonSchema/parsers/BaseParser.ts` (entire class): `BaseParser` conflates two concerns — the **contract** (what every parser must do: expose `typeKind` and `parse()`) and the **infrastructure** (pre/post-processor filtering, child context creation, circular-ref tracking, metadata application). Third-party parsers that don't need the template method infrastructure cannot satisfy the registry's `ParserClass` type without inheriting all of `BaseParser`'s machinery. There is no way to register a lightweight, standalone parser function or class that only implements `parse(): Builder`.
- `src/Types.ts` lines 12-15: `ParserOverride` is typed as `(schema, refs) => BaseBuilder | string | void`. The `string` return is an untyped escape hatch that completely bypasses the output contract — callers can emit arbitrary text without going through the `Builder` abstraction, making it impossible to validate, transform, or re-target the output (e.g., swap Zod v3 ↔ v4 code generation).
- `src/Types.ts` line 11: `ParserSelector` returns the concrete `BaseBuilder` class rather than an interface. This couples all callers to the implementation class, preventing alternative output implementations (e.g., a dry-run builder, an AST builder) without modifying the core types.

### Business/Technical Justification
- [x] Blocking new features — adding TypeScript type, GraphQL schema, Protobuf, or other first-class input adapters is impossible without forking or duplicating the core pipeline.
- [ ] Performance degradation
- [ ] Security vulnerability
- [ ] Causing frequent bugs
- [x] Developer velocity impact — contributors who want to target x-to-zod from a non-JSON-Schema source must re-implement the full parsing pipeline from scratch.
- [x] Technical debt accumulation — every future extension (OpenAPI, AsyncAPI, JSON Type Definition, Zod-to-Zod re-parsing) deepens the coupling.

## Proposed Improvement

### Refactoring Pattern/Technique
**Primary Technique**: Extract Interface + Introduce Protocol / Strategy

**High-Level Approach**:
Introduce a thin `SchemaInput` protocol (interface + adapter) that decouples the parsing pipeline from JSON Schema's concrete object shape. The existing JSON Schema pipeline becomes the default built-in adapter that implements `SchemaInput`. `parseSchema`, `BaseParser`, and the registry are generalised to operate on `SchemaInput` values, while `JSONSchema`-specific parsing logic is contained within the JSON Schema adapter. Third-party consumers can register their own adapters by implementing `SchemaInput` without modifying the core.

Additionally, formalise the **output** side of the pipeline: extract a `Builder` interface from the concrete `ZodBuilder` class and enforce it as the return contract for all parsers and `parserOverride`. This ensures that (a) every parser output is inspectable and composable, (b) alternative output targets (AST, dry-run, Arktype) can be provided without touching core code, and (c) the raw-`string` escape hatch in `parserOverride` is replaced by the well-typed `refs.build.code(str)` / `refs.build.raw(str)` factory.

Finally, separate the **parser contract** from the **parser infrastructure**: split the current `BaseParser` abstract class into a minimal `Parser` interface (the contract that all parsers must satisfy) and a `AbstractParser` true base class (the template-method infrastructure with pre/post-processor filtering, child context creation, and metadata application). Third-party parsers can implement `Parser` directly without inheriting `AbstractParser`'s machinery.

**Files Affected**:
- **Modified**:
  - `src/JsonSchema/parsers/parseSchema.ts` — accept `SchemaInput | JSONSchemaAny | boolean`, delegate `isJSONSchema` guard to adapter; update internal `parserOverride` coercion to enforce `Builder` return; update `ParserClass` references to use new `Parser` interface
  - `src/JsonSchema/parsers/registry.ts` — widen `ParserClass` from `typeof BaseParser` union to `new(schema: unknown, refs: Context) => Parser`; expose `registerParser` / `registerInputAdapter` hooks
  - `src/Types.ts` — add `SchemaInput`, `SchemaInputAdapter`, `SchemaInputPlugin` interfaces to `Context`; change `ParserOverride` from `BaseBuilder | string | void` to `Builder | void` (raw `string` removed); change `ParserSelector` from `BaseBuilder` to `Builder`; keep `JSONSchema` types as concrete implementations
  - `src/index.ts` — export `Builder`, `Parser`, `SchemaInput`, `SchemaInputAdapter`, `registerAdapter`
- **Created**:
  - `src/Builder/index.ts` — `Builder` interface extracted from `ZodBuilder`: `typeKind: string`, `text(): string`, `optional(): Builder`, `nullable(): Builder`, `default(v): Builder`, `describe(s): Builder`, `brand(s): Builder`, `readonly(): Builder`, `catch(v): Builder`, `refine(fn, msg?): Builder`, `superRefine(fn): Builder`, `meta(obj): Builder`, `transform(fn): Builder`
  - `src/Parser/index.ts` — `Parser` interface: minimal contract every parser must satisfy — `typeKind: string`, `parse(): Builder`
  - `src/SchemaInput/index.ts` — `SchemaInput` interface, `SchemaInputAdapter` protocol, and `registerAdapter` API
  - `src/SchemaInput/JsonSchemaAdapter.ts` — wraps existing JSON Schema logic; satisfies `SchemaInputAdapter`
- **Moved**:
  - `src/JsonSchema/parsers/BaseParser.ts` → `src/JsonSchema/parsers/AbstractParser.ts` — renamed to `AbstractParser`; implements `Parser`; retains all template-method infrastructure (pre/post-processor filtering, `createChildContext`, `parseChild`, `applyMetadata`); `JSONSchemaAny<Version>` generic replaced with `SchemaInput` generic
- **Deleted**: none (`BaseParser` name kept as a re-export alias for one release cycle to avoid immediate breakage)

### Design Improvements
**Before**:
```
jsonSchemaToZod(jsonSchemaObject)
    └─> parseSchema(JSONSchema<Version>)              // hard-coded input type
            └─> isJSONSchema()                        // guard in core
            └─> parserOverride? → string | ZodBuilder // untyped escape hatch
            └─> selectParserClass(JSONSchema)          // hard-coded JSON Schema logic
                    └─> BaseParser<TypeKind, Version, JSONSchemaAny>  // one class: contract + infra
                            └─> parseImpl() → ZodBuilder (concrete class)
```

**After**:
```
toZod(anySchemaInput, adapter?)               // adapter defaults to JsonSchemaAdapter
    └─> parseSchema(SchemaInput)              // abstracted input type
            └─> adapter.isValid(input)        // adapter-owned guard
            └─> parserOverride? → Builder     // interface-typed (no raw strings)
            └─> adapter.selectParser(input)   // adapter-owned selection
                    └─> Parser (interface)    // contract: typeKind + parse(): Builder
                         └─ AbstractParser<TypeKind, SchemaInput>  // optional infra base class
                                └─> parseImpl() → Builder (interface)
```

**Key changes visualised**:
```
// Parser contract vs infrastructure — Before (one class):
class BaseParser { parse(); parseImpl(); applyPreProcessors(); createChildContext(); ... }

// After (separated):
interface Parser { typeKind: string; parse(): Builder }               // minimal contract
abstract class AbstractParser implements Parser { ... all infra ... } // opt-in base class

// Output contract — Before (escape hatch bypasses Builder):
parserOverride: (schema) => 'z.custom()'         // raw string, no type safety

// After (must return Builder):
parserOverride: (schema, refs) => refs.build.code('z.custom()')  // GenericBuilder satisfies Builder
```

## Phase 0: Testing Gap Assessment
*CRITICAL: Complete BEFORE capturing baseline metrics - see testing-gaps.md*

### Pre-Baseline Testing Requirement
- [ ] **Testing gaps assessment completed** (see `testing-gaps.md`)
- [ ] **Critical gaps identified and addressed**
- [ ] **All affected functionality has adequate test coverage**
- [ ] **Ready to capture baseline metrics**

**Rationale**: This refactoring modifies the core parsing pipeline (`parseSchema`, `BaseParser`, `registry`). Behavior preservation cannot be verified unless every parser path is exercised by tests before and after the change.

### Testing Coverage Status
**Affected Code Areas**:
- `src/JsonSchema/parsers/parseSchema.ts` (entire file): Coverage unknown — ⚠️ Needs Assessment
- `src/JsonSchema/parsers/BaseParser.ts` (pre/post-processor dispatch, `parseChild`): Coverage unknown — ⚠️ Needs Assessment
- `src/JsonSchema/parsers/registry.ts` (`selectParserClass` full branch tree): Coverage unknown — ⚠️ Needs Assessment
- `src/JsonSchema/types/index.ts` (`isJSONSchema`, `getSchemaVersion`): Coverage unknown — ⚠️ Needs Assessment
- `src/SchemaProject/SchemaProject.ts` (ref resolution): Coverage unknown — ⚠️ Needs Assessment

**Action Taken**:
- [ ] No gaps found - proceeded to baseline
- [ ] Gaps found - added [N] tests before baseline
- [ ] Gaps documented but deferred (with justification)

---

## Baseline Metrics
*Captured AFTER testing gaps are addressed - see metrics-before.md*

### Code Complexity
- **Cyclomatic Complexity**: not measured (cloc/complexity tooling not installed)
- **Cognitive Complexity**: not measured
- **Lines of Code**: see metrics-before.md (cloc not installed at time of capture)
- **Function Length (avg/max)**: `selectParserClass` ~80 lines; `parseSchema` ~100 lines; `BaseParser.parse()` ~20 lines
- **Class Size (avg/max)**: `BaseParser` ~280 lines
- **Duplication**: JSON Schema type checks repeated across `is.ts`, `registry.ts`, individual parser `parseImpl` bodies

### Test Coverage
- **Overall Coverage**: see metrics-before.md — run `npm run test:coverage`
- **Lines Covered**: TBD
- **Branches Covered**: TBD
- **Functions Covered**: TBD

### Performance
- **Build Time**: ~2 seconds (captured in metrics-before.md)
- **Bundle Size**: not measured at baseline
- **Runtime Performance**: not measured at baseline
- **Memory Usage**: not measured at baseline

### Dependencies
- **Direct Dependencies**: 1 (zod)
- **Dev Dependencies**: 18
- **Total Installed**: see package-lock.json

## Target Metrics

### Code Quality Goals
- **Lines of Code**: Acceptable increase of ≤ 15% (new interface + adapter files)
- **Duplication**: Eliminate repeated JSON Schema feature-detection checks spread across `registry.ts`, `is.ts`, and individual parsers — consolidate into `JsonSchemaAdapter`
- **Function Length**: `selectParserClass` refactored to delegate to adapter; target ≤ 30 lines in core
- **Test Coverage**: Maintain or increase — new adapter code must have ≥ 90% coverage

### Performance Goals
- **Build Time**: Maintain (no regression)
- **Bundle Size**: Maintain or reduce (tree-shaking adapter should allow dropping JSON Schema types for consumers using alternative adapters)
- **Runtime Performance**: Maintain (no regression > 5%)
- **Memory Usage**: Maintain

### Success Threshold
1. New input format (e.g., a minimal TypeScript `type` → Zod conversion) can be wired up by implementing `SchemaInputAdapter` and calling `registerAdapter()` without touching any core file.
2. All parsers and `parserOverride` are statically typed to return `Builder` — a raw `string` return is a compile error.
3. All existing JSON Schema tests pass without modification.

## Behavior Preservation Guarantee
*CRITICAL: Refactoring MUST NOT change external behavior*

### External Contracts Unchanged
- [x] Function signatures unchanged (or properly deprecated) — `jsonSchemaToZod(schema, options)` signature stays identical; `parseSchema(schema, refs)` stays identical for JSON Schema callers
- [x] CLI arguments unchanged — `--input`, `--project`, and all other flags unchanged
- [x] File formats unchanged — JSON and YAML schema files continue to work
- [ ] API endpoints return same responses — N/A (library, no HTTP endpoints)
- [ ] Component props unchanged — N/A
- [ ] Database schema unchanged — N/A

### Test Suite Validation
- [x] **All existing tests MUST pass WITHOUT modification**
- [x] If test needs changing, verify it was testing implementation detail, not behavior
- [x] Do NOT weaken assertions to make tests pass

### Behavioral Snapshot
**Key behaviors to preserve**:
1. `jsonSchemaToZod({ type: 'string' })` → `"z.string()"` (primitive round-trip)
2. `jsonSchemaToZod({ type: 'object', properties: { name: { type: 'string' } }, required: ['name'] })` → `"z.object({ name: z.string() })"` (object with required)
3. `jsonSchemaToZod({ anyOf: [{ type: 'string' }, { type: 'number' }] })` → `"z.union([z.string(), z.number()])"` (combinator)
4. `jsonSchemaToZod({ enum: ['a', 'b', 'c'] })` → `"z.enum(['a', 'b', 'c'])"` (enum)
5. `jsonSchemaToZod({ type: 'array', items: { type: 'string' } })` → `"z.array(z.string())"` (array)
6. `jsonSchemaToZod(true)` → `"z.any()"` and `jsonSchemaToZod(false)` → `"z.never()"` (boolean schemas)
7. Pre-processors transform schema before parsing (hook stays in place)
8. Post-processors transform ZodBuilder after parsing (hook stays in place)
9. `--project` mode: multi-file generation with cross-schema `$ref` resolution continues to work
10. CLI `--input` flag: reads JSON file and produces valid TypeScript output

**Test**: Run before and after refactoring, outputs MUST be identical

## Risk Assessment

### Risk Level Justification
**Why High Risk**:
This refactoring modifies `parseSchema` (core entry point called by every user), `BaseParser` (base class for all 15+ parser classes), and `registry.ts` (parser selection logic). A mistake in any of these three files breaks the entire JSON Schema conversion pipeline for all users. The surface area is wide, the blast radius is total, and the existing type system will resist the generalization (TypeScript generics will need careful threading through the inheritance hierarchy).

### Potential Issues
- **Risk 1**: TypeScript generic constraints become unsatisfiable when `JSONSchemaAny<Version>` is replaced with `SchemaInput`
  - **Mitigation**: Use incremental generalization — first extract the interface, then migrate one parser at a time
  - **Rollback**: `git revert` to the tag created in Phase 1

- **Risk 2**: Circular dependency between `SchemaInput` module and `BaseParser`/`parseSchema`
  - **Mitigation**: Introduce `SchemaInput` as a pure interface in a new leaf module with no imports from core; `parseSchema` imports from it, not the other way
  - **Rollback**: Remove the `SchemaInput` module, restore original import graph

- **Risk 3**: Pre/post-processor `schema` parameter types break for existing processor implementations
  - **Mitigation**: Keep `PostProcessorContext.schema` typed as `JSONSchemaAny | SchemaInput` (union) initially; narrow once all processors are migrated
  - **Rollback**: Revert `Types.ts` to original `PostProcessorContext` definition

- **Risk 5**: Removing the raw `string` return from `ParserOverride` is a breaking change for any caller currently using `parserOverride: () => 'z.custom()'`
  - **Mitigation**: In Step 0, emit a TypeScript deprecation warning (`@deprecated`) on the `string` overload for one release cycle rather than removing it immediately; the implementation wraps it automatically via `GenericBuilder` and logs a `console.warn`; the public type narrows to `Builder | void` only in the following release
  - **Rollback**: Revert `Types.ts` `ParserOverride` definition; restore `typeof custom === 'string'` branch in `parseSchema.ts`

- **Risk 6**: Renaming `BaseParser` → `AbstractParser` breaks any third-party code importing `BaseParser` directly
  - **Mitigation**: Keep `export { AbstractParser as BaseParser }` re-export with `@deprecated` for one release cycle; TypeScript deprecation makes usages visible without breaking compilation
  - **Rollback**: Remove the rename — restore `BaseParser` as the class name and keep `AbstractParser` as an alias

- **Risk 7**: Widening `ParserClass` from the explicit class union to `new(...) => Parser` may allow structurally-compatible but semantically incorrect objects to be registered as parsers
  - **Mitigation**: Add a runtime assertion in `registerParser` that the registered class produces an object satisfying `typeof parser.parse === 'function' && typeof parser.typeKind === 'string'`
  - **Rollback**: Revert `registry.ts` `ParserClass` type to the explicit union

- **Risk 4**: `SchemaProject` ref-resolution pipeline depends on `JSONSchema.$ref` field access
  - **Mitigation**: `$ref` handling lives in `parseSchema.ts` behind an explicit guard; only move it once the adapter contract includes a `hasRef(input): boolean` method
  - **Rollback**: Revert `parseSchema.ts` ref-resolution changes independently (they are in a separate early-return block)

### Safety Measures
- [ ] Feature flag available for gradual rollout
- [ ] Monitoring in place for key metrics
- [x] Rollback plan tested
- [x] Incremental commits (can revert partially)
- [x] Peer review required
- [ ] Staging environment test required

## Rollback Plan

### How to Undo
1. `git revert <commit-range>` — revert all refactoring commits (they will be tagged `pre-refactor-010`)
2. Verify `npm test` passes 100% after revert
3. Push the revert commit to the branch for review

### Rollback Triggers
Revert if any of these occur within 24-48 hours:
- [x] Test suite failure
- [ ] Performance regression > 10%
- [ ] Production error rate increase
- [x] User-facing bug reports related to refactored area
- [ ] Monitoring alerts

### Recovery Time Objective
**RTO**: < 15 minutes (single `git revert` + push)

## Implementation Plan

### Phase 0: Testing Gap Assessment (Pre-Baseline)
**CRITICAL FIRST STEP**: Assess and address testing gaps BEFORE baseline

1. Review `testing-gaps.md` — identify all files in the parsing pipeline
2. Run `npm test` and `npm run test:coverage` to establish current baseline pass rate
3. Identify branches in `selectParserClass` not covered by existing tests
4. Add integration tests for any parser path without coverage (enum, const, nullable, multipleType, conditional, tuple)
5. Add a test asserting `jsonSchemaToZod(true)` → `z.any()` and `jsonSchemaToZod(false)` → `z.never()`
6. Verify all new tests pass before proceeding
7. Mark testing gaps assessment as complete

**Checkpoint**: Only proceed to Phase 1 when adequate test coverage exists

### Phase 1: Baseline (Before Refactoring)
1. Capture all baseline metrics (`npm run test:coverage`, record line/branch counts)
2. Confirm behavioral snapshot (see `behavioral-snapshot.md`)
3. Ensure 100% test pass rate
4. Tag current state: `git tag pre-refactor-010 -m "Baseline before refactor-010"`

### Phase 2: Refactoring (Incremental)
1. **Step 0 — Extract `Builder` interface and split `BaseParser` into `Parser` + `AbstractParser`**

   **Step 0a — `Builder` interface** in new `src/Builder/index.ts`:
   - Enumerate every public method of `ZodBuilder`: `typeKind`, `text()`, `optional()`, `nullable()`, `default()`, `describe()`, `brand()`, `readonly()`, `catch()`, `refine()`, `superRefine()`, `meta()`, `transform()`
   - `ZodBuilder` class `implements Builder` (additive, no behaviour change)
   - Change `ParserOverride` in `src/Types.ts` from `BaseBuilder | string | void` to `Builder | void` — raw `string` removed; callers use `refs.build.code(str)`
   - Change `ParserSelector` in `src/Types.ts` from `BaseBuilder` to `Builder`
   - Export `Builder` from `src/index.ts`

   **Step 0b — `Parser` interface** in new `src/Parser/index.ts`:
   - Defines the minimal contract every parser must satisfy: `typeKind: string`, `parse(): Builder`
   - Rename `src/JsonSchema/parsers/BaseParser.ts` → `src/JsonSchema/parsers/AbstractParser.ts`
   - Rename class `BaseParser` → `AbstractParser`; add `implements Parser`
   - `AbstractParser` retains all existing template-method infrastructure: `applyPreProcessors`, `applyPostProcessors`, `applyMetadata`, `filterPreProcessors`, `filterPostProcessors`, `createChildContext`, `parseChild`, `setParseSchema`
   - Change `AbstractParser.parse()` and `parseImpl()` return type from `ZodBuilder` to `Builder`
   - Add backwards-compat re-export in old path: `export { AbstractParser as BaseParser }` with `@deprecated` JSDoc tag
   - Update `registry.ts` `ParserClass` from the explicit `typeof ObjectParser | typeof ArrayParser | ...` union to `new(schema: unknown, refs: Context) => Parser` — this is what enables third-party parsers that don't extend `AbstractParser` to be registered
   - Update all 15+ parser classes that `extend BaseParser` to instead `extend AbstractParser` (mechanical rename, no logic change)
   - **Checkpoint**: TypeScript compiles, all tests pass, no runtime change

2. **Step 1 — Define `SchemaInput` interface** in new `src/SchemaInput/index.ts`:
   - `isValid(input: unknown): boolean`
   - `selectParser(input: unknown): ParserClass | undefined`
   - `getMetadata(input: unknown): SchemaMetadata` (description, default, readOnly)
   - `hasRef(input: unknown): string | undefined`
3. **Step 2 — Implement `JsonSchemaAdapter`** in `src/SchemaInput/JsonSchemaAdapter.ts`:
   - Moves `isJSONSchema`, `selectParserClass`, `addDescribes/addDefaults/addAnnotations` logic here
   - Exports a singleton `jsonSchemaAdapter` satisfying `SchemaInputAdapter`
4. **Step 3 — Wire adapter into `parseSchema`**:
   - Add optional `adapter?: SchemaInputAdapter` to `Context`
   - Default to `jsonSchemaAdapter` when not provided
   - Replace inline `isJSONSchema()` guard with `adapter.isValid(schema)`
   - Replace inline `selectParserClass(schema)` with `adapter.selectParser(schema)`
5. **Step 4 — Generalize `BaseParser`**:
   - Add `SchemaInput` type parameter, keeping `JSONSchemaAny` as default for backwards compat
   - Metadata helpers delegate to `this.refs.adapter?.getMetadata()` with fallback
6. **Step 5 — Expose public API**:
   - Export `SchemaInput`, `SchemaInputAdapter`, `registerAdapter`, and `Builder` from `src/index.ts`
   - Document new extension points in JSDoc
   - Add migration note for `parserOverride` callers: replace `return 'z.custom()'` with `return refs.build.code('z.custom()')`

Each step must compile and pass all tests before the next step begins.

### Phase 3: Validation
1. Run full test suite — MUST pass 100%
2. Re-measure metrics — compare to baseline
3. Verify behavioral snapshot (outputs identical)
4. Manual test: author a minimal custom adapter (e.g., accept plain `{ _type: 'string' }` objects)
5. Confirm existing `--project` mode still produces correct multi-file output

### Phase 4: Deployment
1. Code review focused on behavior preservation and public API ergonomics
2. Merge to `claude/refactor-parser-schema-tZoHq` for integration
3. Monitor CI for regressions
4. Ship in next minor release with migration guide for consumers using `parserOverride`

## Verification Checklist

### Phase 0: Testing Gap Assessment
- [ ] Testing gaps assessment completed (testing-gaps.md)
- [ ] All affected code areas identified
- [ ] Test coverage assessed for each area
- [ ] Critical gaps identified and documented
- [ ] Tests added for all critical gaps
- [ ] All new tests passing
- [ ] Ready to proceed to baseline capture

### Pre-Refactoring (Phase 1)
- [ ] Baseline metrics captured and documented
- [ ] All tests passing (100% pass rate)
- [ ] Behavioral snapshot created
- [ ] Git tag `pre-refactor-010` created
- [ ] Rollback plan prepared

### During Refactoring
- [ ] Incremental commits (each one compiles and tests pass)
- [ ] External behavior unchanged
- [ ] No new runtime dependencies added (interface/type additions only)
- [ ] JSDoc updated to reflect new extension points
- [ ] Dead code removed

### Post-Refactoring
- [ ] All tests still passing (100% pass rate)
- [ ] `Builder` interface exported from `src/index.ts`; `ZodBuilder` implements it
- [ ] `Parser` interface exported from `src/index.ts`; `AbstractParser` implements it
- [ ] `AbstractParser` class retains all template-method infrastructure; old `BaseParser` name re-exported as `@deprecated` alias
- [ ] All 15+ built-in parser classes updated to `extend AbstractParser` (not `BaseParser`)
- [ ] `registry.ts` `ParserClass` widened to `new(schema: unknown, refs: Context) => Parser` — third-party parser (not extending `AbstractParser`) can be registered
- [ ] `ParserOverride` return type is `Builder | void` (raw `string` removed or deprecated)
- [ ] `ParserSelector` return type is `Builder`
- [ ] `AbstractParser.parse()` and `parseImpl()` return `Builder`
- [ ] `SchemaInputAdapter` protocol can be implemented without touching core files
- [ ] Custom `parserOverride` using `refs.build.code()` produces identical output to the old `string` escape hatch
- [ ] Behavioral snapshot matches (behavior unchanged)
- [ ] No performance regression
- [ ] Code review approved
- [ ] `src/index.ts` exports `Builder`, `Parser`, `AbstractParser`, `SchemaInput`, `SchemaInputAdapter`, `registerAdapter`

### Post-Deployment
- [ ] CI green on `claude/refactor-parser-schema-tZoHq`
- [ ] No consumer bug reports related to refactored parser path
- [ ] 48-72 hour stability period completed

## Related Work

### Blocks
- TypeScript type → Zod conversion feature (requires non-JSON-Schema input)
- GraphQL schema → Zod conversion (requires non-JSON-Schema input)
- Protobuf / JSON Type Definition adapters

### Enables
- `speckit.enhance`: Add `--adapter` CLI flag to select input format at runtime
- `speckit.specify`: TypeScript source → Zod schema output feature
- Third-party adapter package ecosystem (e.g., `x-to-zod-graphql`, `x-to-zod-proto`)

### Dependencies
None — this refactoring is self-contained and does not require prior refactorings.

---
*Refactor spec created using `/refactor` workflow - See .specify/extensions/workflows/refactor/*
