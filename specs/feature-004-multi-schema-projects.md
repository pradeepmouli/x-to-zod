# Feature 004: Multi-Schema Projects

## Overview

Add support for multi-schema projects that can convert multiple JSON Schema files into a coordinated TypeScript/JavaScript project with proper imports, exports, and cross-schema references. Uses ts-morph for project management and source file generation.

## Motivation

### Current Limitations

1. **Single file only**: Library only supports converting one JSON Schema at a time
2. **No $ref resolution**: External references must be pre-resolved using tools like `json-refs`
3. **No cross-schema references**: Can't reference types defined in other schemas
4. **Manual import management**: Users must manually handle imports between generated files
5. **No project structure**: No concept of organizing multiple schemas into a cohesive project

### Use Cases

1. **API Schema Collections**: Convert OpenAPI schemas with multiple component files
2. **Domain-Driven Design**: Separate schemas per domain/bounded context
3. **Shared Type Libraries**: Common types referenced across multiple schemas
4. **Modular Schema Architecture**: Split large schemas into maintainable modules
5. **Monorepo Support**: Generate Zod schemas for multiple packages
6. **Schema Evolution**: Track and manage changes across related schemas

## Design

### Architecture Overview

```
Multi-Schema Project
    ↓
Schema Registry
    ├─ Schema Index (file paths → schemas)
    ├─ Reference Graph (dependencies)
    └─ Name Resolution (schema IDs → export names)
    ↓
ts-morph Project
    ├─ Source Files (one per schema)
    ├─ Import Manager (auto-import resolution)
    └─ Type Checker (cross-file validation)
    ↓
Parser with Reference Context
    ├─ Local $refs → same file
    ├─ External $refs → imports from other files
    └─ Builder Registry (reusable builders)
    ↓
Post-Processing (optional)
    ├─ Cross-schema transformations
    └─ Project-wide validations
    ↓
Multi-File Output
    ├─ Individual .ts/.js files
    ├─ Index file (barrel exports)
    └─ Type declaration files (.d.ts)
```

### Core Components

#### 1. Schema Project

**Main API for multi-schema projects**:

```typescript
class SchemaProject {
  constructor(options: SchemaProjectOptions);

  /** Add schema from file */
  addSchemaFromFile(filePath: string, options?: SchemaFileOptions): Promise<SchemaEntry>;

  /** Add schema from object */
  addSchema(id: string, schema: JsonSchema, options?: SchemaOptions): SchemaEntry;

  /** Add multiple schemas */
  addSchemas(schemas: Record<string, JsonSchema>): SchemaEntry[];

  /** Build all schemas and generate output files */
  build(): Promise<BuildResult>;

  /** Get generated source file for schema */
  getSourceFile(schemaId: string): SourceFile | undefined;

  /** Get ts-morph project */
  getProject(): Project;

  /** Resolve reference across schemas */
  resolveRef(ref: string, fromSchema: string): RefResolution;

  /** Get dependency graph */
  getDependencyGraph(): DependencyGraph;

  /** Apply post-processors to all schemas */
  applyPostProcessors(processors: PostProcessorConfig[]): void;

  /** Validate project (check for circular refs, missing refs, etc.) */
  validate(): ValidationResult;

  /** Clear all schemas and reset */
  clear(): void;
}

interface SchemaProjectOptions {
  /** Output directory for generated files */
  outDir: string;

  /** Module format (esm, cjs, both) */
  moduleFormat?: 'esm' | 'cjs' | 'both';

  /** Zod version to target */
  zodVersion?: 'v3' | 'v4';

  /** Generate index file (barrel exports) */
  generateIndex?: boolean;

  /** Generate TypeScript declaration files */
  generateDeclarations?: boolean;

  /** ts-morph project options */
  tsconfig?: string | CompilerOptions;

  /** Name resolution strategy */
  nameResolver?: NameResolver;

  /** Reference resolution strategy */
  refResolver?: RefResolver;

  /** Post-processors to apply to all schemas */
  globalPostProcessors?: PostProcessorConfig[];

  /** Prettify output */
  prettier?: boolean | PrettierOptions;

  /** Custom import path transformer */
  importPathTransformer?: (from: string, to: string) => string;
}

interface SchemaEntry {
  /** Unique schema ID */
  id: string;

  /** Original JSON Schema */
  schema: JsonSchema;

  /** Root builder (after parsing) */
  builder: ZodBuilder | null;

  /** Generated source file */
  sourceFile: SourceFile | null;

  /** Export name for this schema */
  exportName: string;

  /** File path (relative to outDir) */
  filePath: string;

  /** Dependencies (other schema IDs) */
  dependencies: Set<string>;

  /** Schemas that depend on this one */
  dependents: Set<string>;

  /** Metadata */
  metadata: SchemaMetadata;
}

interface SchemaMetadata {
  /** Original file path (if loaded from file) */
  sourceFilePath?: string;

  /** Custom export name override */
  customExportName?: string;

  /** Tags for categorization */
  tags?: string[];

  /** Description */
  description?: string;

  /** Custom post-processors for this schema only */
  postProcessors?: PostProcessorConfig[];
}
```

