# Classes

## `SchemaProject`
SchemaProject: Main API for multi-schema projects.
Manages schema registration, validation, dependency analysis, and code generation.
```ts
constructor(options: SchemaProjectOptions): SchemaProject
```
**Methods:**
- `addSchema(id: string, schema: JSONSchemaAny, options?: SchemaOptions): void` — Add a schema to the project.
- `addSchemaFromFile(filePath: string, id?: string, options?: SchemaFileOptions): void` — Add a schema from a file.
- `validate(): ValidationResult` — Validate the project configuration and schema relationships.
- `build(): Promise<BuildResult>` — Build the project: parse schemas, apply post-processors, generate code.
- `getDependencyGraph(): DependencyGraphBuilder` — Get the dependency graph for schemas.
- `resolveRef(ref: string, fromSchemaId: string): RefResolution | null` — Resolve a $ref using the configured resolver.
- `getRegistry(): SchemaRegistry` — Get schema registry for direct access.
- `getBuilderRegistry(): BuilderRegistry` — Get builder registry for direct access.
