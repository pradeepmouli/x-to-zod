# Roadmap: Post-Processing API & Multi-Schema Projects

## Overview

This document provides a high-level overview of two major enhancements to x-to-zod that work together to enable advanced schema transformation and multi-file project generation.

## Features

### 1. Enhancement 003: Post-Processing API

**Location**: `./enhancement-003-post-processing-api.md`

**Summary**: Adds the ability to manipulate ZodBuilder trees before code generation using path-based traversal and transformation APIs.

**Key Capabilities**:
- **Path-based queries**: JSONPath-inspired syntax to target specific builders (e.g., `$.properties.*.email`)
- **Tree traversal**: Visitor pattern and walker API for navigating builder trees
- **Builder transformation**: Modify builders globally or conditionally
- **Parser interception**: Hook into parsers before builder tree assembly

**Use Cases**:
- Apply global constraints (e.g., make all objects strict)
- Add branding to specific field types
- Optimize builder trees (flatten unions, merge intersections)
- Generate metrics and validate schema patterns
- Inject custom code at specific paths

**Example**:
```typescript
const result = jsonSchemaToZod(schema, {
  postProcessors: [
    // Make all email fields lowercase
    {
      type: 'path',
      pattern: '$..email',
      transform: (builder) => builder.toLowerCase()
    },
    // Make all objects strict
    (builder) => builder instanceof ObjectBuilder ? builder.strict() : builder
  ]
});
```

---

### 2. Feature 004: Multi-Schema Projects

**Location**: `./feature-004-multi-schema-projects.md`

**Summary**: Enables conversion of multiple JSON Schema files into a coordinated TypeScript project with proper imports, exports, and cross-schema references.

**Key Capabilities**:
- **Multi-file output**: Generate separate source files for each schema
- **Reference resolution**: Resolve $ref across schemas (local and external)
- **Import management**: Automatic import/export generation using ts-morph
- **Dependency tracking**: Build schemas in correct topological order
- **Project organization**: Index files, barrel exports, module structure

**Use Cases**:
- Convert OpenAPI/Swagger with multiple component files
- Domain-driven design with separate schemas per domain
- Shared type libraries referenced across projects
- Monorepo with multiple packages
- Modular schema architecture

**Example**:
```typescript
import { SchemaProject } from 'x-to-zod';

const project = new SchemaProject({
  outDir: './generated',
  moduleFormat: 'esm',
});

// Add schemas with cross-references
project.addSchema('user', {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
  }
});

project.addSchema('post', {
  type: 'object',
  properties: {
    id: { type: 'string' },
    author: { $ref: 'user' } // Cross-schema reference
  }
});

await project.build();

// Generated files:
// - user.ts: export const UserSchema = z.object({...})
// - post.ts: import { UserSchema } from './user'; export const PostSchema = ...
// - index.ts: barrel exports
```

---

## How They Work Together

These two features are designed to complement each other:

### Combined Use Case 1: Project-Wide Transformations

Apply post-processing transformations across an entire multi-schema project:

```typescript
const project = new SchemaProject({
  outDir: './schemas',

  // Apply post-processors to ALL schemas in the project
  globalPostProcessors: [
    // Brand all ID fields across all schemas
    {
      type: 'path',
      pattern: '$..id',
      transform: (b) => b instanceof StringBuilder ? b.brand('ID').uuid() : b
    },

    // Make all objects strict
    {
      type: 'visitor',
      filter: (b) => b instanceof ObjectBuilder,
      visit: (b) => b.strict()
    }
  ]
});

await project.addSchemaFromFile('./user.json');
await project.addSchemaFromFile('./post.json');
await project.addSchemaFromFile('./comment.json');

await project.build();

// All schemas will have:
// - Strict objects
// - Branded UUID IDs
```

### Combined Use Case 2: Schema-Specific Post-Processing

Apply different post-processors to different schemas:

```typescript
const project = new SchemaProject({ outDir: './out' });

// User schema - strict validation
project.addSchema('user', userSchema, {
  postProcessors: [
    makeAllRequired,
    strictObjects,
    brandAllIds
  ]
});

// Draft schema - lenient validation
project.addSchema('userDraft', userDraftSchema, {
  postProcessors: [
    makeAllOptional,
    looseObjects
  ]
});

await project.build();
```

### Combined Use Case 3: Cross-Schema Analysis

Use post-processing to analyze and validate across multiple schemas:

```typescript
const project = new SchemaProject({ outDir: './out' });

await project.addSchemaFromFile('./user.json');
await project.addSchemaFromFile('./post.json');

// Apply cross-schema validation
project.applyPostProcessors([
  (builder, ctx) => {
    const walker = new BuilderTreeWalker(builder);

    // Find all external references
    const refs = walker.filter(b => b instanceof ReferenceBuilder);

    // Validate all references resolve
    for (const ref of refs) {
      if (!project.resolveRef(ref.importInfo.importPath, ctx.schemaId)) {
        throw new Error(`Unresolved reference: ${ref.importInfo.importPath}`);
      }
    }

    return builder;
  }
]);

await project.build();
```

### Combined Use Case 4: Builder Manipulation Before Cross-Schema Assembly

Intercept parsers to modify builders before they're used as cross-schema references:

```typescript
const project = new SchemaProject({
  outDir: './out',

  globalPostProcessors: [
    // Intercept at parse time
    {
      type: 'interceptor',
      parser: 'parseObject',
      intercept: (builder, schema, refs) => {
        // Automatically extend all objects with metadata
        return builder.extend(refs.build.object({
          _schema: refs.build.literal(refs.currentSchemaId),
          _version: refs.build.literal('1.0.0')
        }));
      }
    }
  ]
});

// All schemas will have metadata fields added automatically
```

---

## Implementation Sequence