#### 2. Reference Resolution

**$ref resolution across schemas**:

```typescript
interface RefResolver {
  /**
   * Resolve a JSON Schema $ref
   * @param ref - The $ref string (e.g., "#/definitions/User", "./user.json#/definitions/User")
   * @param fromSchema - The schema ID containing this reference
   * @returns Resolution with target schema and path
   */
  resolve(ref: string, fromSchema: string): RefResolution;

  /**
   * Register custom resolution strategy
   */
  registerResolver(pattern: string | RegExp, resolver: CustomRefResolver): void;
}

interface RefResolution {
  /** Target schema ID */
  schemaId: string;

  /** JSON pointer path within target schema (e.g., "/definitions/User") */
  path: string;

  /** Export name to import */
  exportName: string;

  /** Import path (file path for import statement) */
  importPath: string;

  /** Whether this is a local reference (same file) */
  isLocal: boolean;

  /** The resolved JSON Schema fragment */
  resolvedSchema: JsonSchema;

  /** The resolved builder (if already built) */
  resolvedBuilder?: ZodBuilder;
}

type CustomRefResolver = (ref: string, fromSchema: string) => RefResolution | null;

/** Built-in reference resolvers */
export const refResolvers = {
  /**
   * Standard JSON Schema $ref resolver
   * Supports:
   * - Local refs: "#/definitions/User"
   * - Relative file refs: "./user.json#/definitions/User"
   * - Absolute URL refs: "https://example.com/schemas/user.json"
   */
  standard: RefResolver,

  /**
   * OpenAPI-style resolver
   * Supports: "#/components/schemas/User"
   */
  openapi: RefResolver,

  /**
   * File-based resolver with custom base path
   */
  fileBased: (basePath: string) => RefResolver,

  /**
   * Composite resolver (try multiple strategies)
   */
  composite: (...resolvers: RefResolver[]) => RefResolver,
};
```

#### 3. Builder Registry

**Shared builder instances for cross-schema references**:

```typescript
class BuilderRegistry {
  /**
   * Register a builder for reuse
   * @param key - Unique key (e.g., "schemaId#/definitions/User")
   * @param builder - The builder instance
   */
  register(key: string, builder: ZodBuilder): void;

  /**
   * Get registered builder
   */
  get(key: string): ZodBuilder | undefined;

  /**
   * Check if builder is registered
   */
  has(key: string): boolean;

  /**
   * Create reference to registered builder
   * Generates code like: UserSchema (import from another file)
   */
  createReference(key: string, importInfo: ImportInfo): ZodBuilder;

  /**
   * Clear all registered builders
   */
  clear(): void;

  /**
   * Get all keys for a schema
   */
  getKeysForSchema(schemaId: string): string[];
}

interface ImportInfo {
  /** What to import (export name) */
  importName: string;

  /** Where to import from (file path) */
  importPath: string;

  /** Import type (named, default, namespace) */
  importKind: 'named' | 'default' | 'namespace';
}
```

#### 4. Name Resolution

**Convert schema IDs to valid export names**:

