# API Reference

Complete API reference for the parser class architecture and post-processing features introduced in Refactor 008.

## Core Classes

### BaseParser<TypeKind>

Abstract base class for all parser implementations using the Template Method pattern.

```typescript
abstract class BaseParser<TypeKind extends string = string> {
  abstract readonly typeKind: TypeKind;
  
  protected constructor(
    protected readonly schema: JsonSchema,
    protected readonly refs: Context
  );
  
  // Public API
  parse(): ZodBuilder;
  static setParseSchema(parseSchema: Function): void;
  
  // Protected API (for subclasses)
  protected abstract parseImpl(schema: JsonSchema): ZodBuilder;
  protected canProduceType(type: string): boolean;
  protected applyPreProcessors(schema: JsonSchema): JsonSchema;
  protected applyPostProcessors(builder: ZodBuilder, schema: JsonSchema): ZodBuilder;
  protected applyMetadata(builder: ZodBuilder, schema: JsonSchema): ZodBuilder;
  protected parseChild(schema: JsonSchema, ...pathSegments: (string | number)[]): ZodBuilder;
  protected createChildContext(...pathSegments: (string | number)[]): Context;
  protected matchesPath(pattern: string, path?: (string | number)[]): boolean;
}
```

#### Type Parameters

- `TypeKind`: String literal type identifying the parser (e.g., `'object'`, `'string'`)

#### Constructor Parameters

- `schema`: The JSON Schema to parse
- `refs`: Context object with parsing state and configuration

#### Public Methods

##### `parse(): ZodBuilder`

Main entry point that executes the full parsing pipeline:
1. Apply pre-processors
2. Call `parseImpl()` 
3. Apply post-processors
4. Apply metadata

**Returns**: Configured `ZodBuilder` instance

**Example**:
```typescript
const parser = new ObjectParser(schema, refs);
const builder = parser.parse();
console.log(builder.text()); // z.object({ ... })
```

##### `static setParseSchema(parseSchema: Function): void`

Sets the parseSchema function reference to break circular dependencies. Called once during module initialization.

**Parameters**:
- `parseSchema`: The parseSchema function from parseSchema.ts

#### Abstract Methods

##### `parseImpl(schema: JsonSchema): ZodBuilder`

Core parsing logic specific to each parser type. Must be implemented by subclasses.

**Parameters**:
- `schema`: Preprocessed JSON Schema

**Returns**: ZodBuilder for the parsed schema

**Example**:
```typescript
protected parseImpl(schema: JsonSchema): ZodBuilder {
  return parseObject(schema as JsonSchemaObject, this.refs);
}
```

##### `readonly typeKind: TypeKind`

Type identifier used for processor filtering. Must be defined by subclasses.

**Example**:
```typescript
readonly typeKind = 'object' as const;
```

#### Protected Methods

##### `canProduceType(type: string): boolean`

Checks if this parser can produce a given builder type. Used for type filtering in post-processors.

**Parameters**:
- `type`: Type string to check (e.g., 'object', 'ObjectBuilder')

**Returns**: `true` if parser produces this type

**Default Implementation**: Matches against `typeKind`

**Override Example**:
```typescript
protected canProduceType(type: string): boolean {
  return type === this.typeKind || type === 'ObjectBuilder';
}
```

##### `applyPreProcessors(schema: JsonSchema): JsonSchema`

Applies pre-processors to transform schema before parsing.

**Parameters**:
- `schema`: Original schema

**Returns**: Transformed schema

##### `applyPostProcessors(builder: ZodBuilder, schema: JsonSchema): ZodBuilder`

Applies post-processors to transform builder after parsing.

**Parameters**:
- `builder`: Builder from `parseImpl()`
- `schema`: Preprocessed schema

**Returns**: Transformed builder

##### `applyMetadata(builder: ZodBuilder, schema: JsonSchema): ZodBuilder`

Applies schema metadata (description, default) to builder.

**Parameters**:
- `builder`: Builder with post-processors applied
- `schema`: Preprocessed schema

**Returns**: Builder with metadata

