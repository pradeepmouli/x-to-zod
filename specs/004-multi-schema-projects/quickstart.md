# Quickstart (Phase 1)

## Programmatic Usage

```ts
import { SchemaProject } from 'x-to-zod';

const project = new SchemaProject({
  outDir: './generated',
  moduleFormat: 'both',
  zodVersion: 'v4',
  generateIndex: true,
});

project.addSchema('user', {
  $id: 'user',
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
  },
  required: ['id', 'name'],
});

project.addSchema('post', {
  $id: 'post',
  type: 'object',
  properties: {
    id: { type: 'string' },
    title: { type: 'string' },
    author: { $ref: 'user#/properties/id' },
  },
  required: ['id', 'title', 'author'],
});

await project.build();
// Emits generated/user.ts, generated/post.ts, generated/index.ts
// Also emits CJS equivalents when moduleFormat='both'
```

## CLI Usage (project mode)

```bash
x-to-zod --project \
  --schemas "./schemas/*.json" \
  --out ./generated \
  --module-format both \
  --zod-version v4 \
  --generate-index
```

## Notes
- Missing $refs generate `z.unknown()` with warnings
- Circular refs generate lazy builders with warnings; build continues
- Export name conflicts fail validation and must be resolved
- Watch mode deferred; use external tools (nodemon/chokidar) if needed
