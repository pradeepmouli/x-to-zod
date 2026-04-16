# Variables & Constants

## `parse`
Namespace of JSON Schema parser constructors, one per schema kind.

Each member is a parser class or factory that accepts a JSON Schema node and
returns a `Builder`. Use `parse.string`, `parse.object`, etc. directly when
you know the schema's type, or call `select(schema)` to pick the right parser
automatically.

Special members:
- `parse.schema` — handles all composite / keyword-based schemas
- `parse.ref` — resolves `$ref` pointers in multi-schema projects
- `parse.default` — wraps another parser with a default value
```ts
const parse: { array: (schema: SchemaNode & { type?: string }, refs: Context) => Builder; object: (schema: SchemaNode & { type?: string }, refs: Context) => Builder; boolean: (schema: SchemaNode & { type?: string }, refs: Context) => Builder; string: (schema: SchemaNode & { type?: string }, refs: Context) => Builder; number: (schema: SchemaNode & { type?: string }, refs: Context) => Builder; null: (schema: SchemaNode & { type?: string }, refs: Context) => Builder; anyOf: (schema: SchemaNode & { anyOf: JSONSchemaAny[] }, refs: Context) => Builder; allOf: (schema: SchemaNode & { allOf: JSONSchemaAny[] }, refs: Context) => Builder; oneOf: (schema: SchemaNode & { oneOf: JSONSchemaAny[] }, refs: Context) => Builder; enum: (schema: SchemaNode & { enum: unknown[] }, refs: Context) => Builder; const: (schema: SchemaNode & { const: unknown }, refs: Context) => Builder; tuple: (schema: SchemaNode, refs: Context) => Builder; record: (schema: SchemaNode, refs: Context) => Builder; union: (schema: SchemaNode & { anyOf: JSONSchemaAny[] }, refs: Context) => Builder; intersection: (schema: SchemaNode & { allOf: JSONSchemaAny[] }, refs: Context) => Builder; discriminatedUnion: (schema: SchemaNode & { oneOf: JSONSchemaAny[] }, refs: Context) => Builder; any: (_schema: SchemaNode | undefined, refs: Context) => Builder; unknown: (_schema: SchemaNode | undefined, refs: Context) => Builder; never: (_schema: SchemaNode | undefined, refs: Context) => Builder; default: (_schema: SchemaNode, refs: Context) => AnyBuilder; discriminator: undefined; schema: (schema: JSONSchemaAny<Version>, refs: Context, blockMeta?: boolean) => Builder; ref: (schema: JSONSchemaAny | undefined, refResolver: DefaultRefResolver, fromSchemaId: string, dependencyGraph?: DependencyGraph, depth: number) => ReferenceBuilder | null; Schema: (schema: JSONSchemaAny<Version>, refs: Context, blockMeta?: boolean) => Builder; Ref: (schema: JSONSchemaAny | undefined, refResolver: DefaultRefResolver, fromSchemaId: string, dependencyGraph?: DependencyGraph, depth: number) => ReferenceBuilder | null }
```

## `build`
The default Zod v4 builder API.

A collection of factory methods — `build.string()`, `build.object()`, etc. —
that emit `Builder` instances rather than real Zod schemas. Each method mirrors
its counterpart on the `z` namespace but returns a code-generating builder
instead. Import `build` from `x-to-zod/v3` or `x-to-zod/v4` to get a
version-constrained variant of the API.
```ts
const build: V4BuildAPI
```

## v3

### `buildV3`
Zod v3-compatible builder factory object.

Mirrors the `z` namespace from Zod v3 but returns code-generating `Builder`
instances rather than real Zod schemas. Use this when you need to target Zod
v3 consumers and want TypeScript to prevent accidentally calling v4-only
builder methods.

Prefer importing `build` from `'x-to-zod/v3'` for type-safe v3 usage.
```ts
const buildV3: V3BuildAPI
```

## v4

### `buildV4`
Full Zod v4 builder factory object.

Mirrors the `z` namespace from Zod v4 but returns code-generating `Builder`
instances rather than real Zod schemas. Includes all v4-specific methods
(`build.promise()`, `build.lazy()`, `build.pipe()`, etc.) in addition to the
core API shared with v3.

Prefer importing `build` from `'x-to-zod/v4'` for type-safe v4 usage.
```ts
const buildV4: V4BuildAPI
```

## presets

### `postProcessors`
A collection of reusable post-processor factory functions.

Each factory returns a `PostProcessor` — a function applied to every `Builder`
produced during schema conversion. Use these to apply cross-cutting
transformations such as making all objects strict, branding ID fields, or
making specific paths optional/required.
```ts
const postProcessors: { strictObjects: () => PostProcessor; nonemptyArrays: () => PostProcessor; brandIds: (brand: string) => PostProcessor; makeOptional: (pattern: string) => PostProcessor; makeRequired: (pattern: string) => PostProcessor; matchPath: (pattern: string, transform: PostProcessor) => PostProcessor }
```
