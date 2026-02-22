# Research: Abstract Parser/Schema Project Surface

**Feature**: refactor-010 | **Phase**: 0 — Technical Unknowns Resolution
**Date**: 2026-02-21

---

## Unknown 1: Builder interface — chain return type

**Question**: `ZodBuilder` methods return `this` for fluent chaining. In a TypeScript interface,
`this` refers to the implementing class. Can the `Builder` interface use `this` as return type
while still being assignable from `ZodBuilder`?

**Research Findings**:
TypeScript allows `this` as a return type in interface method signatures. A class that implements
the interface with a method returning `this` will satisfy the interface because `this` is a
polymorphic type that is covariant — every subclass `this` is a subtype of the interface's `this`.

However, when a caller holds a reference typed as `Builder` (the interface), chained calls return
`Builder` (not the concrete type), so callers cannot chain `.optional().brand('x')` without the
compiler knowing the concrete type. This is acceptable: the `Builder` interface is the _output
contract_ for callers who only need to read `text()` or apply modifiers generically.

**Decision**: Declare all modifier methods in `Builder` as returning `Builder` (not `this`). The
concrete `ZodBuilder` class retains `this` return types for its own chaining — TypeScript accepts
this because a method returning `ZodBuilder` satisfies `optional(): Builder` structurally (since
`ZodBuilder` extends `Builder`).

**Alternatives Considered**:
- `optional(): this` in the interface — works but misleads callers into thinking they get the
  concrete type back; also requires every third-party `Builder` implementation to return `this`,
  which is overly restrictive.
- Separate `FluentBuilder<T>` and `Builder` — adds unnecessary complexity for the current use cases.

---

## Unknown 2: ParserClass registry type widening — constructor parameter contravariance

**Question**: The current `ParserClass` union is `typeof ObjectParser | typeof ArrayParser | ...`.
All constructors accept `(schema: JSONSchemaObject<Version>, refs: Context)`. The desired new type
is `new(schema: any, refs: Context) => Parser`. Will TypeScript allow assigning existing parser
classes to the wider constructor type?

**Research Findings**:
TypeScript uses **bivariance** for method and function parameters in class method positions (due to
the `--strictFunctionTypes` flag not applying to methods, only to standalone function types). For
constructor signatures (`new(...)` types), TypeScript checks them as function types under strict
mode — meaning parameter types are contravariant: to assign `new(schema: JSONSchemaObject) =>
ZodBuilder` to `new(schema: unknown) => Parser`, the parameter must be at least as wide as
`unknown` (not narrower). This would **fail** under strict mode.

However, using `new(schema: any, refs: Context) => Parser` bypasses the variance check because
`any` opts out of type checking entirely. Assigning `new(schema: JSONSchemaObject) => ZodBuilder`
to `new(schema: any, refs: Context) => Parser` succeeds: `any` accepts everything, and
`ZodBuilder` is assignable to `Parser` structurally.

**Decision**: Type `ParserConstructor` as `new(schema: any, refs: Context) => Parser`. This is
the standard pattern used in TypeScript plugin architectures (e.g., NestJS, TypeORM) where the
registry must accept constructors with different schema-specific parameter types.

**Mitigations for the `any` parameter**:
- The `any` appears only in the registry type definition — it is not exposed in any user-facing call
  site. Actual parser classes retain their specific typed constructors.
- A runtime assertion in `registerParser` validates that the constructed instance has `typeKind`
  and `parse()` (see Risk 7 in spec.md).

**Alternatives Considered**:
- `new(schema: unknown, refs: Context) => Parser` — would require all 18 existing parsers to
  change their constructor parameter to `unknown` and add internal casts. High mechanical churn,
  no user-visible benefit.
- `new(schema: JSONSchemaObject | SchemaInput, refs: Context) => Parser` — union type, but still
  doesn't help third-party parsers whose input type is neither.

---

## Unknown 3: AbstractParser generic parameter design

