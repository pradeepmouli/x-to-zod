# Parser Class Architecture

**Refactor 008** introduced a class-based parser architecture that replaces the previous functional approach with an object-oriented design following the Template Method pattern.

## Overview

The parser architecture consists of:
- **BaseParser**: Abstract base class defining the parsing template
- **Concrete Parsers**: Specialized parser classes for each JSON Schema type
- **Registry System**: Dynamic parser selection based on schema characteristics
- **Symmetric API**: `parse.*` methods mirroring the `build.*` API

## Class Hierarchy

```
BaseParser<TypeKind>
├── ObjectParser
├── ArrayParser
├── StringParser
├── NumberParser
├── BooleanParser
├── NullParser
├── AnyOfParser
├── AllOfParser
└── OneOfParser
```

### Type Parameter

Each parser class specifies its `TypeKind` as a const type:
```typescript
class ObjectParser extends BaseParser<'object'> {
  readonly typeKind = 'object' as const;
}
```

This enables:
- Type-safe processor filtering
- Runtime type identification
- Better IDE autocomplete

## Template Method Pattern

The `BaseParser` class implements the Template Method pattern, defining the overall parsing algorithm while allowing subclasses to customize specific steps.

### Parse Flow

```typescript
parse(): ZodBuilder {
  // 1. Apply pre-processors
  const processedSchema = this.applyPreProcessors(this.schema);

  // 2. Parse the schema (subclass-specific)
  let builder = this.parseImpl(processedSchema);

  // 3. Apply post-processors
  builder = this.applyPostProcessors(builder, processedSchema);

  // 4. Apply metadata (description, default)
  return this.applyMetadata(builder, processedSchema);
}
```

### Key Methods

**Abstract Methods** (must be implemented by subclasses):
- `parseImpl(schema)`: Core parsing logic specific to each type
- `readonly typeKind`: Type identifier (e.g., 'object', 'string')

**Protected Methods** (available to subclasses):
- `applyPreProcessors(schema)`: Transform schema before parsing
- `applyPostProcessors(builder, schema)`: Transform builder after parsing
- `applyMetadata(builder, schema)`: Add description and default values
- `parseChild(schema, ...pathSegments)`: Parse nested schemas
- `createChildContext(...pathSegments)`: Create context for nested parsing

### Post-Processor Type Filtering

`typeFilter` values are matched against a parser's `typeKind` only.

Examples:
- `ObjectParser` → `typeKind = 'object'`
- `ArrayParser` → `typeKind = 'array'`
- `OneOfParser` → `typeKind = 'oneOf'`

Builder class names (for example `ObjectBuilder`) are not used for filtering.

## Parser Selection Algorithm

The `selectParserClass()` function determines which parser class to use:

```typescript
function selectParserClass(schema: JsonSchema): ParserClass | undefined {
  // 1. Check combinators first (highest priority)
  if (is.anyOf(schema)) return AnyOfParser;
  if (is.allOf(schema)) return AllOfParser;
  if (is.oneOf(schema)) return OneOfParser;

  // 2. Check explicit type field
  if (schema.type === 'object') return ObjectParser;
  if (schema.type === 'array') return ArrayParser;
  // ... etc

  // 3. Type inference using is.* utilities
  if (is.object(schema)) return ObjectParser;
  if (is.array(schema)) return ArrayParser;
  // ... etc

  // 4. Return undefined (fallback to functional parsers)
  return undefined;
}
```

### Selection Priority

1. **Combinators**: `anyOf`, `allOf`, `oneOf` (highest priority)
2. **Explicit `type` field**: Direct type field in schema
3. **Type inference**: Use `is.*` utilities to detect implicit types
4. **Fallback**: Return undefined for functional parser fallback

## Type Guards

Type guards replace `instanceof` checks for safer type identification:

```typescript
// Old approach (not recommended)
if (builder instanceof ObjectBuilder) { ... }

// New approach (recommended)
import { is } from 'x-to-zod/utils';

if (is.objectBuilder(builder)) {
  // TypeScript now knows builder is ObjectBuilder
  builder.strict();
}
```

### Available Type Guards

- `is.objectBuilder(value)`
- `is.arrayBuilder(value)`
- `is.stringBuilder(value)`
- `is.numberBuilder(value)`
- `is.booleanBuilder(value)`
- `is.zodBuilder(value)` - Any ZodBuilder

## Symmetric Parse API

The `parse` object provides a symmetric API that mirrors the `build` API:

```typescript
import { parse } from 'x-to-zod/parsers';
import { buildV4 } from 'x-to-zod/v4';

const context = { seen: new Map(), path: [], build: buildV4 };

// Direct parser instantiation
const stringBuilder = parse.string({ type: 'string' }, context);
const objectBuilder = parse.object({
  type: 'object',
  properties: { name: { type: 'string' } }
}, context);

// Main entry point (with full features)
const builder = parse.schema(schema, context);
```

### Parse Methods