##### `parseChild(schema: JsonSchema, ...pathSegments: (string | number)[]): ZodBuilder`

Parses a nested schema with updated context path.

**Parameters**:
- `schema`: Child schema to parse
- `pathSegments`: Path segments to append to current path

**Returns**: Parsed child builder

**Example**:
```typescript
const itemBuilder = this.parseChild(schema.items, 'items');
```

##### `createChildContext(...pathSegments: (string | number)[]): Context`

Creates a new context for parsing child schemas.

**Parameters**:
- `pathSegments`: Path segments to append

**Returns**: New Context with updated path

##### `matchesPath(pattern: string, path?: (string | number)[]): boolean`

Checks if a path pattern matches the current or given path.

**Parameters**:
- `pattern`: Path pattern to match (exact match or `'*'`)
- `path`: Optional path to check (defaults to `this.refs.path`)

**Returns**: `true` if pattern matches

---

### ObjectParser

Parser for object schemas.

```typescript
class ObjectParser extends BaseParser<'object'> {
  readonly typeKind = 'object' as const;
  
  constructor(schema: JsonSchemaObject & { type?: string }, refs: Context);
  protected parseImpl(schema: JsonSchema): ZodBuilder;
  protected canProduceType(type: string): boolean;
}
```

**Type Matching**: `'object'` or `'ObjectBuilder'`

---

### ArrayParser

Parser for array schemas.

```typescript
class ArrayParser extends BaseParser<'array'> {
  readonly typeKind = 'array' as const;
  
  constructor(schema: JsonSchemaArray & { type?: string }, refs: Context);
  protected parseImpl(schema: JsonSchema): ZodBuilder;
  protected canProduceType(type: string): boolean;
}
```

**Type Matching**: `'array'` or `'ArrayBuilder'`

---

### StringParser

Parser for string schemas.

```typescript
class StringParser extends BaseParser<'string'> {
  readonly typeKind = 'string' as const;
  
  constructor(schema: { type: 'string'; [key: string]: any }, refs: Context);
  protected parseImpl(schema: JsonSchema): ZodBuilder;
  protected canProduceType(type: string): boolean;
}
```

**Type Matching**: `'string'` or `'StringBuilder'`

---

### NumberParser

Parser for number and integer schemas.

```typescript
class NumberParser extends BaseParser<'number' | 'integer'> {
  readonly typeKind: 'number' | 'integer';
  
  constructor(schema: { type: 'number' | 'integer'; [key: string]: any }, refs: Context);
  protected parseImpl(schema: JsonSchema): ZodBuilder;
  protected canProduceType(type: string): boolean;
}
```

**Type Matching**: `'number'`, `'integer'`, or `'NumberBuilder'`

---

### BooleanParser

Parser for boolean schemas.

```typescript
class BooleanParser extends BaseParser<'boolean'> {
  readonly typeKind = 'boolean' as const;
  
  constructor(schema: { type: 'boolean' }, refs: Context);
  protected parseImpl(schema: JsonSchema): ZodBuilder;
  protected canProduceType(type: string): boolean;
}
```

**Type Matching**: `'boolean'` or `'BooleanBuilder'`

---

### NullParser

Parser for null schemas.

```typescript
class NullParser extends BaseParser<'null'> {
  readonly typeKind = 'null' as const;
  
  constructor(schema: { type: 'null' }, refs: Context);
  protected parseImpl(schema: JsonSchema): ZodBuilder;
  protected canProduceType(type: string): boolean;
}
```

**Type Matching**: `'null'` or `'NullBuilder'`

---

### AnyOfParser

Parser for anyOf (union) schemas.

```typescript
class AnyOfParser extends BaseParser<'anyOf'> {
  readonly typeKind = 'anyOf' as const;
  
  constructor(schema: { anyOf: JsonSchema[] }, refs: Context);
  protected parseImpl(schema: JsonSchema): ZodBuilder;
  protected canProduceType(type: string): boolean;
}
```

**Type Matching**: `'anyOf'` or `'UnionBuilder'`

---

### AllOfParser

Parser for allOf (intersection) schemas.