**Question**: `BaseParser<TypeKind, Version, JS extends JSONSchemaAny<Version>>` has three type
parameters. After generalization, how should the schema type parameter change so that:
(a) all 18 existing parsers continue to work without modification, and
(b) new parsers with a different schema type can be authored.

**Research Findings**:
The third type parameter `JS` is used as the parameter type of `parseImpl(schema: JS)`. Its
default is `JSONSchemaAny<Version>`. The first two parameters (`TypeKind`, `Version`) are used in
`typeKind` and in `JSONSchemaObject<Version>` constructor parameter, respectively.

After the rename, `AbstractParser` should:
1. Keep `TypeKind` as-is (it's the parser's self-description string).
2. Remove `Version` as a top-level parameter — it is only needed to parameterize `JS`. Third-party
   parsers don't have a `SchemaVersion`.
3. Replace `JS extends JSONSchemaAny<Version>` with `S extends object = JSONSchemaObject<SchemaVersion>`.
   Using `object` as the constraint allows any structured input. The default keeps existing parsers
   working without changes.

**Decision**: `AbstractParser<TypeKind extends string = string, S extends object = JSONSchemaObject<SchemaVersion>>`.
- `Version` parameter dropped (was only needed internally for `JS` parameterization; JSON Schema parsers encode the version in their concrete `S` default).
- All 18 existing parsers change from `BaseParser<'string', Version, JS>` to `AbstractParser<'string', JS>` — `Version` is dropped, `JS` moves to second position.
- For backwards compat, the `BaseParser` shim re-exports `AbstractParser` using a mapped type alias that swaps parameter positions.

**Alternatives Considered**:
- Keep `Version` as middle parameter — would leave it for existing parsers but confuse third-party authors.
- Use `S = unknown` — too wide; `abstract parseImpl(schema: S)` would need casts inside every parser.

---

## Unknown 4: SchemaInput type — branded or structural?

**Question**: Should `SchemaInput` be a structural interface (with required fields) or a type alias
for `unknown`?

**Research Findings**:
Since adapters own the validity check (`adapter.isValid(input)`), the core pipeline never inspects
the shape of a `SchemaInput` value directly. The pipeline only passes it through to the adapter and
to the parser constructors (which are also adapter-provided). Therefore, `SchemaInput` needs no
structural fields at all — it is purely a semantic alias for `unknown`.

A structural interface would be premature: it would constrain adapter authors to add sentinel
fields (like `_type: 'schema'`) that serve no purpose beyond type narrowing that the adapter
already performs via `isValid()`.

**Decision**: `type SchemaInput = unknown` — a semantic alias documenting intent without adding
structural constraints. Adapters use type guards (`input is JSONSchemaObject`) internally.

**Alternatives Considered**:
- `interface SchemaInput { readonly _schemaInputBrand: unique symbol }` — branded type; prevents
  accidental `SchemaInput` usage but requires adapter authors to cast their values, adding ceremony.
- `interface SchemaInput { [key: string]: unknown }` — too wide but structural; allows anything
  object-shaped, still doesn't help with non-object schema representations.

---

## Unknown 5: SchemaInputAdapter method signatures

**Question**: What methods must a `SchemaInputAdapter` implement? What is the minimum viable API?

**Research Findings**:
Walking through `parseSchema.ts`, the core pipeline uses the adapter for four distinct operations:

| Operation | Where Used | Adapter Method |
|-----------|-----------|----------------|
| Decide if input is valid for this adapter | Line 27 `if (isJSONSchema(schema))` | `isValid(input): boolean` |
| Select the parser class for an input | Lines 84-100 `selectParserClass(schema)` | `selectParser(input, refs): ParserConstructor \| undefined` |
| Extract `$ref` string from input | Lines 34-47 `schema.$ref` access | `getRef(input): string \| undefined` |
| Extract description/default/readOnly | Lines 147-174 in `BaseParser.applyMetadata` | `getMetadata(input): SchemaMetadata` |

The `getMetadata` and `getRef` methods are needed for the adapter to own all schema-field access,
but they can be deferred to a later step — in Step 0-3 they can remain in `AbstractParser` with
JSON Schema-specific logic, migrated to the adapter in Step 4.