```typescript
interface NameResolver {
  /**
   * Resolve schema ID to export name
   * @param schemaId - Schema ID (file path, URL, or custom ID)
   * @param schema - The JSON Schema object
   * @returns Valid TypeScript identifier for export
   */
  resolve(schemaId: string, schema: JsonSchema): string;

  /**
   * Resolve definition name (e.g., "/definitions/User" → "User")
   */
  resolveDefinition(path: string, schema: JsonSchema): string;
}

/** Built-in name resolvers */
export const nameResolvers = {
  /**
   * Use schema.$id or title
   * Falls back to filename
   */
  schemaId: NameResolver,

  /**
   * Use filename (without extension)
   */
  filename: NameResolver,

  /**
   * Use custom naming function
   */
  custom: (fn: (id: string, schema: JsonSchema) => string) => NameResolver,

  /**
   * Composite: try multiple strategies
   */
  composite: (...resolvers: NameResolver[]) => NameResolver,
};
```

#### 5. Import Manager

**Automatic import statement generation using ts-morph**:

```typescript
class ImportManager {
  constructor(sourceFile: SourceFile);

  /**
   * Add import for external reference
   * Automatically manages import statements at top of file
   */
  addImport(importInfo: ImportInfo): void;

  /**
   * Get import statement for reference
   */
  getImportFor(exportName: string): ImportDeclaration | undefined;

  /**
   * Optimize imports (remove unused, combine)
   */
  optimize(): void;

  /**
   * Get all imports as code
   */
  getImportsCode(): string;
}
```

#### 6. Dependency Graph

**Track dependencies between schemas**:

```typescript
class DependencyGraph {
  /** Add edge (from schema depends on to schema) */
  addDependency(from: string, to: string): void;

  /** Get all dependencies of a schema */
  getDependencies(schemaId: string): Set<string>;

  /** Get all dependents of a schema (reverse dependencies) */
  getDependents(schemaId: string): Set<string>;

  /** Get topological order for building */
  getTopologicalOrder(): string[];

  /** Check for circular dependencies */
  hasCircularDependencies(): boolean;

  /** Get all circular dependency chains */
  getCircularDependencies(): string[][];

  /** Visualize graph (DOT format) */
  toDot(): string;
}
```

#### 7. ts-morph Integration

**Use ts-morph Project for source file management**:

```typescript
class SchemaSourceFileGenerator {
  constructor(project: Project, options: SchemaProjectOptions);

  /**
   * Generate source file for schema
   * @param entry - Schema entry
   * @param builder - Root builder
   * @returns Generated ts-morph SourceFile
   */
  generate(entry: SchemaEntry, builder: ZodBuilder): SourceFile;

  /**
   * Generate index file (barrel exports)
   * @param entries - All schema entries
   */
  generateIndex(entries: SchemaEntry[]): SourceFile;

  /**
   * Add import statement
   */
  addImport(sourceFile: SourceFile, importInfo: ImportInfo): ImportDeclaration;

  /**
   * Create export statement
   */
  createExport(sourceFile: SourceFile, name: string, value: string): VariableStatement;

  /**
   * Format source file
   */
  format(sourceFile: SourceFile): void;
}
```

### Integration with Existing Parser

#### Updated parseSchema for References

```typescript
function parseSchema(schema: JsonSchema, refs: Context): ZodBuilder {
  // [NEW] Handle $ref
  if (schema.$ref) {
    return parseRef(schema.$ref, refs);
  }

  // ... existing parser logic ...
}

function parseRef(ref: string, refs: Context): ZodBuilder {
  const resolution = refs.refResolver.resolve(ref, refs.currentSchemaId);

  // Local reference (same file)
  if (resolution.isLocal) {
    // Use existing circular reference handling
    const refKey = `${refs.currentSchemaId}${resolution.path}`;

    if (refs.seen.has(refKey)) {
      // Return lazy reference for circular ref
      return refs.build.lazy(() => refs.seen.get(refKey).r);
    }

    // Parse and cache
    const builder = parseSchema(resolution.resolvedSchema, {
      ...refs,
      path: resolution.path.split('/').slice(1), // Remove leading #
    });

    refs.seen.set(refKey, { n: 0, r: builder });
    return builder;
  }

  // External reference (different file)
  else {
    const refKey = `${resolution.schemaId}${resolution.path}`;

    // Check if already built in registry
    if (refs.builderRegistry.has(refKey)) {
      // Create import reference
      return refs.builderRegistry.createReference(refKey, {
        importName: resolution.exportName,
        importPath: resolution.importPath,
        importKind: 'named',
      });
    }

    // Dependency not yet built - will be resolved in topological order
    // For now, create placeholder that will be replaced
    return refs.build.lazy(() => {
      // This will be resolved after all schemas are built
      throw new Error(`Unresolved reference: ${ref}`);
    });
  }
}
```