```typescript
class AllOfParser extends BaseParser<'allOf'> {
  readonly typeKind = 'allOf' as const;
  
  constructor(schema: { allOf: JsonSchema[] }, refs: Context);
  protected parseImpl(schema: JsonSchema): ZodBuilder;
  protected canProduceType(type: string): boolean;
}
```

**Type Matching**: `'allOf'` or `'IntersectionBuilder'`

---

### OneOfParser

Parser for oneOf (discriminated union) schemas.

```typescript
class OneOfParser extends BaseParser<'oneOf'> {
  readonly typeKind = 'oneOf' as const;
  
  constructor(schema: { oneOf: JsonSchema[] }, refs: Context);
  protected parseImpl(schema: JsonSchema): ZodBuilder;
  protected canProduceType(type: string): boolean;
}
```

**Type Matching**: `'oneOf'` or `'XorBuilder'`

---

## Registry Functions

### selectParserClass()

Selects the appropriate parser class for a schema.

```typescript
function selectParserClass(schema: JsonSchema): ParserClass | undefined
```

**Parameters**:
- `schema`: JSON Schema to analyze

**Returns**: Parser class constructor or `undefined` if no match

**Selection Priority**:
1. Combinators (`anyOf`, `allOf`, `oneOf`)
2. Explicit `type` field
3. Type inference via `its.*` utilities
4. `undefined` (fallback to functional parsers)

**Example**:
```typescript
const ParserClass = selectParserClass({ type: 'object' });
if (ParserClass) {
  const parser = new ParserClass(schema, refs);
  const builder = parser.parse();
}
```

---

## Parse API

Symmetric API providing direct access to parser classes.

```typescript
export const parse = {
  schema(schema: JsonSchema, refs: Context): ZodBuilder;
  object(schema: JsonSchemaObject, refs: Context): ZodBuilder;
  array(schema: JsonSchemaArray, refs: Context): ZodBuilder;
  string(schema: { type: 'string' }, refs: Context): ZodBuilder;
  number(schema: { type: 'number' | 'integer' }, refs: Context): ZodBuilder;
  boolean(schema: { type: 'boolean' }, refs: Context): ZodBuilder;
  null(schema: { type: 'null' }, refs: Context): ZodBuilder;
  anyOf(schema: { anyOf: JsonSchema[] }, refs: Context): ZodBuilder;
  allOf(schema: { allOf: JsonSchema[] }, refs: Context): ZodBuilder;
  oneOf(schema: { oneOf: JsonSchema[] }, refs: Context): ZodBuilder;
}
```

### parse.schema()

Main entry point with full feature support (preprocessing, post-processing, registry selection).

**Example**:
```typescript
import { parse } from 'x-to-zod/parsers';
import { buildV4 } from 'x-to-zod/v4';

const refs = { seen: new Map(), path: [], build: buildV4 };
const builder = parse.schema({ type: 'string' }, refs);
```

### parse.object()

Direct ObjectParser instantiation.

**Example**:
```typescript
const builder = parse.object({
  type: 'object',
  properties: { name: { type: 'string' } }
}, refs);
```

### parse.array()

Direct ArrayParser instantiation.

**Example**:
```typescript
const builder = parse.array({
  type: 'array',
  items: { type: 'number' }
}, refs);
```

---

## Types

### PostProcessor

Function type for post-processors.

```typescript
type PostProcessor = (
  builder: BaseBuilder,
  context: PostProcessorContext
) => BaseBuilder | undefined;
```

**Parameters**:
- `builder`: The ZodBuilder to transform
- `context`: Context information (path, schema, build)

**Returns**: Modified builder or `undefined` to preserve original

---

### PostProcessorConfig

Configuration object for post-processors with filtering.

```typescript
interface PostProcessorConfig {
  processor: PostProcessor;
  typeFilter?: string | string[];
  pathPattern?: string | string[];
}
```

**Fields**:
- `processor`: The post-processor function
- `typeFilter`: Optional type filter (e.g., `'object'`, `['object', 'array']`)
- `pathPattern`: Optional path pattern (exact match or `'*'`)

---

