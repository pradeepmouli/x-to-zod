# Classes

## ZodBuilder

### `NativeEnumBuilder`
NativeEnumBuilder: represents z.enum() in v4 or z.nativeEnum() in v3
Validates against TypeScript native enum values.

In Zod v4, the enum API is unified - both native TypeScript enums and
string literal enums use z.enum(). In v3, native enums use z.nativeEnum().
*extends `BaseBuilder<ZodEnum, "enum", [enumReference: string]>`*
*implements `BuilderFor<ZodEnum>`*
```ts
constructor(version: "v3" | "v4", enumReference: string): NativeEnumBuilder
```
**Properties:**
- `typeKind: "enum"` — Parser type discriminator (e.g. `'string'`, `'object'`, `'anyOf'`).
Set by the parser that creates this builder.
- `_params: [enumReference: string]` (optional)
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
- `extract(_values: readonly string[], _params?: string | Record<string, unknown>): this`
- `exclude(_values: readonly string[], _params?: string | Record<string, unknown>): this`
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