#### Updated Context Type

```typescript
interface Context {
  // ... existing fields ...

  /** [NEW] Current schema ID */
  currentSchemaId: string;

  /** [NEW] Reference resolver */
  refResolver: RefResolver;

  /** [NEW] Builder registry for cross-schema references */
  builderRegistry: BuilderRegistry;

  /** [NEW] Import manager for current file */
  importManager?: ImportManager;
}
```

### Builder for External References

**New builder type for cross-file imports**:

```typescript
/**
 * Builder that references an externally defined schema
 * Generates import statement and uses imported name
 */
class ReferenceBuilder extends ZodBuilder {
  constructor(
    private importInfo: ImportInfo,
    private importManager: ImportManager
  ) {
    super();
  }

  base(): string {
    // Add import to file
    this.importManager.addImport(this.importInfo);

    // Return imported name
    return this.importInfo.importName;
  }
}
```

## Implementation Plan

### Phase 1: Core Infrastructure

**Goal**: Set up ts-morph integration and basic multi-schema support

1. **SchemaProject Class**
   - Basic constructor with options
   - `addSchema()` method
   - Schema registry (Map<string, SchemaEntry>)
   - ts-morph Project setup

2. **Name Resolution**
   - Implement basic name resolvers (filename, schemaId)
   - Export name generation
   - Conflict detection

3. **Source File Generation**
   - SchemaSourceFileGenerator class
   - Generate single source file from schema
   - Basic export statements

**Files to Create**:
- `src/MultiSchema/SchemaProject.ts`
- `src/MultiSchema/NameResolver.ts`
- `src/MultiSchema/SourceFileGenerator.ts`
- `src/MultiSchema/types.ts`

**Dependencies to Add**:
- `ts-morph` (source file manipulation)

### Phase 2: Reference Resolution

**Goal**: Support $ref resolution within and across schemas

