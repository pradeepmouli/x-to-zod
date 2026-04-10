# Types & Enums

## `JSONSchema`
```ts
JSONSchemaMap<T, V>[Version]
```

## `SchemaVersion`
```ts
"2020-12" | "2019-09" | "07" | "OpenAPI3.0" | "OpenAPI3.1"
```

## `TypeValue`
```ts
"object" | "array" | "string" | "number" | "integer" | "boolean" | "null" | "any"
```

## `transformer`
```ts
(schema: JSONSchema<Version, T, V>, refs: any) => JSONSchema<Version, T, TypeValue> | undefined
```

## `TypeKind`
```ts
{ [T in keyof typeof buildV4 as typeof buildV4[T] extends (args: unknown[]) => unknown ? T : never]: ReturnType<Extract<typeof buildV4[T], (args: unknown[]) => unknown>> }
```

## `TypeKindOf`
```ts
TypeKind[T]
```

## types

### `SchemaProjectOptions`
Multi-Schema Project Configuration Options
**Properties:**
- `outDir: string`
- `moduleFormat: "cjs" | "esm" | "both"` (optional)
- `zodVersion: "v3" | "v4"` (optional)
- `generateIndex: boolean` (optional)
- `generateDeclarations: boolean` (optional)
- `tsconfig: string | CompilerOptions` (optional)
- `nameResolver: NameResolver` (optional)
- `refResolver: RefResolver` (optional)
- `globalPostProcessors: ProjectPostProcessorConfig[]` (optional)
- `prettier: boolean | PrettierOptions` (optional)
- `importPathTransformer: (from: string, to: string) => string` (optional)
- `extractDefinitions: boolean | ExtractDefinitionsOptions` (optional)

### `ExtractDefinitionsOptions`
Options for extracting definitions into separate files
**Properties:**
- `enabled: boolean`
- `subdir: string` (optional)
- `namePattern: (schemaId: string, defName: string) => string` (optional)

### `SchemaOptions`
Options for individual schema when added to project
**Properties:**
- `postProcessors: ProjectPostProcessorConfig[]` (optional)
- `moduleFormatOverride: "cjs" | "esm" | "both"` (optional)
- `extractDefinitions: boolean` (optional)

### `SchemaFileOptions`
Options for adding schema from file
**Properties:**
- `id: string` (optional)
- `encoding: BufferEncoding` (optional)
- `postProcessors: ProjectPostProcessorConfig[]` (optional)
- `moduleFormatOverride: "cjs" | "esm" | "both"` (optional)
- `extractDefinitions: boolean` (optional)

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
- `moduleFormatOverride: "cjs" | "esm" | "both"` (optional)
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

### `ProjectPostProcessorConfig`
Configuration for post-processor application
**Properties:**
- `name: string`
- `options: Record<string, any>` (optional)

### `PrettierOptions`
Prettier configuration options
**Properties:**
- `semi: boolean` (optional)
- `singleQuote: boolean` (optional)
- `trailingComma: "none" | "es5" | "all"` (optional)
- `printWidth: number` (optional)
- `tabWidth: number` (optional)
- `useTabs: boolean` (optional)

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
