# Data Model: Abstract Parser/Schema Project Surface

**Feature**: refactor-010 | **Phase**: 1 — Design
**Date**: 2026-02-21

This document maps the interfaces, types, and classes introduced or modified by this refactoring.
There is no database schema change. All entities are TypeScript type-level constructs.

---

## Entity Map

### 1. `Builder` (interface) — NEW

**File**: `src/Builder/index.ts`
**Replaces**: direct use of `ZodBuilder` / `BaseBuilder` as return type

| Field/Method | Type | Notes |
|---|---|---|
| `typeKind` | `readonly string` | Discriminator (e.g. `'string'`, `'object'`) |
| `text()` | `(): string` | Emit final Zod code string |
| `optional()` | `(): Builder` | Mark schema optional |
| `nullable()` | `(): Builder` | Make schema nullable |
| `default(v)` | `(v: unknown): Builder` | Set default value |
| `describe(s)` | `(s: string): Builder` | Attach JSDoc description |
| `brand(b)` | `(b: string): Builder` | Apply `.brand()` modifier |
| `readonly()` | `(): Builder` | Apply `.readonly()` modifier |
| `catch(v)` | `(v: unknown): Builder` | Apply `.catch()` fallback |
| `refine(fn, msg?)` | `(fn: string, msg?: string): Builder` | Add `.refine()` constraint |
| `superRefine(fn)` | `(fn: string): Builder` | Add `.superRefine()` constraint |
| `meta(obj)` | `(obj: Record<string, unknown>): Builder` | Attach `.meta()` object |
| `transform(fn)` | `(fn: string): Builder` | Apply `.transform()` |

**Relationships**:
- `ZodBuilder` implements `Builder` (additive; no breaking change)
- All `parseImpl()` return types narrow to `Builder`
- `ParserOverride` callback return type changes from `BaseBuilder | string | void` → `Builder | void`

**Validation Rules**: None at the interface level. `ZodBuilder` enforces correct code generation internally.

---

### 2. `Parser` (interface) — NEW

**File**: `src/Parser/index.ts`

| Field/Method | Type | Notes |
|---|---|---|
| `typeKind` | `readonly string` | Parser self-description; used in registry key |
| `parse()` | `(): Builder` | Entry point; must return a `Builder` |

**Relationships**:
- `AbstractParser` implements `Parser`
- `ParserConstructor` describes the constructor shape used in the registry

**State Transitions**: Stateless — parsers are constructed, `parse()` is called once, instance is discarded.

---

### 3. `ParserConstructor` (type alias) — NEW

**File**: `src/Parser/index.ts`

```text
ParserConstructor = new(schema: any, refs: Context) => Parser
```

| Parameter | Type | Notes |
|---|---|---|
| `schema` | `any` | Typed `any` to avoid constructor parameter contravariance (see research.md §2) |
| `refs` | `Context` | Execution context (path, seen, adapter, build functions) |
| Returns | `Parser` | Instance satisfying the `Parser` contract |

**Relationships**:
- Used as the element type of `parserRegistry` values in `registry.ts`
- `registerParser(typeKind, cls)` accepts `ParserConstructor`
- All 18 concrete parser class constructors are structurally assignable to `ParserConstructor`

---

### 4. `AbstractParser<TypeKind, S>` (abstract class) — MOVED/RENAMED

**File**: `src/JsonSchema/parsers/AbstractParser.ts` (was `BaseParser.ts`)

| Field/Method | Visibility | Type | Notes |
|---|---|---|---|
| `typeKind` | public | `TypeKind` | Set from constructor arg |
| `schema` | protected | `S` | Input schema value |
| `refs` | protected | `Context` | Execution context |
| `parse()` | public | `(): Builder` | Template method; calls parseImpl + processors |
| `parseImpl(schema)` | protected abstract | `(s: S): Builder` | Subclass-specific logic |
| `applyPreProcessors(schema)` | protected | `(s: S): S` | Pre-processor chain |
| `applyPostProcessors(builder, schema)` | protected | `(b: Builder, s: S): Builder` | Post-processor chain |
| `applyMetadata(builder, schema)` | protected | `(b: Builder, s: S): Builder` | description/default/readOnly |
| `filterPreProcessors(procs?, path?)` | protected | — | Path-filtered pre-processor list |
| `filterPostProcessors(configs?, path?)` | protected | — | Path-filtered post-processor list |
| `createChildContext(...segs)` | protected | `(): Context` | Child context with extended path |
| `parseChild(schema, ...segs)` | protected | `(): Builder` | Parse child with path tracking |
| `setParseSchema(fn)` | public static | `(fn): void` | Circular-dep breaker |
| `parseSchema(schema, refs, blockMeta?)` | public static | `(): Builder` | Delegate to registered fn |

**Type Parameters**:

