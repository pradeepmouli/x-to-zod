# Examples

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