# Data Model (Phase 1)

## Entities

### SchemaProject
- Fields: options (outDir, moduleFormat, zodVersion, generateIndex, generateDeclarations, tsconfig, nameResolver, refResolver, globalPostProcessors, prettier, importPathTransformer), registry (schemaId → SchemaEntry), project (ts-morph Project), dependencyGraph
- Relationships: manages multiple SchemaEntry instances; owns DependencyGraph; uses NameResolver, RefResolver, ImportManager

### SchemaEntry
- Fields: id, schema (JsonSchema), builder (ZodBuilder | null), sourceFile (ts-morph SourceFile | null), exportName, metadata (originalFilePath, postProcessors, moduleFormat override)
- Relationships: belongs to SchemaProject; edges in DependencyGraph

### RefResolution
- Fields: targetSchemaId, definitionPath, isExternal, resolvedBuilder (optional), importInfo (if external)
- Relationships: produced by RefResolver; consumed by parseRef/ReferenceBuilder

### DependencyGraph
- Fields: nodes (schemaIds), edges (from → to), cycles (detected strongly connected components)
- Relationships: constructed from SchemaEntry refs; guides build order; informs ImportManager

### ImportInfo
- Fields: importName, importKind (named/default/namespace), modulePath, isTypeOnly
- Relationships: produced by BuilderRegistry/RefResolver; consumed by ImportManager to emit statements

### NameResolver
- Fields: strategies (filename, schemaId, custom), conflict detection
- Relationships: used by SchemaProject to assign export names and by DependencyGraph for reporting

### ReferenceBuilder
- Fields: targetImport (ImportInfo), targetExportName, lazy (for cycles), isTypeOnly
- Relationships: generated during parseRef for external refs; reused via BuilderRegistry

## Relationships Overview
- SchemaProject aggregates SchemaEntries and orchestrates parsing/build with DependencyGraph
- DependencyGraph edges drive ImportManager and build order; cycles toggle lazy builders
- RefResolver + NameResolver feed ReferenceBuilder and import generation
- BuilderRegistry caches builders per schema/export to avoid duplication across files