| Param | Constraint | Default | Notes |
|---|---|---|---|
| `TypeKind` | `string` | `string` | Parser type discriminator |
| `S` | `object` | `JSONSchemaObject<SchemaVersion>` | Input schema type (see research.md §3) |

**Backwards Compatibility**:
- `src/JsonSchema/parsers/BaseParser.ts` is retained as a shim:
  ```ts
  /** @deprecated Use AbstractParser instead */
  export { AbstractParser as BaseParser } from './AbstractParser.js';
  ```
- All 18 concrete parser classes are updated to `extend AbstractParser` (mechanical rename).

---

### 5. `SchemaInput` (type alias) — NEW

**File**: `src/SchemaInput/index.ts`

```text
type SchemaInput = unknown
```

Semantic alias. The core pipeline accepts `SchemaInput` values and passes them through to the
active adapter. No structural constraint is imposed (see research.md §4).

---

### 6. `SchemaMetadata` (interface) — NEW

**File**: `src/SchemaInput/index.ts`

| Field | Type | Notes |
|---|---|---|
| `description` | `string \| undefined` | From JSON Schema `description` or adapter equivalent |
| `default` | `unknown` | From JSON Schema `default` or adapter equivalent |
| `readOnly` | `boolean \| undefined` | From JSON Schema `readOnly` or adapter equivalent |

Used by `AbstractParser.applyMetadata` via `this.refs.adapter?.getMetadata(this.schema)`.

---

### 7. `SchemaInputAdapter` (interface) — NEW

**File**: `src/SchemaInput/index.ts`

| Method | Signature | Notes |
|---|---|---|
| `isValid` | `(input: unknown): boolean` | Returns true if this adapter can handle `input` |
| `selectParser` | `(input: unknown, refs: Context): ParserConstructor \| undefined` | Returns parser class for input; undefined = fallback |
| `getRef` | `(input: unknown): string \| undefined` | Returns `$ref` string if input is a reference schema; undefined otherwise |
| `getMetadata` | `(input: unknown): SchemaMetadata` | Returns description/default/readOnly for `input` |

**Relationships**:
- `JsonSchemaAdapter` implements `SchemaInputAdapter` (default adapter)
- `Context.adapter?: SchemaInputAdapter` holds the active adapter
- `parseSchema` defaults to `jsonSchemaAdapter` when `refs.adapter` is undefined

**State Transitions**: Adapters are stateless singletons; all state lives in `Context`.

---

### 8. `JsonSchemaAdapter` (class) — NEW

**File**: `src/SchemaInput/JsonSchemaAdapter.ts`

| Method | Implementation Notes |
|---|---|
| `isValid(input)` | Delegates to `isJSONSchema(input)` (existing type guard) |
| `selectParser(input, refs)` | Delegates to `selectParserClass(input as JSONSchema)` (existing function) |
| `getRef(input)` | Returns `(input as any).$ref` if it is a string; undefined otherwise |
| `getMetadata(input)` | Extracts `description`, `default`, `readOnly` from input cast to `JSONSchemaObject` |

**Export**: `export const jsonSchemaAdapter = new JsonSchemaAdapter();`
**Used by**: `parseSchema.ts` as the fallback when `refs.adapter` is not set.

---

### 9. `Context` (modified type) — EXISTING MODIFIED

**File**: `src/Types.ts`

**New field added**:

| Field | Type | Notes |
|---|---|---|
| `adapter?` | `SchemaInputAdapter` | Active input adapter; defaults to `jsonSchemaAdapter` |

All other `Context` fields remain unchanged.

---

### 10. `ParserOverride` (modified type) — EXISTING MODIFIED

**File**: `src/Types.ts`

| Version | Type |
|---|---|
| Before | `(schema: JSONSchema, refs: Context) => BaseBuilder \| string \| void` |
| After | `(schema: JSONSchema, refs: Context) => Builder \| void` |

The raw `string` return is removed. Callers who previously returned a `string` must change to
`refs.build.code(str)` (returns a `Builder`). During the transition, `parseSchema.ts` will wrap
`string` returns with a `console.warn` shim for one release cycle.

---

## Entity Relationship Summary

```
SchemaInputAdapter
  ├── isValid()  ──────────────────────→  parseSchema [guard]
  ├── selectParser()  ─────────────────→  ParserConstructor
  │                                            └── new(any, Context) → Parser
  │                                                  └── AbstractParser (implements Parser)
  │                                                        └── [18 concrete parsers]
  ├── getRef()  ───────────────────────→  parseSchema [$ref handling]
  └── getMetadata()  ─────────────────→  AbstractParser.applyMetadata()

Builder (interface)
  └── ZodBuilder (implements Builder)
        └── parse() / parseImpl() → Builder
        └── ParserOverride → Builder | void

Context
  └── adapter?: SchemaInputAdapter   ← new field
  └── build: BuildFunctions          ← unchanged
  └── seen, path, preProcessors, postProcessors, ...  ← unchanged
```
