# Classes

## ZodBuilder

### `JsonBuilder`
JsonBuilder: represents z.json()
Validates JSON-encoded strings
*extends `BaseBuilder<ZodType>`*
*implements `BuilderFor<ZodType>`*
```ts
constructor(version?: "v3" | "v4", params?: string | { abort?: boolean; when?: (payload: ParsePayload) => boolean; path?: PropertyKey[]; params?: Record<string, any>; error?: string | $ZodErrorMap<NonNullable<$ZodIssue>>; message?: string }): JsonBuilder
```
**Properties:**
- `typeKind: "lazy"` — Parser type discriminator (e.g. `'string'`, `'object'`, `'anyOf'`).
Set by the parser that creates this builder.

<!-- truncated -->
