# Usage

## CLI

```bash
x-to-zod path/to/schema.json > schema.ts
```

## Programmatic

```ts
import { parseSchema } from 'x-to-zod';

const zodCode = parseSchema({
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'number', minimum: 0 }
  },
  required: ['name']
});

console.log(zodCode);
// z.object({ name: z.string(), age: z.number().gte(0).optional() })
```

## Zod v4 mode

```ts
import { parseSchema } from 'x-to-zod/v4';

const zodCode = parseSchema(schema, { zodVersion: 'v4' });
// Uses z.strictObject(), z.looseObject(), .extend() instead of .merge()
```

## Post-processing

Transform Zod builders after parsing to apply organization-wide validation rules, security constraints, or custom transformations. See the [Post-Processing Guide](https://github.com/pradeepmouli/x-to-zod/blob/master/docs/post-processing.md) for details.

## API reference

See the full [API reference](../api/) for every exported symbol, including builders, parsers, and post-processors.
