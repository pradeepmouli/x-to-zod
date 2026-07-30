# Classes

## ZodBuilder

### `RecordBuilder`
Fluent RecordBuilder: represents z.record() schema.
Accepts key and value schemas.

KEY SCHEMA REQUIREMENT - Version Differences:
- Zod v3: z.record(valueSchema) with implicit string keys, or z.record(keySchema, valueSchema)
- Zod v4: z.record(keySchema, valueSchema) REQUIRED - single argument form not allowed

Implementation: RecordBuilder ALWAYS uses the two-argument form z.record(keySchema, valueSchema)
for v3/v4 compatibility. This is the safest and most explicit approach.

Typically keySchema is z.string() since JSON object keys are strings.
See RECORD-KEY-SCHEMA-NOTES.md for detailed discussion.
*extends `BaseBuilder<ZodRecord, "record", [keySchema: Builder, valueSchema: Builder]>`*
```ts
constructor(version: "v3" | "v4", keySchema: Builder, valueSchema: Builder): RecordBuilder
```
**Properties:**
- `typeKind: "record"` — Parser type discriminator (e.g. `'string'`, `'object'`, `'anyOf'`).
Set by the parser that creates this builder.
- `_params: [keySchema: Builder<ZodType<unknown, unknown, $ZodTypeInternals<unknown, unknown>>, "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function" | "array" | "null" | "any" | "default" | "enum" | "map" | "nullable" | "int" | "void" | "never" | "unknown" | "date" | "record" | "file" | "tuple" | "union" | "intersection" | "set" | "literal" | "optional" | "nonoptional" | "success" | "transform" | "prefault" | "catch" | "nan" | "pipe" | "readonly" | "template_literal" | "promise" | "lazy" | "custom">, valueSchema: Builder<ZodType<unknown, unknown, $ZodTypeInternals<unknown, unknown>>, "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function" | "array" | "null" | "any" | "default" | "enum" | "map" | "nullable" | "int" | "void" | "never" | "unknown" | "date" | "record" | "file" | "tuple" | "union" | "intersection" | "set" | "literal" | "optional" | "nonoptional" | "success" | "transform" | "prefault" | "catch" | "nan" | "pipe" | "readonly" | "template_literal" | "promise" | "lazy" | "custom">]` (optional)
- `_optional: boolean`
- `_nullable: boolean`
- `_readonly: boolean`
- `_defaultValue: unknown` (optional)
- `_describeText: string` (optional)
- `_brandText: string` (optional)
- `_fallbackText: unknown` (optional)
- `_refineFn: string` (optional)
- `_refineMessage: string` (optional)
- `_superRefineFns: string[]`
- `_metaData: Record<string, unknown>` (optional)
- `_transformFn: string` (optional)
- `_version: "v3" | "v4"` (optional)
**Methods:**
- `base(): string` — Compute the type-specific base schema string.

This is the core abstract method in the template method pattern.
Subclasses must implement this to provide their type-specific schema string
(e.g., "z.string()", "z.number()", "z.object({...})").

The base schema string returned by this method will then have shared modifiers
applied via the `modify()` method when `text()` is called.
- `isV4(): boolean` — Check if targeting Zod v4.
- `isV3(): boolean` — Check if targeting Zod v3.
- `serializeParams(): string` — Serialize params to a string representation for code generation.
Handles objects, strings, primitives, and undefined.
- `optional(): this` — Apply optional constraint.
- `required(): this`
- `nullable(): this` — Apply nullable constraint.
- `default(value: unknown): this` — Apply default value.
- `describe(description: string): this` — Apply describe modifier.
- `brand(brand: string): this` — Apply brand modifier.
- `readonly(): this` — Apply readonly modifier.
- `catch(fallback: unknown): this` — Apply catch modifier.
- `refine(refineFn: string, message?: string): this` — Apply refine modifier.

Note: function is provided as raw code string e.g. `(val) =&gt; val &gt; 0`.
- `superRefine(superRefineFn: string): this` — Apply superRefine modifier.

Note: function is provided as raw code string e.g. `(val, ctx) =&gt; { ... }`.
- `meta(metadata: Record<string, unknown>): this` — Apply meta modifier.
- `transform(transformFn: string): this` — Apply transform modifier.

Note: function is provided as raw code string e.g. `(val) =&gt; transformedVal`.
- `is<K>(type: K): this is TypeKindOf<K>`
- `modify(baseText: string): string` — Apply all shared modifiers to the base schema string.
This method is called by text() and applies modifiers in a stable order.
- `text(): string` — Unwrap and return the final Zod code string.
This orchestrates the template method pattern: text() = modify(base())
- `toString(): string` — Returns a string representation of an object.
