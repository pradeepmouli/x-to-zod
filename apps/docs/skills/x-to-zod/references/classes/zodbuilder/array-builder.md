# Classes

## ZodBuilder

### `ArrayBuilder`
Fluent ArrayBuilder: wraps a Zod array schema string and provides chainable methods.

NONEMPTY() TYPE INFERENCE - Version Notes:
Both Zod v3 and v4 support .nonempty() with identical validation behavior.
However, type inference differs:
- .nonempty() infers [T, ...T[]] (tuple-like with at least one element)
- .min(1) infers T[] (regular array)

Implementation: ArrayBuilder uses .min(1) instead of .nonempty() for:
1. Consistency across versions
2. Clarity in error messages
3. Alignment with JSON Schema constraints (which don't express tuple constraints)

The validation is functionally identical in both v3 and v4.
See ARRAY-NONEMPTY-NOTES.md for details.
*extends `BaseBuilder<ZodArray<Z>, "array", [itemSchema: BuilderFor<Z> | BuilderFor<Z>[], params?: ArrayCreateParams]>`*
*implements `BuilderFor<ZodArray>`*
```ts
constructor<Z>(version: "v3" | "v4", itemSchema: BuilderFor<Z> | BuilderFor<Z>[], params?: string | { error?: string | $ZodErrorMap<$ZodIssueInvalidType<unknown>>; message?: string }): ArrayBuilder<Z>
```
**Properties:**
- `typeKind: "array"` — Parser type discriminator (e.g. `'string'`, `'object'`, `'anyOf'`).
Set by the parser that creates this builder.
- `_minItems: { value: number; params?: string | { abort?: boolean; error?: string | $ZodErrorMap<$ZodIssueTooSmall<HasLength>>; message?: string } }` (optional)
- `_maxItems: { value: number; params?: string | { abort?: boolean; error?: string | $ZodErrorMap<$ZodIssueTooBig<HasLength>>; message?: string } }` (optional)
- `_exactLength: { value: number; params?: string | { abort?: boolean; error?: string | $ZodErrorMap<NonNullable<$ZodIssueTooSmall<HasLength> | $ZodIssueTooBig<HasLength>>>; message?: string } }` (optional)
- `_params: [itemSchema: BuilderFor<Z> | BuilderFor<Z>[], params?: string | { error?: string | $ZodErrorMap<$ZodIssueInvalidType<unknown>>; message?: string }]` (optional)
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
- `min(value: number, params?: string | { abort?: boolean; error?: string | $ZodErrorMap<$ZodIssueTooSmall<HasLength>>; message?: string }): this` — Apply minItems constraint.
- `max(value: number, params?: string | { abort?: boolean; error?: string | $ZodErrorMap<$ZodIssueTooBig<HasLength>>; message?: string }): this` — Apply maxItems constraint.
- `nonempty(params?: string | { abort?: boolean; error?: string | $ZodErrorMap<$ZodIssueTooSmall<HasLength>>; message?: string }): this` — Require at least one element (delegates to min(1)).
- `length(len: number, params?: string | { abort?: boolean; error?: string | $ZodErrorMap<NonNullable<$ZodIssueTooSmall<HasLength> | $ZodIssueTooBig<HasLength>>>; message?: string }): this` — Require exactly `len` elements.
- `unwrap(): Z`
- `base(): string` — Compute the base array schema.
- `modify(baseText: string): string` — Apply all shared modifiers to the base schema string.
This method is called by text() and applies modifiers in a stable order.
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
- `text(): string` — Unwrap and return the final Zod code string.
This orchestrates the template method pattern: text() = modify(base())
- `toString(): string` — Returns a string representation of an object.
