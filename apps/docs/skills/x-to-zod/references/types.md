# Types & Enums

## `JSONSchema`
Versioned JSON Schema type that resolves to the correct draft or OpenAPI schema
definition based on `Version`.
```ts
JSONSchemaMap<T, V>[Version]
```

## `SchemaVersion`
Supported JSON Schema dialect versions and OpenAPI specification versions.

Pass this as the `S` type parameter to `JSONSchema<S>` to narrow the schema
type to the keywords supported by that dialect.
```ts
"2020-12" | "2019-09" | "07" | "OpenAPI3.0" | "OpenAPI3.1"
```

## `TypeValue`
The set of JSON Schema primitive type names recognised by `x-to-zod`.

These correspond to the values allowed in the JSON Schema `"type"` keyword.
Use as the `V` type parameter on `JSONSchema<S, T, V>` to constrain which
primitive the schema represents.
```ts
"object" | "array" | "string" | "number" | "integer" | "boolean" | "null" | "any"
```

## `transformer`
A function that transforms or augments a JSON Schema node before it is
handed to a parser.

Transformers receive the schema and a `refs` bag (containing resolved
`$ref` look-ups) and may return a modified copy of the schema or
`undefined` to leave it unchanged.
```ts
(schema: JSONSchema<Version, T, V>, refs: any) => JSONSchema<Version, T, TypeValue> | undefined
```

## `TypeKind`
Mapped type from builder-factory key to the `Builder` instance it produces.

`TypeKind['string']` resolves to the `Builder` returned by `build.string()`,
`TypeKind['object']` to the one returned by `build.object()`, and so on.
Use this as a discriminated registry for type-narrowing inside parsers.
```ts
{ [T in keyof typeof buildV4 as typeof buildV4[T] extends (args: unknown[]) => unknown ? T : never]: ReturnType<Extract<typeof buildV4[T], (args: unknown[]) => unknown>> }
```

## `TypeKindOf`
Extracts the concrete `Builder` type for a given `TypeKind` key.

Equivalent to `TypeKind[T]` with the key constrained to the known set of
builder-factory names. Use in generic parser helpers where you need to
reference the builder produced by a specific factory:
```ts
TypeKind[T]
```

## types

### `SchemaEntry`
Single schema entry in the registry
**Properties:**
- `id: string`
- `schema: Record<string, any>`
- `builder: Builder<ZodType<unknown, unknown, $ZodTypeInternals<unknown, unknown>>, "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function" | "array" | "null" | "any" | "default" | "enum" | "map" | "nullable" | "int" | "void" | "never" | "unknown" | "date" | "record" | "file" | "tuple" | "union" | "intersection" | "set" | "literal" | "optional" | "nonoptional" | "success" | "transform" | "prefault" | "catch" | "nan" | "pipe" | "readonly" | "template_literal" | "promise" | "lazy" | "custom"> | null`
- `sourceFile: SourceFile | null`
- `exportName: string`
- `metadata: ProjectSchemaMetadata`

### `ProjectSchemaMetadata`
Metadata associated with a schema
**Properties:**
- `originalFilePath: string` (optional)
- `postProcessors: ProjectPostProcessorConfig[]` (optional)
- `moduleFormatOverride: "esm" | "cjs" | "both"` (optional)
- `isExternal: boolean` (optional)
- `importedFrom: string` (optional)

### `RefResolution`
Result of resolving a $ref
**Properties:**
- `targetSchemaId: string`
- `definitionPath: string[]`
- `isExternal: boolean`
- `resolvedBuilder: Builder<ZodType<unknown, unknown, $ZodTypeInternals<unknown, unknown>>, "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function" | "array" | "null" | "any" | "default" | "enum" | "map" | "nullable" | "int" | "void" | "never" | "unknown" | "date" | "record" | "file" | "tuple" | "union" | "intersection" | "set" | "literal" | "optional" | "nonoptional" | "success" | "transform" | "prefault" | "catch" | "nan" | "pipe" | "readonly" | "template_literal" | "promise" | "lazy" | "custom">` (optional)
- `importInfo: ImportInfo` (optional)

### `ImportInfo`
Information needed to import an external schema reference
**Properties:**
- `importName: string`
- `importKind: "default" | "named" | "namespace"`
- `modulePath: string`
- `isTypeOnly: boolean` (optional)

### `DependencyGraph`
Dependency Graph for schema resolution and build ordering
**Properties:**
- `nodes: Set<string>`
- `edges: Map<string, Set<string>>`
- `cycles: Set<Set<string>>`

### `BuildResult`
Result of a build operation
**Properties:**
- `success: boolean`
- `errors: BuildError[]`
- `warnings: BuildWarning[]`
- `generatedFiles: string[]`

### `BuildError`
Build-time error
**Properties:**
- `code: string`
- `message: string`
- `schemaId: string` (optional)
- `details: Record<string, any>` (optional)

### `BuildWarning`
Build-time warning
**Properties:**
- `code: string`
- `message: string`
- `schemaId: string` (optional)
- `details: Record<string, any>` (optional)

### `ValidationResult`
Validation result for schema project
**Properties:**
- `valid: boolean`
- `errors: ValidationError[]`
- `warnings: ValidationWarning[]`

### `ValidationError`
Validation error
**Properties:**
- `code: "EXPORT_CONFLICT" | "INVALID_SCHEMA" | "UNRESOLVED_REF" | "TSMORPH_ERROR" | "IO_ERROR"`
- `message: string`
- `schemaId: string` (optional)
- `details: Record<string, any>` (optional)

### `ValidationWarning`
Validation warning
**Properties:**
- `code: "MISSING_REF" | "CIRCULAR_REF" | "POSTPROCESSOR_ISSUE"`
- `message: string`
- `schemaId: string` (optional)
- `details: Record<string, any>` (optional)

### `NameResolver`
Contract for schema name resolution strategy

### `RefResolver`
Contract for reference resolution

## v3

### `V3BuildAPI`
Explicit type for the complete Zod v3 builder factory.

## v4

### `V4BuildAPI`
Explicit type for the complete Zod v4 builder factory.
