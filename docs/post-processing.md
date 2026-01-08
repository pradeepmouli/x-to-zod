# Post-Processing Guide

Transform parsed builders after JSON Schema parsing to enforce project-specific rules. Post-processors run after each parser creates a Zod builder and receive path-aware context so you can target specific schema locations.

## Path matching

Path patterns use a JSONPath-like syntax:

- `$` root
- `$.properties.user` exact path
- `$.properties.*` single-level wildcard
- `$.properties.**` deep wildcard
- `$..id` recursive descent for any `id` field

The context includes `path` (segments), `pathString` (e.g., `$.properties.user`), and `matchPath(pattern)` to test patterns.

## Programmatic usage

```ts
import { jsonSchemaToZod } from 'x-to-zod';
import { postProcessors } from 'x-to-zod/post-processing';

const schema = {
  type: 'object',
  properties: {
    email: { type: 'string' },
    id: { type: 'string' },
    tags: { type: 'array', items: { type: 'string' } },
  },
};

const code = jsonSchemaToZod(schema, {
  postProcessors: [
    postProcessors.strictObjects(),
    postProcessors.makeOptional('$.properties.email'),
    postProcessors.brandIds('UserId'),
    postProcessors.nonemptyArrays(),
  ],
});
```

## Presets

- `strictObjects()` → `z.strictObject()`
- `nonemptyArrays()` → `z.array(...).nonempty()`
- `brandIds(brand = 'ID')` → brands string `id` fields when paths match `$..id`
- `makeOptional(pattern)` → marks matching builders optional
- `makeRequired(pattern)` → removes optional on matching builders
- `matchPath(pattern, transform)` → wrapper to run a transform only when `matchPath` passes

## CLI usage

Provide a module that exports an array named `postProcessors`:

```js
// post-processors.js
export const postProcessors = [
  (builder, ctx) => ctx.matchPath('$..id') ? builder.brand('ID') : undefined,
];
```

Run the CLI with the new flag:

```bash
x-to-zod --input schema.json --postProcessors ./post-processors.js
```

The module can use ESM default export or named `postProcessors`; arrays are required.
