# Types & Enums

## Types

### `TypeKind`
```ts
{ [T in keyof typeof buildV4 as typeof buildV4[T] extends (args: unknown[]) => unknown ? T : never]: ReturnType<Extract<typeof buildV4[T], (args: unknown[]) => unknown>> }
```

### `TypeKindOf`
```ts
TypeKind[T]
```

### `V3BuildAPI`
Explicit type for the complete Zod v3 builder factory.

### `V4BuildAPI`
Explicit type for the complete Zod v4 builder factory.