- `parse.schema(schema, refs)` - Main entry point with full feature support
- `parse.object(schema, refs)` - Parse as object
- `parse.array(schema, refs)` - Parse as array
- `parse.string(schema, refs)` - Parse as string
- `parse.number(schema, refs)` - Parse as number
- `parse.boolean(schema, refs)` - Parse as boolean
- `parse.null(schema, refs)` - Parse as null
- `parse.anyOf(schema, refs)` - Parse as union
- `parse.allOf(schema, refs)` - Parse as intersection
- `parse.oneOf(schema, refs)` - Parse as discriminated union

## Adding a New Parser Class

Follow these steps to add a new parser class:

### 1. Create Parser Class

```typescript
// src/JsonSchema/parsers/CustomParser.ts
import type { Context, JsonSchema } from '../../Types.js';
import type { ZodBuilder } from '../../ZodBuilder/BaseBuilder.js';
import { BaseParser } from './BaseParser.js';
import { parseCustom } from './parseCustom.js'; // Your functional parser

export class CustomParser extends BaseParser<'custom'> {
  readonly typeKind = 'custom' as const;

  constructor(
    schema: JsonSchema & { customField: string },
    refs: Context
  ) {
    super(schema, refs);
  }

  protected parseImpl(schema: JsonSchema): ZodBuilder {
    return parseCustom(schema as any, this.refs);
  }
}
```

### 2. Register in Registry

```typescript
// src/JsonSchema/parsers/registry.ts
import { CustomParser } from './CustomParser.js';

export const parserRegistry = new Map<string, ParserClass>([
  // ... existing parsers
  ['custom', CustomParser],
]);
```

### 3. Update Selection Logic

```typescript
// src/JsonSchema/parsers/registry.ts
export function selectParserClass(schema: JsonSchema): ParserClass | undefined {
  // Check for custom schema
  if ('customField' in schema) {
    return parserRegistry.get('custom');
  }

  // ... existing selection logic
}
```

### 4. Add to Parse API

```typescript
// src/JsonSchema/parsers/index.ts
export const parse = {
  // ... existing methods

  custom(schema: JsonSchema & { customField: string }, refs: Context): ZodBuilder {
    const parser = new (CustomParser as any)(schema, refs);
    return parser.parse();
  },
};
```

### 5. Add Tests

```typescript
// test/JsonSchema/parsers/CustomParser.test.ts
import { describe, it, expect } from 'vitest';
import { CustomParser } from '../../../src/JsonSchema/parsers/CustomParser.js';
import { buildV4 } from '../../../src/ZodBuilder/v4.js';

describe('CustomParser', () => {
  it('should parse custom schema', () => {
    const schema = { customField: 'value' };
    const refs = { seen: new Map(), path: [], build: buildV4 };

    const parser = new (CustomParser as any)(schema, refs);
    const builder = parser.parse();

    expect(builder.text()).toContain('z.custom');
  });
});
```

## Code Examples

### Example 1: Basic Parser Usage

```typescript
import { ObjectParser } from 'x-to-zod/parsers';
import { buildV4 } from 'x-to-zod/v4';

const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'number' }
  },
  required: ['name']
};

const refs = {
  seen: new Map(),
  path: [],
  build: buildV4
};

const parser = new (ObjectParser as any)(schema, refs);
const builder = parser.parse();

console.log(builder.text());
// Output: z.object({ "name": z.string(), "age": z.number().optional() })
```

### Example 2: Using Parse API

```typescript
import { parse } from 'x-to-zod/parsers';
import { buildV4 } from 'x-to-zod/v4';

const schema = {
  type: 'array',
  items: { type: 'string' },
  minItems: 1
};

const refs = { seen: new Map(), path: [], build: buildV4 };

const builder = parse.array(schema, refs);
console.log(builder.text());
// Output: z.array(z.string()).min(1)
```

### Example 3: Custom Parser with Processing

```typescript
class EnhancedObjectParser extends ObjectParser {
  protected parseImpl(schema: JsonSchema): ZodBuilder {
    // Custom logic before parsing
    const modified = { ...schema, additionalProperties: false };

    // Call parent implementation
    const builder = super.parseImpl(modified);

    // Custom logic after parsing
    return builder.strict();
  }
}
```

### Example 4: Type Guard Usage

```typescript
import { is } from 'x-to-zod/utils';
import { parse } from 'x-to-zod/parsers';

function processBuilder(builder: ZodBuilder): ZodBuilder {
  if (is.objectBuilder(builder)) {
    return builder.strict();
  }

  if (is.arrayBuilder(builder)) {
    return builder.nonempty();
  }

  return builder;
}
```

## Benefits of Class-Based Architecture

1. **Extensibility**: Easy to extend parser behavior through inheritance
2. **Testability**: Isolated unit tests for each parser class
3. **Maintainability**: Clear separation of concerns
4. **Flexibility**: Hook methods allow customization without modification
5. **Type Safety**: Strong typing with TypeScript generics
6. **Reusability**: Common logic in BaseParser reduces duplication

## Migration Notes

For **users**: No changes needed. The public API (`jsonSchemaToZod()`) remains unchanged.

For **contributors**: See [migration-parser-classes.md](./migration-parser-classes.md) for details on the functional-to-class transition.

## Related Documentation

- [Post-Processing Guide](./post-processing.md) - Using processors with the class architecture
- [API Reference](./API.md) - Complete API documentation
- [Migration Guide](./migration-parser-classes.md) - Transitioning from functional to class-based parsers
