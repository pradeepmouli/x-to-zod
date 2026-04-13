# Functions

## `select`
```ts
select<S>(schema: JSONSchema<S, any, TypeValue>): ((schema: JSONSchemaAny<Version>, refs: Context, blockMeta?: boolean) => Builder) | ((schema: SchemaNode & { type?: string }, refs: Context) => Builder)
```
**Parameters:**
- `schema: JSONSchema<S, any, TypeValue>`
**Returns:** `((schema: JSONSchemaAny<Version>, refs: Context, blockMeta?: boolean) => Builder) | ((schema: SchemaNode & { type?: string }, refs: Context) => Builder)`

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
```ts
matchPath(path: PathSegment[], pattern: string): boolean
```
**Parameters:**
- `path: PathSegment[]`
- `pattern: string`
**Returns:** `boolean`

### `clearPathPatternCache`
```ts
clearPathPatternCache(): void
```