### PostProcessorContext

Context passed to post-processors.

```typescript
interface PostProcessorContext {
  path: (string | number)[];
  schema: JsonSchema;
  build: BuildFunctions;
}
```

**Fields**:
- `path`: Current path in schema tree (e.g., `['user', 'address', 'street']`)
- `schema`: The JSON Schema being parsed at this node
- `build`: Builder factory (buildV3 or buildV4)

---

### PreProcessor

Function type for pre-processors.

```typescript
type PreProcessor = (
  schema: JsonSchema,
  refs: Context
) => JsonSchema | undefined;
```

**Parameters**:
- `schema`: Schema to transform
- `refs`: Full context

**Returns**: Modified schema or `undefined` to preserve original

---

## Type Guards

Utility functions for type-safe builder checking.

```typescript
export const is = {
  zodBuilder(value: unknown): value is ZodBuilder;
  objectBuilder(value: unknown): value is ObjectBuilder;
  arrayBuilder(value: unknown): value is ArrayBuilder;
  stringBuilder(value: unknown): value is StringBuilder;
  numberBuilder(value: unknown): value is NumberBuilder;
  booleanBuilder(value: unknown): value is BooleanBuilder;
  nullBuilder(value: unknown): value is NullBuilder;
}
```

### is.zodBuilder()

Checks if value is any ZodBuilder.

**Example**:
```typescript
if (is.zodBuilder(value)) {
  console.log(value.text());
}
```

### is.objectBuilder()

Checks if value is ObjectBuilder with type narrowing.

**Example**:
```typescript
if (is.objectBuilder(builder)) {
  // TypeScript knows builder is ObjectBuilder
  builder.strict();
}
```

### is.arrayBuilder()

Checks if value is ArrayBuilder with type narrowing.

**Example**:
```typescript
if (is.arrayBuilder(builder)) {
  builder.nonempty();
}
```

---

## Usage Examples

### Example 1: Direct Parser Usage

```typescript
import { ObjectParser } from 'x-to-zod/parsers';
import { buildV4 } from 'x-to-zod/v4';

const schema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    count: { type: 'number' }
  },
  required: ['id']
};

const refs = {
  seen: new Map(),
  path: [],
  build: buildV4
};

const parser = new (ObjectParser as any)(schema, refs);
const builder = parser.parse();

console.log(builder.text());
// z.object({ "id": z.string(), "count": z.number().optional() })
```

### Example 2: Using Parse API

```typescript
import { parse } from 'x-to-zod/parsers';
import { buildV4 } from 'x-to-zod/v4';

const refs = { seen: new Map(), path: [], build: buildV4 };

const stringBuilder = parse.string({ type: 'string' }, refs);
const arrayBuilder = parse.array({ 
  type: 'array', 
  items: { type: 'number' } 
}, refs);

console.log(stringBuilder.text()); // z.string()
console.log(arrayBuilder.text());  // z.array(z.number())
```

### Example 3: Post-Processor with Type Guard

```typescript
import { jsonSchemaToZod } from 'x-to-zod';
import { is } from 'x-to-zod/utils';
import type { PostProcessorConfig } from 'x-to-zod';

const strictObjects: PostProcessorConfig = {
  processor: (builder) => {
    if (is.objectBuilder(builder)) {
      return builder.strict();
    }
    return builder;
  },
  typeFilter: 'object'
};

const result = jsonSchemaToZod(schema, {
  postProcessors: [strictObjects]
});
```

### Example 4: Custom Parser Class

```typescript
class StrictObjectParser extends ObjectParser {
  protected applyPostProcessors(
    builder: ZodBuilder,
    schema: JsonSchema
  ): ZodBuilder {
    let result = super.applyPostProcessors(builder, schema);
    
    if (is.objectBuilder(result)) {
      result = result.strict();
    }
    
    return result;
  }
}
```

---

## See Also

- [Parser Architecture](./parser-architecture.md) - Architecture overview
- [Post-Processing Guide](./post-processing.md) - Using post-processors
- [Migration Guide](./migration-parser-classes.md) - Transitioning to class-based parsers