1. **RefResolver Implementation**
   - Standard JSON Schema $ref parser
   - Local reference resolution (#/definitions/...)
   - External reference resolution (./file.json#/...)
   - URL-based references

2. **BuilderRegistry**
   - Register builders for reuse
   - Create reference builders
   - Import tracking

3. **ReferenceBuilder**
   - New builder type for external refs
   - Integration with ImportManager

4. **Update parseSchema()**
   - Add $ref handling
   - Integration with RefResolver
   - Circular reference handling across files

**Files to Create/Modify**:
- `src/MultiSchema/RefResolver.ts` (new)
- `src/MultiSchema/BuilderRegistry.ts` (new)
- `src/ZodBuilder/reference.ts` (new - ReferenceBuilder)
- `src/JsonSchema/parsers/parseSchema.ts` (modify)
- `src/JsonSchema/parsers/parseRef.ts` (new)

### Phase 3: Dependency Management

**Goal**: Build schemas in correct order, handle dependencies

1. **DependencyGraph**
   - Track schema dependencies
   - Topological sort
   - Circular dependency detection

2. **Multi-Pass Building**
   - First pass: parse all schemas, build dependency graph
   - Second pass: build schemas in topological order
   - Third pass: resolve external references

3. **Import Management**
   - ImportManager class using ts-morph
   - Auto-import generation
   - Import optimization

**Files to Create**:
- `src/MultiSchema/DependencyGraph.ts`
- `src/MultiSchema/ImportManager.ts`
- `src/MultiSchema/BuildOrchestrator.ts`

### Phase 4: File Output

**Goal**: Generate and write multiple source files

1. **SchemaProject.build()**
   - Orchestrate multi-schema build
   - Generate all source files
   - Generate index file

2. **Index File Generation**
   - Barrel exports
   - Re-export all schemas

3. **File Writing**
   - Write to disk with proper paths
   - Module format handling (ESM/CJS)
   - Declaration file generation

**Files to Modify**:
- `src/MultiSchema/SchemaProject.ts` (add build method)
- `src/MultiSchema/SourceFileGenerator.ts` (add index generation)

### Phase 5: Post-Processing Integration

**Goal**: Apply post-processors across multi-schema projects

1. **Cross-Schema Post-Processing**
   - Apply post-processors to all schemas
   - Access to full project context
   - Cross-schema transformations

2. **Project-Wide Validation**
   - Validate consistency across schemas
   - Check for naming conflicts
   - Verify all references resolve

**Files to Create**:
- `src/MultiSchema/ProjectPostProcessor.ts`
- `src/MultiSchema/ProjectValidator.ts`

### Phase 6: CLI & API Integration

**Goal**: Make multi-schema projects usable from CLI and programmatic API

1. **CLI Support**
   - New `--project` flag
   - Config file support (x-to-zod.config.js)
   - Watch mode for development

2. **API Expansion**
   - Export SchemaProject from main index
   - Convenience methods
   - Type definitions

**Files to Modify**:
- `src/cli.ts` (add project mode)
- `src/index.ts` (export multi-schema API)

### Phase 7: Documentation & Examples

1. **Documentation**
   - API reference
   - Usage guide
   - Migration from single-schema

2. **Examples**
   - OpenAPI multi-file project
   - Monorepo example
   - Shared types library

3. **Testing**
   - Unit tests for all components
   - Integration tests with real schemas
   - E2E tests for full projects

**Files to Create**:
- `docs/multi-schema-projects.md`
- `examples/multi-schema/`
- `test/MultiSchema/` (comprehensive test suite)

## Usage Examples

### Example 1: Basic Multi-Schema Project

```typescript
import { SchemaProject } from 'x-to-zod';

const project = new SchemaProject({
  outDir: './generated',
  moduleFormat: 'esm',
  generateIndex: true,
});

// Add schemas
project.addSchema('user', {
  $id: 'user',
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
  },
});

project.addSchema('post', {
  $id: 'post',
  type: 'object',
  properties: {
    id: { type: 'string' },
    title: { type: 'string' },
    author: { $ref: 'user' }, // Reference to user schema
  },
});

// Build project
await project.build();

// Generates:
// - generated/user.ts: export const UserSchema = z.object({...})
// - generated/post.ts:
//     import { UserSchema } from './user';
//     export const PostSchema = z.object({
//       id: z.string(),
//       title: z.string(),
//       author: UserSchema
//     })
// - generated/index.ts:
//     export { UserSchema } from './user';
//     export { PostSchema } from './post';
```

### Example 2: File-Based Project

```typescript
const project = new SchemaProject({
  outDir: './zod-schemas',
  zodVersion: 'v4',
});

// Add schemas from files
await project.addSchemaFromFile('./schemas/user.json');
await project.addSchemaFromFile('./schemas/post.json');
await project.addSchemaFromFile('./schemas/comment.json');

// Build all
await project.build();
```

### Example 3: OpenAPI Components

```typescript
import { SchemaProject, refResolvers } from 'x-to-zod';

const project = new SchemaProject({
  outDir: './api-schemas',
  refResolver: refResolvers.openapi,
  nameResolver: nameResolvers.schemaId,
});

// OpenAPI schema with components
const openapiSchema = {
  components: {
    schemas: {
      User: { type: 'object', properties: { /*...*/ } },
      Post: {
        type: 'object',
        properties: {
          author: { $ref: '#/components/schemas/User' }
        }
      },
    },
  },
};

// Add all component schemas
for (const [name, schema] of Object.entries(openapiSchema.components.schemas)) {
  project.addSchema(name, schema);
}

await project.build();
```

### Example 4: With Post-Processing

```typescript
const project = new SchemaProject({
  outDir: './schemas',
  globalPostProcessors: [
    // Make all objects strict
    {
      type: 'visitor',
      filter: (b) => b instanceof ObjectBuilder,
      visit: (b) => b.strict(),
    },
    // Brand all ID fields
    {
      type: 'path',
      pattern: '$..id',
      transform: (b) => b instanceof StringBuilder ? b.brand('ID') : b,
    },
  ],
});

await project.addSchemaFromFile('./user.json');
await project.addSchemaFromFile('./post.json');
await project.build();
```

### Example 5: Programmatic Schema Building with References

```typescript
const project = new SchemaProject({ outDir: './out' });

// Define shared types
project.addSchema('common/types', {
  definitions: {
    ID: { type: 'string', format: 'uuid' },
    Timestamp: { type: 'string', format: 'date-time' },
  },
});

// Use shared types
project.addSchema('domain/user', {
  type: 'object',
  properties: {
    id: { $ref: 'common/types#/definitions/ID' },
    createdAt: { $ref: 'common/types#/definitions/Timestamp' },
    name: { type: 'string' },
  },
});

await project.build();

// Generated output:
// common/types.ts:
//   export const IDSchema = z.string().uuid();
//   export const TimestampSchema = z.string().datetime();
//
// domain/user.ts:
//   import { IDSchema, TimestampSchema } from '../common/types';
//   export const UserSchema = z.object({
//     id: IDSchema,
//     createdAt: TimestampSchema,
//     name: z.string(),
//   });
```

### Example 6: Validation & Dependency Graph

```typescript
const project = new SchemaProject({ outDir: './schemas' });

await project.addSchemaFromFile('./user.json');
await project.addSchemaFromFile('./post.json');
await project.addSchemaFromFile('./comment.json');

// Validate before building
const validation = project.validate();
if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
  process.exit(1);
}

// Inspect dependency graph
const graph = project.getDependencyGraph();
console.log('Build order:', graph.getTopologicalOrder());

// Check for circular dependencies
if (graph.hasCircularDependencies()) {
  console.warn('Circular dependencies:', graph.getCircularDependencies());
}

// Visualize
console.log(graph.toDot()); // DOT format for Graphviz

await project.build();
```

### Example 7: Custom Reference Resolver

```typescript
const project = new SchemaProject({
  outDir: './schemas',
  refResolver: refResolvers.composite(
    // Try standard JSON Schema refs first
    refResolvers.standard,

    // Custom resolver for special refs
    {
      resolve(ref, fromSchema) {
        if (ref.startsWith('custom://')) {
          const schemaId = ref.replace('custom://', '');
          return {
            schemaId,
            path: '',
            exportName: `${schemaId}Schema`,
            importPath: `./${schemaId}`,
            isLocal: false,
            resolvedSchema: /* fetch schema */,
          };
        }
        return null; // Not handled by this resolver
      },
    }
  ),
});
```

### Example 8: Monorepo / Multi-Package

```typescript
// Generate schemas for multiple packages
const packages = ['users', 'posts', 'comments'];

for (const pkg of packages) {
  const project = new SchemaProject({
    outDir: `./packages/${pkg}/src/schemas`,
    generateIndex: true,
  });

  // Add schemas for this package
  const schemaFiles = await glob(`./schemas/${pkg}/*.json`);
  for (const file of schemaFiles) {
    await project.addSchemaFromFile(file);
  }

  await project.build();
}
```

### Example 9: Config File

```javascript
// x-to-zod.config.js
module.exports = {
  projects: {
    api: {
      outDir: './src/api/schemas',
      schemas: './api-schemas/**/*.json',
      moduleFormat: 'esm',
      zodVersion: 'v4',
      postProcessors: [
        require('./processors/strict-objects'),
        require('./processors/brand-ids'),
      ],
    },
    models: {
      outDir: './src/models/schemas',
      schemas: './model-schemas/**/*.json',
      generateIndex: true,
    },
  },
};
```

```bash
# CLI usage with config
x-to-zod --config x-to-zod.config.js --project api
```

## API Reference

### SchemaProject

```typescript
class SchemaProject {
  constructor(options: SchemaProjectOptions);

