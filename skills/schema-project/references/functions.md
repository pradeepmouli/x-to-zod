# Functions

## `parseRef`
Detects and parses external $ref entries in a JSON schema.
Returns ReferenceBuilder for external refs or null for non-refs/internal refs.
```ts
parseRef(schema: JSONSchemaAny | undefined, refResolver: DefaultRefResolver, fromSchemaId: string, dependencyGraph?: DependencyGraph, depth: number): ReferenceBuilder | null
```
**Parameters:**
- `schema: JSONSchemaAny | undefined` — 
- `refResolver: DefaultRefResolver` — 
- `fromSchemaId: string` — 
- `dependencyGraph: DependencyGraph` (optional) — 
- `depth: number` — default: `0` — 
**Returns:** `ReferenceBuilder | null`

## `extractRefs`
Extract all $refs from a schema recursively.
Accepts any value and safely narrows internally.
Useful for dependency analysis.
```ts
extractRefs(schema: unknown, refs: Set<string>, depth: number): Set<string>
```
**Parameters:**
- `schema: unknown` — 
- `refs: Set<string>` — default: `...` — 
- `depth: number` — default: `0` — 
**Returns:** `Set<string>`
