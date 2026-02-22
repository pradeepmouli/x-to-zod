# Quickstart: Custom Adapters & Lightweight Parsers

**Feature**: refactor-010 | **Phase**: 1 — Design
**Audience**: Third-party library authors, advanced users

This guide shows how to plug a new input format into x-to-zod using the two extension points
introduced by this refactoring:

1. **`SchemaInputAdapter`** — teach the pipeline about a new schema format.
2. **`Parser` interface** — write a lightweight parser that doesn't inherit `AbstractParser`.

---

## Extension Point 1 — Custom `SchemaInputAdapter`

### When to use

You have a custom schema representation (TypeScript interfaces, GraphQL SDL, Protobuf IDL,
a proprietary DSL) and want x-to-zod to convert it to Zod schemas without modifying core files.

### Step-by-step

#### 1. Define your schema type

```ts
// my-schema.ts
export interface MySchema {
  _kind: 'string' | 'number' | 'boolean' | 'object';
  label?: string;
  fields?: Record<string, MySchema>;
}
```

#### 2. Implement parsers for each kind

```ts
// parsers/MyStringParser.ts
import { AbstractParser, type Builder } from 'x-to-zod';

export class MyStringParser extends AbstractParser<'my-string', MySchema> {
  readonly typeKind = 'my-string' as const;

  protected parseImpl(schema: MySchema): Builder {
    return this.refs.build.string();
  }
}
```

```ts
// parsers/MyObjectParser.ts
import { AbstractParser, type Builder } from 'x-to-zod';

export class MyObjectParser extends AbstractParser<'my-object', MySchema> {
  readonly typeKind = 'my-object' as const;

  protected parseImpl(schema: MySchema): Builder {
    const shape: Record<string, string> = {};
    for (const [key, field] of Object.entries(schema.fields ?? {})) {
      shape[key] = this.parseChild(field, key).text();
    }
    return this.refs.build.object(shape);
  }
}
```

#### 3. Implement `SchemaInputAdapter`

```ts
// MyAdapter.ts
import type {
  SchemaInputAdapter,
  SchemaMetadata,
  ParserConstructor,
  Context,
} from 'x-to-zod';
import { MyStringParser } from './parsers/MyStringParser.js';
import { MyObjectParser } from './parsers/MyObjectParser.js';
import type { MySchema } from './my-schema.js';

const parserMap: Record<MySchema['_kind'], ParserConstructor> = {
  string:  MyStringParser,
  number:  MyNumberParser,  // implement similarly
  boolean: MyBooleanParser, // implement similarly
  object:  MyObjectParser,
};

export class MyAdapter implements SchemaInputAdapter {
  isValid(input: unknown): boolean {
    return (
      typeof input === 'object' &&
      input !== null &&
      '_kind' in input &&
      typeof (input as MySchema)._kind === 'string'
    );
  }

  selectParser(input: unknown, _refs: Context): ParserConstructor | undefined {
    const schema = input as MySchema;
    return parserMap[schema._kind];
  }

  getRef(_input: unknown): string | undefined {
    return undefined; // MySchema has no $ref concept
  }

  getMetadata(input: unknown): SchemaMetadata {
    const schema = input as MySchema;
    return { description: schema.label };
  }
}
```

#### 4. Register and use

```ts
// index.ts
import { registerAdapter, jsonSchemaToZod } from 'x-to-zod';
import { MyAdapter } from './MyAdapter.js';

registerAdapter(new MyAdapter());

const result = jsonSchemaToZod({ _kind: 'string', label: 'User name' } as any);
console.log(result); // z.string().describe("User name")
```

Alternatively, pass the adapter per-call without registering globally:

```ts
const result = jsonSchemaToZod(mySchema, { adapter: new MyAdapter() });
```

---

## Extension Point 2 — Lightweight `Parser` (no `AbstractParser` dependency)

### When to use

You need a simple parser for a custom type kind but don't need pre/post-processors or child
context tracking. Implementing `Parser` directly keeps your dependency surface minimal.

### Example

```ts
// CustomDateTimeParser.ts
import type { Parser, Builder, Context } from 'x-to-zod';

export class CustomDateTimeParser implements Parser {
  readonly typeKind = 'custom-datetime';

  constructor(
    private readonly schema: { format: string },
    private readonly refs: Context,
  ) {}

  parse(): Builder {
    // refs.build provides the factory functions (string, code, etc.)
    return this.refs.build.code('z.string().datetime()');
  }
}
```

Register it:

```ts
import { registerParser } from 'x-to-zod';
import { CustomDateTimeParser } from './CustomDateTimeParser.js';

registerParser('custom-datetime', CustomDateTimeParser);
```

The registry will instantiate `CustomDateTimeParser(schema, refs)` whenever a schema node
matches the `'custom-datetime'` type kind.

---

## Migrating `parserOverride` from `string` return

If you currently use a `parserOverride` that returns a raw string:

```ts
// Before
const result = jsonSchemaToZod(schema, {
  parserOverride: (s, refs) => {
    if (s.format === 'date') return 'z.string().date()';
  }
});
```

After this refactoring, the `string` return is deprecated. Replace with `refs.build.code()`:

```ts
// After
const result = jsonSchemaToZod(schema, {
  parserOverride: (s, refs) => {
    if (s.format === 'date') return refs.build.code('z.string().date()');
  }
});
```

`refs.build.code(str)` returns a `Builder` that emits `str` as the Zod expression.
The output is identical to the old string return.

---

## API Reference (new exports)

```ts
import {
  // Interfaces
  type Builder,          // Output contract for all parsers
  type Parser,           // Minimal parser contract
  type ParserConstructor,// Constructor shape accepted by the registry
  type SchemaInput,      // Semantic alias for unknown (input to the pipeline)
  type SchemaInputAdapter,// Protocol for custom input formats
  type SchemaMetadata,   // description / default / readOnly bag

  // Classes
  AbstractParser,        // Base class with template-method infrastructure
  // @deprecated:
  BaseParser,            // Alias for AbstractParser (will be removed in next major)

  // Functions
  registerAdapter,       // Set global SchemaInputAdapter
  registerParser,        // Register a parser class for a type kind
} from 'x-to-zod';
```
