# Quickstart: Dependency Injection Pattern

## Goal

Inject build factory into Context to eliminate runtime version detection and make parsers version-agnostic.

## Architecture Overview

```typescript
// Entry Point: Select factory and inject
const build = options.zodVersion === 'v3' ? buildV3 : buildV4;
const context: Context = { build, path: [], seen: new Map() };

// Parsers: Use injected factory
const code = refs.build.string().min(5).text();

// Factories: Version-specific
const buildV3 = { string: (p?) => new StringBuilder(p, 'v3') };
const buildV4 = { string: (p?) => new StringBuilder(p, 'v4') };
```

## Key Changes

### 1. Context Type (src/Types.ts)

```typescript
import type { buildV3 } from './ZodBuilder/v3';
import type { buildV4 } from './ZodBuilder/v4';

export type Context = {
  build: typeof buildV3 | typeof buildV4;
  path: string[];
  seen: Map<unknown, string>;
};
```

### 2. Factory Files (src/ZodBuilder/v3.ts, v4.ts)

```typescript
// v3.ts
import { StringBuilder, NumberBuilder, /* ... */ } from './';
import type { z } from 'zod';

export const buildV3 = {
  string: (params?: Parameters<typeof z.string>[0]) => 
    new StringBuilder(params, 'v3'),
  number: (params?: Parameters<typeof z.number>[0]) => 
    new NumberBuilder(params, 'v3'),
  // ... all other builders
};

// v4.ts - same structure with 'v4'
```

### 3. Builder Constructors (src/ZodBuilder/string.ts, etc.)

```typescript
export class StringBuilder extends ZodBuilder<'string', Parameters<typeof z.string>[0]> {
  private _version?: 'v3' | 'v4';
  
  constructor(
    params?: Parameters<typeof z.string>[0],
    version?: 'v3' | 'v4'
  ) {
    super();
    this._params = params;
    this._version = version;
  }
  
  // ... rest of implementation
}
```

### 4. Entry Point (src/jsonSchemaToZod.ts)

```typescript
import { buildV3, buildV4 } from './ZodBuilder';

export const jsonSchemaToZod = (
  schema: JsonSchema, 
  options: Options = {}
): string => {
  // Select factory once based on version
  const build = options.zodVersion === 'v3' ? buildV3 : buildV4;
  
  // Inject into context
  const context: Context = {
    build,
    path: [],
    seen: new Map()
  };
  
  // Parse with injected context
  return parseSchema(schema, context);
};
```

### 5. Parser Updates (src/JsonSchema/parsers/parseString.ts, etc.)

```typescript
// Before:
import { build } from '../../ZodBuilder';
const code = build.string().min(5).text();

// After:
// No import needed - use refs.build
const code = refs.build.string().min(5).text();
```

## Implementation Checklist

- [ ] Create v3.ts with buildV3 factory
- [ ] Create v4.ts with buildV4 factory
- [ ] Update Context type to include build
- [ ] Update BaseBuilder and all builders to accept version parameter
- [ ] Update entry point to inject factory
- [ ] Update all parsers to use refs.build
- [ ] Remove runtime detection logic
- [ ] Verify all tests pass (263)

## Benefits

✅ **Simpler**: No runtime detection logic
✅ **Type-Safe**: Build factory type enforced in Context
✅ **Testable**: Can mock build in tests
✅ **Extensible**: Easy to add v5, v6, etc.
✅ **Clean**: Version decision made once at entry
✅ **Version-Agnostic**: Parsers don't know about versions

## Testing

```bash
# Run full test suite
npm test

# Verify TypeScript compilation
npx tsc --noEmit

# Build both targets
npm run build:esm
npm run build:cjs
```

All 263 tests should pass with identical outputs.

---
*Quick reference for implementation - See plan.md and tasks.md for detailed steps*
