# Migrating to Multi-Schema Projects (v0.6.0+)

If you're currently using `x-to-zod` for single-schema conversion and want to adopt the new **multi-schema project** support, follow this migration guide.

## What's New

The `SchemaProject` API enables:
- **Multiple schema management** in a single project
- **Automatic import generation** for cross-schema references
- **Dependency graph analysis** with cycle detection
- **Index file generation** for convenient re-exporting
- **Lazy builders** for circular references
- **Dual-module output** (ESM + CJS) with separate configurations

## Before: Single Schema

```typescript
import { jsonSchemaToZod } from 'x-to-zod';

const schema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
  },
};

const zodCode = jsonSchemaToZod(schema);
console.log(zodCode);
```

## After: Multi-Schema Project

```typescript
import { SchemaProject } from 'x-to-zod';

const project = new SchemaProject({
  outDir: './generated',
  zodVersion: 'v4',
  generateIndex: true,
});

// Add multiple schemas
project.addSchema('user', {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
  },
});

project.addSchema('post', {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    title: { type: 'string' },
    authorId: { type: 'integer' },
  },
});

// Build generates files + index
await project.build();

// Outputs:
// - ./generated/user.ts
// - ./generated/post.ts
// - ./generated/index.ts (re-exports both)
```

## Migration Steps

### Step 1: Update Dependencies
No new runtime dependencies required. Multi-schema uses `ts-morph` (dev-only for code generation).

```bash
pnpm install  # Already included in package.json
```

### Step 2: Add SchemaProject to Your Build

Replace your single-schema conversion with `SchemaProject`:

```typescript
// Before
const code = jsonSchemaToZod(schema);
fs.writeFileSync('schema.ts', code);

// After
const project = new SchemaProject({
  outDir: './generated',
  zodVersion: 'v4',
  generateIndex: true,
});
project.addSchema('schema', schema);
await project.build();
```

### Step 3: Load Multiple Schemas

If reading from files:

```typescript
const project = new SchemaProject({ outDir: './generated' });

project.addSchemaFromFile('./schemas/user.json', 'user');
project.addSchemaFromFile('./schemas/post.json', 'post');
project.addSchemaFromFile('./schemas/comment.json', 'comment');

await project.build();
```

### Step 4: Handle Cross-References (Optional)

If schemas reference each other via `$ref`, the project automatically:
- Resolves references
- Generates correct import statements
- Detects circular dependencies and uses lazy builders

```typescript
// user.json
{
  "$ref": "post#/properties/authorId",
  ...
}

// Generated user.ts will automatically import Post type
```

### Step 5: Validate Before Building

```typescript
const validation = project.validate();
if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
  process.exit(1);
}
// Warnings (like cycles) do not block build
```

## Key Differences

| Feature | Single-Schema | Multi-Schema |
|---------|---------------|--------------|
| **Input** | Single JSON Schema object | Multiple schemas + files |
| **Output** | Single .ts file (string) | Multiple .ts files + index |
| **Imports** | Manual | Automatic |
| **Cross-refs** | Not supported | Full support with lazy builders |
| **Validation** | Limited | Export conflicts, cycles, missing refs |
| **CLI** | `x-to-zod --json` | `x-to-zod --project --schemas` |

## CLI Migration

### Before
```bash
x-to-zod --json myschema.json > myschema.ts
```

### After
```bash
x-to-zod --project \
  --schemas './schemas/*.json' \
  --out ./generated \
  --generate-index
```

## Troubleshooting

### "Module not found" errors after migration
Ensure your `import` statements point to the generated index:

```typescript
// Before (if manually managing files)
import User from './generated/user';

// After (with index)
import { User } from './generated';
```

### Circular reference warnings
These are **not errors**. The project uses `z.lazy()` to handle cycles gracefully. Build succeeds; warnings help identify architectural issues.

### Export name conflicts
If two schemas generate the same export name:

```typescript
// user.json → User
// api/user.json → User (conflict!)

// Solution: Rename one schema ID or adjust NameResolver
project.options.nameResolver = new CustomNameResolver();
```

## Learning Resources

- **Quickstart**: [specs/004-multi-schema-projects/quickstart.md](./specs/004-multi-schema-projects/quickstart.md)
- **Full API Docs**: [docs/multi-schema-projects.md](./docs/multi-schema-projects.md)
- **Examples**: `examples/version-specific-imports.ts`, `examples/newFeatures.ts`