  // Schema management
  addSchema(id: string, schema: JsonSchema, options?: SchemaOptions): SchemaEntry;
  addSchemaFromFile(filePath: string, options?: SchemaFileOptions): Promise<SchemaEntry>;
  addSchemas(schemas: Record<string, JsonSchema>): SchemaEntry[];
  removeSchema(id: string): boolean;
  getSchema(id: string): SchemaEntry | undefined;
  getAllSchemas(): SchemaEntry[];

  // Building
  build(): Promise<BuildResult>;
  buildSchema(id: string): Promise<BuildSchemaResult>;
  rebuild(): Promise<BuildResult>;

  // Project access
  getProject(): Project;
  getSourceFile(schemaId: string): SourceFile | undefined;
  getAllSourceFiles(): SourceFile[];

  // References
  resolveRef(ref: string, fromSchema: string): RefResolution;
  getBuilderRegistry(): BuilderRegistry;

  // Dependencies
  getDependencyGraph(): DependencyGraph;
  getBuildOrder(): string[];

  // Post-processing
  applyPostProcessors(processors: PostProcessorConfig[]): void;
  applyPostProcessorToSchema(schemaId: string, processor: PostProcessorConfig): void;

  // Validation
  validate(): ValidationResult;
  validateSchema(id: string): SchemaValidationResult;

