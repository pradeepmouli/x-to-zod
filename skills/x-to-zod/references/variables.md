# Variables & Constants

## `parse`
```ts
const parse: { array: (schema: SchemaNode & { type?: string }, refs: Context) => Builder; object: (schema: SchemaNode & { type?: string }, refs: Context) => Builder; boolean: (schema: SchemaNode & { type?: string }, refs: Context) => Builder; string: (schema: SchemaNode & { type?: string }, refs: Context) => Builder; number: (schema: SchemaNode & { type?: string }, refs: Context) => Builder; null: (schema: SchemaNode & { type?: string }, refs: Context) => Builder; anyOf: (schema: SchemaNode & { anyOf: JSONSchemaAny[] }, refs: Context) => Builder; allOf: (schema: SchemaNode & { allOf: JSONSchemaAny[] }, refs: Context) => Builder; oneOf: (schema: SchemaNode & { oneOf: JSONSchemaAny[] }, refs: Context) => Builder; enum: (schema: SchemaNode & { enum: unknown[] }, refs: Context) => Builder; const: (schema: SchemaNode & { const: unknown }, refs: Context) => Builder; tuple: (schema: SchemaNode, refs: Context) => Builder; record: (schema: SchemaNode, refs: Context) => Builder; union: (schema: SchemaNode & { anyOf: JSONSchemaAny[] }, refs: Context) => Builder; intersection: (schema: SchemaNode & { allOf: JSONSchemaAny[] }, refs: Context) => Builder; discriminatedUnion: (schema: SchemaNode & { oneOf: JSONSchemaAny[] }, refs: Context) => Builder; any: (_schema: SchemaNode | undefined, refs: Context) => Builder; unknown: (_schema: SchemaNode | undefined, refs: Context) => Builder; never: (_schema: SchemaNode | undefined, refs: Context) => Builder; default: (_schema: SchemaNode, refs: Context) => AnyBuilder; discriminator: undefined; schema: (schema: JSONSchemaAny<Version>, refs: Context, blockMeta?: boolean) => Builder; ref: (schema: JSONSchemaAny | undefined, refResolver: DefaultRefResolver, fromSchemaId: string, dependencyGraph?: DependencyGraph, depth: number) => ReferenceBuilder | null; Schema: (schema: JSONSchemaAny<Version>, refs: Context, blockMeta?: boolean) => Builder; Ref: (schema: JSONSchemaAny | undefined, refResolver: DefaultRefResolver, fromSchemaId: string, dependencyGraph?: DependencyGraph, depth: number) => ReferenceBuilder | null }
```

## `build`
```ts
const build: V4BuildAPI
```

## v3

### `buildV3`
```ts
const buildV3: V3BuildAPI
```

## v4

### `buildV4`
```ts
const buildV4: V4BuildAPI
```

## presets

### `postProcessors`
```ts
const postProcessors: { strictObjects: () => PostProcessor; nonemptyArrays: () => PostProcessor; brandIds: (brand: string) => PostProcessor; makeOptional: (pattern: string) => PostProcessor; makeRequired: (pattern: string) => PostProcessor; matchPath: (pattern: string, transform: PostProcessor) => PostProcessor }
```