These features can be implemented in sequence or in parallel:

### Option A: Sequential Implementation

**Phase 1: Post-Processing API** (8-10 weeks)
- Implement tree traversal and path syntax
- Build post-processor pipeline
- Parser interception
- Testing and documentation

**Phase 2: Multi-Schema Projects** (10-12 weeks)
- ts-morph integration
- Reference resolution
- Multi-file output
- Leverage post-processing for cross-schema operations

**Benefits**:
- Post-processing is foundational for multi-schema
- Can be used independently before multi-schema is ready
- Easier to test and validate each feature

### Option B: Parallel Implementation

**Team 1: Post-Processing** (8-10 weeks)
- Focus on single-schema use cases first
- Build extensible API for future multi-schema integration

**Team 2: Multi-Schema Foundation** (6-8 weeks)
- ts-morph integration
- Basic reference resolution
- Simple multi-file output (no post-processing)

**Phase 3: Integration** (2-4 weeks)
- Combine both features
- Cross-schema post-processing
- Comprehensive testing

**Benefits**:
- Faster overall delivery
- Both features available sooner
- Can prioritize based on user demand

---

## Architecture Integration

### Current Architecture

```
JSON Schema
    ↓
parseSchema() → ZodBuilder Tree
    ↓
builder.text() → Code String
    ↓
Module Wrapper → Output
```

### Post-Processing Enhancement

```
JSON Schema
    ↓
parseSchema() → ZodBuilder Tree
    ↓
[NEW] Post-Processors Pipeline
    ├─ Tree Traversal
    ├─ Builder Transformation
    └─ Modified ZodBuilder Tree
    ↓
builder.text() → Code String
    ↓
Module Wrapper → Output
```

### Multi-Schema Projects

```
Multiple JSON Schemas
    ↓
Schema Registry + Dependency Graph
    ↓
ts-morph Project
    ↓
For Each Schema (Topological Order):
    parseSchema() → ZodBuilder Tree
    ├─ Local refs → same file
    ├─ External refs → ReferenceBuilder (imports)
    └─ Builder Registry (cache)
    ↓
Source File Generator
    ├─ Import Manager
    ├─ Export Statements
    └─ ts-morph SourceFile
    ↓
Write to Disk
    ├─ schema1.ts
    ├─ schema2.ts
    └─ index.ts
```

### Combined Architecture

```
Multiple JSON Schemas
    ↓
Schema Registry + Dependency Graph
    ↓
ts-morph Project
    ↓
For Each Schema (Topological Order):
    parseSchema() → ZodBuilder Tree
        ├─ [NEW] Parser Interceptors
        ├─ Local/External Refs
        └─ Builder Registry
    ↓
    [NEW] Post-Processors (schema-specific)
        ├─ Tree Traversal
        └─ Builder Transformation
    ↓
    Modified ZodBuilder Tree
    ↓
[NEW] Global Post-Processors (cross-schema)
    ↓
Source File Generator
    ├─ Import Manager
    ├─ Export Statements
    └─ ts-morph SourceFile
    ↓
Index File Generator
    ↓
Write to Disk
```

---

## Dependencies

### Shared Dependencies
- Existing builder architecture
- Parser infrastructure
- Type system

### Post-Processing Specific
- Path parser (JSONPath-like)
- Tree walker/visitor utilities
- Builder cloning (for immutability)

### Multi-Schema Specific
- `ts-morph`: Source file manipulation
- Reference resolution engine
- Dependency graph (topological sort)
- Import/export management

---

## Testing Strategy

### Unit Tests
- **Post-Processing**: TreeWalker, path matching, transformations
- **Multi-Schema**: RefResolver, DependencyGraph, BuilderRegistry

### Integration Tests
- **Post-Processing**: Complex transformations on real schemas
- **Multi-Schema**: Cross-schema references, import generation

### E2E Tests
- **Combined**: Multi-schema projects with post-processing
- **Real-world**: OpenAPI specs, complex domain models

---

## Success Metrics

### Post-Processing API
- [ ] Can traverse and query any builder tree
- [ ] Path syntax supports all JSONPath features
- [ ] Post-processors can transform builders without breaking generation
- [ ] 10+ real-world usage examples
- [ ] 95%+ test coverage

### Multi-Schema Projects
- [ ] Can convert 100+ schema projects
- [ ] Correctly resolves all reference types
- [ ] Generates valid TypeScript with correct imports
- [ ] Handles circular dependencies
- [ ] Build time < 10s for 100 schemas

### Combined
- [ ] Global post-processors work across all schemas
- [ ] Schema-specific post-processors work independently
- [ ] Cross-schema analysis and validation possible
- [ ] Documentation with 5+ combined examples
- [ ] Used in production by 3+ projects

---

## Future Enhancements

Once both features are implemented, we can build:

1. **Visual Schema Editor**: UI for defining post-processors
2. **Schema Linting**: Validate schema patterns across projects
3. **Migration Tools**: Transform schemas between versions
4. **Code Generation Templates**: Custom output formats
5. **Watch Mode**: Incremental rebuilds on file changes
6. **Plugin System**: Extensible processing pipeline
7. **Schema Registry**: Central repository of shared schemas
8. **Versioning**: Track schema evolution over time

---

## Questions for Review

1. **Priority**: Should we implement sequentially or in parallel?
2. **Scope**: Are there any features to defer to later phases?
3. **API Design**: Any concerns about the proposed APIs?
4. **Performance**: Any specific performance requirements?
5. **Compatibility**: TypeScript/Zod version requirements?
6. **Testing**: Any specific scenarios to test?

---

## Related Documents

- [Enhancement 003: Post-Processing API](./enhancement-003-post-processing-api.md)
- [Feature 004: Multi-Schema Projects](./feature-004-multi-schema-projects.md)
