# Classes

## ZodBuilder

### `ObjectBuilder`
Fluent ObjectBuilder: wraps a Zod object schema string and provides chainable methods.
*extends `BaseBuilder<ZodObject, "object", [params?: ObjectParams]>`*
```ts
constructor(version: "v3" | "v4", properties: Record<string, Builder>, params?: string | { error?: string | $ZodErrorMap<NonNullable<$ZodIssueUnrecognizedKeys | $ZodIssueInvalidType<unknown>>>; message?: string }): ObjectBuilder
```
**Properties:**
- `typeKind: "object"` — Parser type discriminator (e.g. `'string'`, `'object'`, `'anyOf'`).
Set by the parser that creates this builder.
- `_properties: Record<string, Builder>`
- `_params: [params?: string | { error?: string | $ZodErrorMap<NonNullable<$ZodIssueUnrecognizedKeys | $ZodIssueInvalidType<unknown>>>; message?: string }]` (optional)
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
- `fromCode(code: string, refs?: Context): ObjectBuilder` — Create ObjectBuilder from existing Zod object code string.
Used when applying modifiers to already-built object schemas.
- `strict(): this` — Apply strict mode (no additional properties allowed).
Note: If both strict() and loose() are called, strict takes precedence.
- `catchall(catchallSchemaZod: string): this` — Apply catchall schema for additional properties.
- `loose(): this` — Apply loose mode (allow additional properties). Uses .loose() for Zod v4.
Note: If both strict() and loose() are called, the last one called takes precedence.
- `superRefine(refineFn: string): this` — Apply superRefine for pattern properties validation.
- `and(otherSchemaZod: Builder): this` — Apply and combinator (merge with another schema).
- `extend(extendSchemaZod: string | ObjectBuilder): this` — Extend the object schema with additional properties.
- `merge(mergeSchemaZod: string | ObjectBuilder): this` — Merge with another object schema.
- `pick(keys: string[]): this` — Pick specific keys from the object schema.
- `omit(keys: string[]): this` — Omit specific keys from the object schema.
- `base(): string` — Compute the base object schema.
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
- `meta(metadata: Record<string, unknown>): this` — Apply meta modifier.
- `transform(transformFn: string): this` — Apply transform modifier.

Note: function is provided as raw code string e.g. `(val) =&gt; transformedVal`.
- `is<K>(type: K): this is TypeKindOf<K>`
- `text(): string` — Unwrap and return the final Zod code string.
This orchestrates the template method pattern: text() = modify(base())
- `toString(): string` — Returns a string representation of an object.
