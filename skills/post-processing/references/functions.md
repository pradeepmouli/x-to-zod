# Functions

## `parsePathPattern`
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
- `pattern: string` — 
**Returns:** `CompiledSegment[]`

## `matchPath`
```ts
matchPath(path: PathSegment[], pattern: string): boolean
```
**Parameters:**
- `path: PathSegment[]` — 
- `pattern: string` — 
**Returns:** `boolean`

## `clearPathPatternCache`
```ts
clearPathPatternCache(): void
```