**Decision**: Minimum viable `SchemaInputAdapter`:
```typescript
interface SchemaInputAdapter {
  isValid(input: unknown): boolean;
  selectParser(input: unknown, refs: Context): ParserConstructor | undefined;
  getRef(input: unknown): string | undefined;
  getMetadata(input: unknown): SchemaMetadata;
}

interface SchemaMetadata {
  description?: string;
  default?: unknown;
  readOnly?: boolean;
}
```

**Alternatives Considered**:
- Split into `SchemaInputValidator` + `SchemaInputSelector` — unnecessary interface proliferation
  for an MVP; a single adapter is simpler.
- Include `normalise(input): NormalisedSchema` — overly coupled; the adapter shouldn't
  need to transform the input into a canonical form.

---

## Unknown 6: tsgo build system

**Question**: What is `tsgo`? Is it the TypeScript native go-based compiler or a project-specific
wrapper?

**Research Findings**:
`tsgo` is TypeScript's experimental native Go-based compiler (`typescript-go`), an early-access
rewrite of `tsc` in Go offering significantly faster compile times (10-100× faster). It is used
here as a drop-in `tsc` replacement, producing identical output. The build scripts reference it
directly as the compile command.

**Decision** (no change needed): The refactoring introduces no new tsconfig targets. New source
files under `src/Builder/`, `src/Parser/`, and `src/SchemaInput/` are picked up automatically by
the existing `include: ["src/**/*.ts"]` glob in all tsconfig variants. No build script changes
needed.

---

## Unknown 7: Test coverage for all 18 parser types

**Question**: Do all 18 parser types have existing test coverage that will serve as the behavior
preservation guarantee after the rename?

**Research Findings**:
Running `pnpm test` shows ~70 test files. The functional parser tests in `test/parsers/` cover:
`parseAllOf`, `parseAnyOf`, `parseArray`, `parseBoolean`, `parseConst`, `parseEnum`,
`parseInteger`, `parseNull`, `parseNumber`, `parseObject`, `parseOneOf`, `parseString`,
`parseTuple`.

**Gaps identified**:
- `ConditionalParser` — no dedicated test file found (Gap 7 in testing-gaps.md)
- `MultipleTypeParser` — no dedicated test file found (Gap 8 in testing-gaps.md)
- `NullableParser` — covered indirectly through nullable schema tests, but no dedicated file
- `RecordParser` — covered indirectly through object tests
- `NotParser` — covered indirectly through `not` keyword tests

The 15-parser smoke test (test Gap 6 in testing-gaps.md) will provide the explicit regression
harness needed post-rename. Existing tests provide adequate behavior coverage.

**Decision**: Proceed. Add smoke test before Step 0b (the rename). Per constitution Principle IV,
tests must exist before the implementation step they verify — the smoke test must be written before
the `extend BaseParser` → `extend AbstractParser` rename step begins.

---

## Summary of Decisions

| # | Decision | Key Reason |
|---|----------|-----------|
| 1 | `Builder` methods return `Builder` (not `this`) in interface | Structural compatibility; callers with `Builder` ref get full chain |
| 2 | `ParserConstructor = new(schema: any, refs: Context) => Parser` | Bypasses contravariance; standard plugin-registry pattern |
| 3 | `AbstractParser<TypeKind, S extends object = JSONSchemaObject>` (drop `Version` param) | Cleaner for third-party authors; existing parsers get compatible default |
| 4 | `type SchemaInput = unknown` | Adapter owns all shape checking; no sentinel fields needed |
| 5 | `SchemaInputAdapter` with 4 methods: `isValid`, `selectParser`, `getRef`, `getMetadata` | Minimal surface derived from actual `parseSchema.ts` usage points |
| 6 | No build script changes needed | `tsgo` picks up new `src/**/*.ts` files automatically |
| 7 | Add smoke test before Step 0b (rename) | Constitutionally required; closes Gap 6 in testing-gaps.md |
