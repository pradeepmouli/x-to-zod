# Classes

## ZodBuilder

### `ReferenceBuilder`
ReferenceBuilder represents a reference to an external schema in a multi-schema project.
It is used when a $ref points to another schema file and generates the appropriate
import and reference code.

This is a standalone class (not a ZodBuilder subclass) because references are
structural pointers, not Zod schema constructors — they don't map to a z.xxx() call.
*implements `Builder`*
```ts
constructor(targetImportName: string, targetExportName: string, importInfo: ImportInfo, options?: { isLazy?: boolean; isTypeOnly?: boolean; unknownFallback?: boolean }): ReferenceBuilder
```
**Properties:**
- `typeKind: "lazy"` — Parser type discriminator (e.g. `'string'`, `'object'`, `'anyOf'`).
Set by the parser that creates this builder.
- `targetImportName: string`
- `targetExportName: string`
- `importInfo: ImportInfo`
- `isLazy: boolean`
- `isTypeOnly: boolean`
- `unknownFallback: boolean`
- `shouldEmitImport: boolean`
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
**Methods:**
- `optional(): this` — Apply `.optional()` modifier to the generated schema.
- `nullable(): this` — Apply `.nullable()` modifier to the generated schema.
- `default(value: unknown): this` — Apply `.default(value)` modifier.
- `describe(description: string): this` — Apply `.describe(description)` modifier.
- `brand(brand: string): this` — Apply `.brand(brand)` modifier for nominal typing.
- `readonly(): this` — Apply `.readonly()` modifier to the generated schema.
- `catch(value: unknown): this` — Apply `.catch(fallback)` modifier for parse-failure recovery.
- `refine(refineFn: string, message?: string): this` — Apply `.refine(fn, message?)` constraint.
- `superRefine(superRefineFn: string): this` — Apply `.superRefine(fn)` constraint.
- `meta(metadata: Record<string, unknown>): this` — Apply `.meta(obj)` metadata (Zod v4+).
- `transform(transformFn: string): this` — Apply `.transform(fn)` mapping.
- `text(): string` — Emit the final Zod expression as a TypeScript code string.
- `getImportInfo(): ImportInfo | null`
