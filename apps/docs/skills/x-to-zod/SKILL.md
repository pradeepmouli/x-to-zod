---
description: "Multi-schema project support.\n\nUse `SchemaProject` to manage multiple JSON Schemas with cross-schema references."
name: x-to-zod
---

# x-to-zod

Multi-schema project support.

Use `SchemaProject` to manage multiple JSON Schemas with cross-schema references.

## Quick Start

```ts
import { SchemaProject } from 'x-to-zod';

const project = new SchemaProject.SchemaProject({
  outDir: './generated',
  moduleFormat: 'both',
  zodVersion: 'v4',
  generateIndex: true,
});

project.addSchema('user', userSchema);
project.addSchema('post', postSchema);
await project.build();
```

## Configuration

6 configuration interfaces — see references/config.md for details.

## Quick Reference

85 exports (6 functions, 53 classes, 21 types, 5 constants) — see references/ for full API.

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When using a class → browse `references/classes/` for grouped indexes, properties, methods, and inheritance
- When defining typed variables or function parameters → read `references/types.md`
- When using exported constants → read `references/variables.md`
- When configuring options → read `references/config.md` for all settings and defaults

## Links

- Author: Pradeep Mouli <pmouli@mac.com> (https://github.com/pradeepmouli)