# Quickstart

1. Programmatic usage
```ts
import { jsonSchemaToZod } from 'x-to-zod';
import { postProcessors } from 'x-to-zod/post-processing';

const schema = { type: 'object', properties: { email: { type: 'string' }, id: { type: 'string' } } };
const code = jsonSchemaToZod(schema, {
  postProcessors: [
    postProcessors.strictObjects(),
    postProcessors.makeOptional('$.properties.email'),
    postProcessors.brandIds('UserId'),
  ],
});
```

2. CLI usage
```bash
# user module exports an array named postProcessors
node ./dist/cli.js --input schema.json --postProcessors ./my-post-processors.js
```

3. Custom processor example
```ts
export const postProcessors = [
  (builder, ctx) => {
    if (ctx.matchPath('$..createdAt') && is.stringBuilder(builder)) {
      return builder.datetime({ offset: true });
    }
  },
];
```
