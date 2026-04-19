# Functions

## `select`
Selects the most specific parser for a given JSON Schema node.

Inspects the schema's structural properties — `type`, keyword presence —
and returns the matching `parse.*` handler. Falls back to `parse.schema`
for composite schemas (enum, anyOf, allOf, etc.) that do not map to a
primitive type discriminator.
```ts
select<S>(schema: JSONSchema<S, any, TypeValue>): ((schema: JSONSchemaAny<Version>, refs: Context, blockMeta?: boolean) => Builder) | ((schema: SchemaNode & { type?: string }, refs: Context) => Builder)
```
**Parameters:**
- `schema: JSONSchema<S, any, TypeValue>` — The JSON Schema node to inspect.
**Returns:** `((schema: JSONSchemaAny<Version>, refs: Context, blockMeta?: boolean) => Builder) | ((schema: SchemaNode & { type?: string }, refs: Context) => Builder)` — The appropriate parser from the `parse` namespace.
```ts
import { JSONSchema, select } from 'x-to-zod';
const parser = select({ type: 'string', minLength: 1 });
```

## parseRef

### `parseRef`
Detects and parses external $ref entries in a JSON schema.
Returns ReferenceBuilder for external refs or null for non-refs/internal refs.
```ts
parseRef(schema: JSONSchemaAny | undefined, refResolver: DefaultRefResolver, fromSchemaId: string, dependencyGraph?: DependencyGraph, depth: number): ReferenceBuilder | null
```
**Parameters:**
- `schema: JSONSchemaAny | undefined`
- `refResolver: DefaultRefResolver`
- `fromSchemaId: string`
- `dependencyGraph: DependencyGraph` (optional)
- `depth: number` — default: `0`
**Returns:** `ReferenceBuilder | null`

### `extractRefs`
Extract all $refs from a schema recursively.
Accepts any value and safely narrows internally.
Useful for dependency analysis.
```ts
extractRefs(schema: unknown, refs: Set<string>, depth: number): Set<string>
```
**Parameters:**
- `schema: unknown`
- `refs: Set<string>` — default: `...`
- `depth: number` — default: `0`
**Returns:** `Set<string>`

## pathParser

### `parsePathPattern`
Parse a JSONPath-inspired pattern into compiled segments.
Supports:
- $ root
- dot-separated segments
- single-segment wildcard `*`
- deep wildcard `**`
- recursive descent `$..foo` (compiled as leading `**` plus literal segments)
```ts
parsePathPattern(pattern: string): CompiledSegment[]
```
**Parameters:**
- `pattern: string`
**Returns:** `CompiledSegment[]`

## pathMatcher

### `matchPath`
Tests whether a resolved schema path matches a glob-style path pattern.

Supports `*` (single-segment wildcard) and `**` (deep multi-segment wildcard)
as special tokens. Literal segments are compared as strings, so numeric array
indices are matched literally.
```ts
matchPath(path: PathSegment[], pattern: string): boolean
```
**Parameters:**
- `path: PathSegment[]` — The resolved path as an array of `PathSegment` values (strings or numbers).
- `pattern: string` — The glob-style pattern string (e.g. `'**.id'`, `'addresses.*.street'`).
**Returns:** `boolean` — `true` when the path matches the compiled pattern; `false` otherwise.
```ts
matchPath(['user', 'address', 'street'], '**.street'); // true
matchPath(['user', 'name'], 'user.*');                 // true
matchPath(['user', 'id'], 'post.id');                  // false
```

### `clearPathPatternCache`
Clears the internal compiled-pattern cache.

Path patterns are compiled from their string form into a `CompiledSegment[]`
array on first use and cached for subsequent calls. Call this function in
tests or long-lived processes where patterns change dynamically to avoid
stale cache entries.
```ts
clearPathPatternCache(): void
```
