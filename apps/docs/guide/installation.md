# Installation

## Prerequisites

- Node.js >= 20

## Install globally (for CLI use)

```bash
npm i -g x-to-zod
```

## Install as a dependency

```bash
npm install x-to-zod
# or
pnpm add x-to-zod
# or
yarn add x-to-zod
```

## Version-specific imports

```ts
// Zod v3 output (default)
import { parseSchema } from 'x-to-zod/v3';

// Zod v4 output
import { parseSchema } from 'x-to-zod/v4';
```

See [Usage](./usage.md) for the full workflow.