  // Utilities
  clear(): void;
  dispose(): void;
}

interface BuildResult {
  success: boolean;
  schemas: BuildSchemaResult[];
  errors: BuildError[];
  warnings: BuildWarning[];
  generatedFiles: string[];
}

interface BuildSchemaResult {
  schemaId: string;
  success: boolean;
  filePath: string;
  code: string;
  errors: BuildError[];
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}
```

### CLI Support

```bash
# Single schema (existing)
x-to-zod schema.json > schema.ts

# Multi-schema project (new)
x-to-zod --project --schemas "./schemas/*.json" --out ./generated

# With config file
x-to-zod --config x-to-zod.config.js

# Watch mode
x-to-zod --project --watch --schemas "./schemas/*.json" --out ./generated
```

## Breaking Changes

None - this is a new feature that doesn't affect existing single-schema API.

## Migration Guide

Existing single-schema usage is unchanged:

```typescript
// Old way (still works)
import { jsonSchemaToZod } from 'x-to-zod';
const result = jsonSchemaToZod(schema);

// New way (for multi-schema projects)
import { SchemaProject } from 'x-to-zod';
const project = new SchemaProject({ outDir: './out' });
project.addSchema('mySchema', schema);
await project.build();
```

## Testing Strategy

1. **Unit Tests**:
   - RefResolver (all reference types)
   - NameResolver (conflict resolution)
   - DependencyGraph (topological sort, cycles)
   - BuilderRegistry (register, retrieve, reference)
   - ImportManager (import generation, optimization)

2. **Integration Tests**:
   - Multi-schema projects with references
   - Circular reference handling
   - Cross-file imports
   - Index file generation

3. **E2E Tests**:
   - Real-world OpenAPI schemas
   - Complex dependency graphs
   - Monorepo scenarios

## Performance Considerations

1. **Incremental Building**: Only rebuild changed schemas
2. **Parallel Processing**: Build independent schemas in parallel
3. **Lazy Loading**: Load schemas on-demand
4. **Caching**: Cache parsed builders for reuse
5. **Streaming**: Stream large schemas instead of loading entirely

## Open Questions

1. **TypeScript version compatibility**: What's the minimum ts-morph/TypeScript version?
2. **$ref URL fetching**: Should we fetch remote schema URLs? Security implications?
3. **Conflict resolution**: What to do when two schemas export the same name?
4. **Circular references**: How to handle circular refs across files? (Lazy builders? Type-only imports?)
5. **Watch mode**: Should we use ts-morph's watch capabilities or implement our own?
6. **Declaration files**: Generate .d.ts even when outputting JavaScript?

## Dependencies

**New dependencies**:
- `ts-morph`: ^21.0.0 - TypeScript source file manipulation
- `@typescript/vfs`: (if needed for in-memory compilation)

**Optional dependencies**:
- `prettier`: For code formatting
- `graphology`: For advanced dependency graph operations

## Success Criteria

- [ ] Can convert multi-schema projects with cross-references
- [ ] Generates correct TypeScript imports/exports
- [ ] Handles circular dependencies gracefully
- [ ] CLI supports project mode
- [ ] Config file support
- [ ] Works with OpenAPI/Swagger schemas
- [ ] ts-morph integration for source file management
- [ ] Index file generation (barrel exports)
- [ ] Dependency graph visualization
- [ ] 95%+ test coverage
- [ ] Documentation with real-world examples
- [ ] Performance: handle 100+ schema project in <10s

## Future Enhancements

1. **Watch mode**: Rebuild on file changes
2. **Incremental builds**: Only rebuild changed schemas
3. **Bundle optimization**: Tree-shake unused schemas
4. **Type-only imports**: Use TypeScript type imports for circular refs
5. **Custom templates**: User-defined file templates
6. **Plugin system**: Extensible processing pipeline
7. **Schema validation**: Validate JSON Schemas before conversion
8. **Migration tools**: Convert between schema versions
