# Refactor 008: Parser Class Architecture with Integrated Post-Processing

## Overview

Refactor the parser architecture from functional to object-oriented, with built-in support for pre/post-processing hooks. This enables cleaner code organization, better inheritance, early processor filtering, and natural integration of transformation pipelines.

## Motivation

### Current Architecture Issues

1. **Function-based parsers**: Each parser is a standalone function with duplicated logic
   ```typescript
   parseObject(schema, refs) { /* ... */ }
   parseArray(schema, refs) { /* ... */ }
   parseString(schema, refs) { /* ... */ }
   ```

2. **No shared base logic**: Common patterns (metadata application, circular refs) duplicated across parsers

3. **instanceof checks**: Type checking uses `instanceof` instead of type guards

4. **No processor filtering**: All processors passed to all parsers, even if not applicable

5. **Asymmetric API**: `build.object()` creates builders, but no matching `parse.object()`

### Goals

1. **Class-based parsers** with inheritance for shared logic
2. **Integrated pre/post-processing** in base parser
3. **Early processor filtering** - only run applicable processors
4. **Type guard usage** instead of `instanceof`
5. **Symmetric parse/build API** - `parse.object()` mirrors `build.object()`

## Design

### Architecture Overview

```
JSON Schema
    ↓
parseSchema() → SelectParser()
    ↓
ParserClass (e.g., ObjectParser)
    ├─ Constructor: Filter applicable processors
    ├─ parse() method:
    │   ├─ applyPreProcessors() (BaseParser)
    │   ├─ parseImpl() (Subclass - actual parsing)
    │   └─ applyPostProcessors() (BaseParser)
    └─ Returns ZodBuilder
    ↓
ZodBuilder → text() → Code
```

### Core Components

#### 1. BaseParser Abstract Class

```typescript
/**
 * Base parser class with common parsing logic
 * All specific parsers inherit from this
 */
abstract class BaseParser {
  protected preProcessors: PreProcessor[];
  protected postProcessors: PostProcessor[];

  constructor(
    protected schema: JsonSchema,
    protected refs: Context
  ) {
    // Filter processors that could apply to this parser
    this.preProcessors = this.filterPreProcessors(refs.preProcessors);
    this.postProcessors = this.filterPostProcessors(refs.postProcessors);
  }

  /**
   * Main parse method - template method pattern
   */
  parse(): ZodBuilder {
    // Step 1: Apply pre-processors to schema
    const processedSchema = this.applyPreProcessors(this.schema);

    // Step 2: Do the actual parsing (implemented by subclass)
    let builder = this.parseImpl(processedSchema);

    // Step 3: Apply post-processors to builder
    builder = this.applyPostProcessors(builder);

    // Step 4: Apply metadata (descriptions, defaults, etc.)
    builder = this.applyMetadata(builder, processedSchema);

    return builder;
  }

  /**
   * Actual parsing logic - implemented by each parser
   */
  protected abstract parseImpl(schema: JsonSchema): ZodBuilder;

  /**
   * Apply pre-processors to transform schema before parsing
   */
  protected applyPreProcessors(schema: JsonSchema): JsonSchema {
    let result = schema;

    for (const processor of this.preProcessors) {
      const processed = processor(result, this.refs);
      if (processed !== undefined) {
        result = processed;
      }
    }

    return result;
  }

  /**
   * Apply post-processors to transform builder after parsing
   */
  protected applyPostProcessors(builder: ZodBuilder): ZodBuilder {
    let result = builder;

    for (const processor of this.postProcessors) {
      const processed = processor(result, {
        path: this.refs.path,
        pathString: pathToString(this.refs.path),
        schema: this.schema,
        build: this.refs.build,
        matchPath: (pattern) => matchPath(this.refs.path, pattern),
      });

      if (processed !== undefined) {
        result = processed;
      }
    }

    return result;
  }

  /**
   * Apply metadata from schema (descriptions, defaults, etc.)
   */
  protected applyMetadata(builder: ZodBuilder, schema: JsonSchema): ZodBuilder {
    let result = builder;

    if (schema.description) {
      result = result.describe(schema.description);
    }

    if ('default' in schema) {
      result = result.default(schema.default);
    }

    // Apply other metadata...

    return result;
  }

  /**
   * Filter pre-processors that could apply to this parser
   */
  protected filterPreProcessors(processors: PreProcessor[] = []): PreProcessor[] {
    return processors.filter(p => this.isProcessorApplicable(p));
  }

  /**
   * Filter post-processors that could apply to this parser
   */
  protected filterPostProcessors(processors: PostProcessorConfig[] = []): PostProcessor[] {
    return processors
      .filter(p => this.isProcessorApplicable(p))
      .map(p => this.normalizeProcessor(p));
  }

  /**
   * Check if processor could apply based on path/type filters
   */
  protected isProcessorApplicable(processor: ProcessorConfig): boolean {
    // If processor has path filter, check current path
    if (processor.pathPattern) {
      if (!matchPath(this.refs.path, processor.pathPattern)) {
        return false;
      }
    }

    // If processor has type filter, check if this parser could produce that type
    if (processor.typeFilter) {
      if (!this.canProduceType(processor.typeFilter)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if this parser can produce a specific builder type
   * Override in subclasses for specific types
   */
  protected canProduceType(type: string): boolean {
    return true; // Base implementation - can't determine
  }

  /**
   * Normalize processor config to processor function
   */
  protected normalizeProcessor(config: PostProcessorConfig): PostProcessor {
    if (typeof config === 'function') {
      return config;
    }

    // Handle different config types
    // ... implementation ...

    return config.transform;
  }

  /**
   * Create child parser context for nested schemas
   */
  protected createChildContext(pathSegment: string | number): Context {
    return {
      ...this.refs,
      path: [...this.refs.path, pathSegment],
    };
  }

  /**
   * Parse child schema (recursive call)
   */
  protected parseChild(schema: JsonSchema, pathSegment: string | number): ZodBuilder {
    return parseSchema(schema, this.createChildContext(pathSegment));
  }
}
```

#### 2. Specific Parser Classes

**ObjectParser**:
```typescript
class ObjectParser extends BaseParser {
  protected parseImpl(schema: JsonSchema): ZodBuilder {
    const properties: Record<string, ZodBuilder> = {};

    // Parse each property
    if (schema.properties) {
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        properties[key] = this.parseChild(propSchema, key);
      }
    }

    // Create object builder
    let builder = this.refs.build.object(properties);

    // Apply object-specific modifiers
    if (schema.additionalProperties === false) {
      builder = builder.strict();
    } else if (is.schema(schema.additionalProperties)) {
      const catchallBuilder = this.parseChild(schema.additionalProperties, 'additionalProperties');
      builder = builder.catchall(catchallBuilder);
    }

    // Handle pattern properties
    if (schema.patternProperties) {
      builder = this.applyPatternProperties(builder, schema.patternProperties);
    }

    return builder;
  }

  protected canProduceType(type: string): boolean {
    return type === 'object' || type === 'ObjectBuilder';
  }

  private applyPatternProperties(
    builder: ObjectBuilder,
    patterns: Record<string, JsonSchema>
  ): ObjectBuilder {
    // ... pattern properties logic ...
    return builder;
  }
}
```

**ArrayParser**:
```typescript
class ArrayParser extends BaseParser {
  protected parseImpl(schema: JsonSchema): ZodBuilder {
    // Tuple array
    if (Array.isArray(schema.items)) {
      const itemBuilders = schema.items.map((itemSchema, index) =>
        this.parseChild(itemSchema, index)
      );
      return this.refs.build.tuple(itemBuilders);
    }

    // Regular array
    const itemsBuilder = is.schema(schema.items)
      ? this.parseChild(schema.items, 'items')
      : this.refs.build.any();

    let builder = this.refs.build.array(itemsBuilder);

    // Apply array constraints
    if (schema.minItems !== undefined) {
      builder = builder.min(schema.minItems);
    }

    if (schema.maxItems !== undefined) {
      builder = builder.max(schema.maxItems);
    }

    return builder;
  }

  protected canProduceType(type: string): boolean {
    return type === 'array' || type === 'ArrayBuilder';
  }
}
```

**StringParser**:
```typescript
class StringParser extends BaseParser {
  protected parseImpl(schema: JsonSchema): ZodBuilder {
    let builder = this.refs.build.string();

    // Apply string constraints
    if (schema.minLength !== undefined) {
      builder = builder.min(schema.minLength);
    }

    if (schema.maxLength !== undefined) {
      builder = builder.max(schema.maxLength);
    }

    if (schema.pattern) {
      builder = builder.regex(new RegExp(schema.pattern));
    }

    // Apply format
    if (schema.format) {
      builder = this.applyFormat(builder, schema.format);
    }

    return builder;
  }

  protected canProduceType(type: string): boolean {
    return type === 'string' || type === 'StringBuilder';
  }

  private applyFormat(builder: StringBuilder, format: string): StringBuilder {
    switch (format) {
      case 'email': return builder.email();
      case 'uuid': return builder.uuid();
      case 'url': return builder.url();
      case 'date-time': return builder.datetime();
      // ... more formats ...
      default: return builder;
    }
  }
}
```

**UnionParser** (for anyOf):
```typescript
class UnionParser extends BaseParser {
  protected parseImpl(schema: JsonSchema): ZodBuilder {
    if (!schema.anyOf || schema.anyOf.length === 0) {
      return this.refs.build.never();
    }

    if (schema.anyOf.length === 1) {
      return this.parseChild(schema.anyOf[0], 0);
    }

    const options = schema.anyOf.map((optionSchema, index) =>
      this.parseChild(optionSchema, index)
    );

    return this.refs.build.union(options);
  }

  protected canProduceType(type: string): boolean {
    return type === 'union' || type === 'UnionBuilder';
  }
}
```

#### 3. Parser Registry and Selection

```typescript
/**
 * Parser registry - maps schema types to parser classes
 */
const parserRegistry = new Map<string, typeof BaseParser>([
  ['object', ObjectParser],
  ['array', ArrayParser],
  ['string', StringParser],
  ['number', NumberParser],
  ['integer', NumberParser],
  ['boolean', BooleanParser],
  ['null', NullParser],
  ['anyOf', UnionParser],
  ['allOf', IntersectionParser],
  ['oneOf', XorParser],
]);

/**
 * Select appropriate parser class for schema
 */
function selectParserClass(schema: JsonSchema): typeof BaseParser {
  // Check for combinators first
  if (schema.anyOf) return UnionParser;
  if (schema.allOf) return IntersectionParser;
  if (schema.oneOf) return XorParser;

  // Check for nullable
  if (its.nullable(schema)) return NullableParser;

  // Check type
  if (schema.type) {
    const ParserClass = parserRegistry.get(schema.type);
    if (ParserClass) return ParserClass;
  }

  // Fallback - try to infer
  if (its.object(schema)) return ObjectParser;
  if (its.array(schema)) return ArrayParser;
  if (its.string(schema)) return StringParser;
  if (its.number(schema)) return NumberParser;
  if (its.boolean(schema)) return BooleanParser;

  // Default to any
  return AnyParser;
}

/**
 * Main parseSchema function - now creates parser instance
 */
function parseSchema(schema: JsonSchema, refs: Context): ZodBuilder {
  // Check for $ref
  if (schema.$ref) {
    return parseRef(schema.$ref, refs);
  }

  // Check circular references
  if (refs.seen.has(schema)) {
    return refs.seen.get(schema).r;
  }

  // Check parser override
  if (refs.parserOverride) {
    const overridden = refs.parserOverride(schema, refs);
    if (overridden) {
      return typeof overridden === 'string'
        ? refs.build.fromCode(overridden)
        : overridden;
    }
  }

  // Select and instantiate parser
  const ParserClass = selectParserClass(schema);
  const parser = new ParserClass(schema, refs);

  // Parse and return
  const builder = parser.parse();

  // Cache for circular references
  refs.seen.set(schema, { n: 0, r: builder });

  return builder;
}
```

#### 4. Symmetric Parse API

Create `parse` object that mirrors `build`:

```typescript
/**
 * Parser factory - mirrors build API
 */
export const parse = {
  /** Parse object schema */
  object: (schema: JsonSchema, refs: Context): ObjectBuilder => {
    return new ObjectParser(schema, refs).parse() as ObjectBuilder;
  },

  /** Parse array schema */
  array: (schema: JsonSchema, refs: Context): ArrayBuilder => {
    return new ArrayParser(schema, refs).parse() as ArrayBuilder;
  },

  /** Parse string schema */
  string: (schema: JsonSchema, refs: Context): StringBuilder => {
    return new StringParser(schema, refs).parse() as StringBuilder;
  },

  // ... more parsers ...

  /** Main schema parser - auto-selects parser */
  schema: (schema: JsonSchema, refs: Context): ZodBuilder => {
    return parseSchema(schema, refs);
  },
};

// Internal usage
parse.object(schema, refs); // Instead of parseObject(schema, refs)
parse.schema(schema, refs); // Instead of parseSchema(schema, refs)
```

#### 5. Type Guards Instead of instanceof

```typescript
// Use existing its.* and is.* utilities

// Before:
if (builder instanceof ObjectBuilder) {
  return builder.strict();
}

// After:
if (is.objectBuilder(builder)) {
  return builder.strict();
}

// Implement type guards in src/utils/is.ts
export const is = {
  objectBuilder: (value: unknown): value is ObjectBuilder => {
    return value instanceof ObjectBuilder; // Or use other checks
  },

  stringBuilder: (value: unknown): value is StringBuilder => {
    return value instanceof StringBuilder;
  },

  arrayBuilder: (value: unknown): value is ArrayBuilder => {
    return value instanceof ArrayBuilder;
  },

  // ... more builder type guards ...
};

// For schemas, use existing its.* predicates
if (its.object(schema)) {
  // Schema is object type
}

if (its.array(schema)) {
  // Schema is array type
}
```

#### 6. Processor Configuration with Early Filtering

```typescript
interface ProcessorConfig {
  /** Processor function */
  processor: PostProcessor;

  /** Optional path pattern - only apply if path matches */
  pathPattern?: string | string[];

  /** Optional type filter - only apply to specific builder types */
  typeFilter?: string | string[];
}

// Usage:
jsonSchemaToZod(schema, {
  postProcessors: [
    // Simple function - always runs
    (builder) => is.objectBuilder(builder) ? builder.strict() : undefined,

    // With metadata for early filtering
    {
      processor: (builder) => builder.brand('ID'),
      pathPattern: '$..id',
      typeFilter: 'string', // Only run for string builders
    },
  ],
});

// BaseParser filters before running:
protected filterPostProcessors(processors: PostProcessorConfig[]): PostProcessor[] {
  return processors
    .filter(config => {
      // Check path pattern
      if (config.pathPattern && !matchPath(this.refs.path, config.pathPattern)) {
        return false; // Skip - path doesn't match
      }

      // Check type filter
      if (config.typeFilter && !this.canProduceType(config.typeFilter)) {
        return false; // Skip - this parser won't produce this type
      }

      return true;
    })
    .map(config => typeof config === 'function' ? config : config.processor);
}
```

## Implementation Plan

### Phase 1: Base Parser Infrastructure (Week 1-2)

1. **Create BaseParser abstract class**
   - Template method pattern
   - Pre/post-processor hooks
   - Metadata application
   - Processor filtering

2. **Add type guards for builders**
   - Extend `src/utils/is.ts` with builder type guards
   - Replace instanceof checks throughout codebase

**Files**:
- `src/JsonSchema/parsers/BaseParser.ts` (new)
- `src/utils/is.ts` (modify - add builder type guards)
- `src/Types.ts` (modify - add processor config types)

### Phase 2: Convert Existing Parsers (Week 2-3)

Convert each parser function to class:

1. **Primitive parsers**
   - StringParser
   - NumberParser
   - BooleanParser
   - NullParser

2. **Structured parsers**
   - ObjectParser
   - ArrayParser

3. **Combinator parsers**
   - UnionParser (anyOf)
   - IntersectionParser (allOf)
   - XorParser (oneOf)

**Files**:
- `src/JsonSchema/parsers/ObjectParser.ts` (new)
- `src/JsonSchema/parsers/ArrayParser.ts` (new)
- `src/JsonSchema/parsers/StringParser.ts` (new)
- ... one file per parser class

### Phase 3: Parser Registry and Selection (Week 3)

1. **Parser registry**
   - Map schema types to parser classes
   - Parser selection logic

2. **Update parseSchema()**
   - Instantiate parser class
   - Call parse() method

3. **Symmetric parse API**
   - Create `parse` object
   - Mirror `build` API

**Files**:
- `src/JsonSchema/parsers/registry.ts` (new)
- `src/JsonSchema/parsers/parseSchema.ts` (modify - use registry)
- `src/JsonSchema/parsers/index.ts` (modify - export parse API)

### Phase 4: Post-Processor Integration (Week 4)

1. **Post-processor types**
   - PostProcessor function signature
   - ProcessorConfig with filters
   - PostProcessorContext

2. **Context updates**
   - Add postProcessors to Context
   - Thread through toZod()

3. **Early filtering implementation**
   - Path pattern matching
   - Type filter checking

**Files**:
- `src/PostProcessing/types.ts` (new)
- `src/PostProcessing/filters.ts` (new - filtering logic)
- `src/Types.ts` (modify - add to Context)
- `src/JsonSchema/toZod.ts` (modify - accept postProcessors)

### Phase 5: Testing and Migration (Week 5)

1. **Update existing tests**
   - Replace parser function calls with classes
   - Add type guard tests

2. **Add post-processor tests**
   - Unit tests for BaseParser
   - Integration tests for each parser class
   - Processor filtering tests

3. **Backward compatibility**
   - Ensure existing API still works
   - Deprecation warnings for old patterns

**Files**:
- `test/JsonSchema/parsers/*.test.ts` (modify all)
- `test/PostProcessing/*.test.ts` (new)

### Phase 6: Documentation (Week 5-6)

1. **API documentation**
2. **Migration guide**
3. **Examples**

**Files**:
- `docs/parsers.md` (new)
- `docs/post-processing.md` (new)
- `docs/migration-parser-classes.md` (new)

## Usage Examples

### Example 1: Basic Post-Processing

```typescript
import { jsonSchemaToZod } from 'x-to-zod';

const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    email: { type: 'string' },
  },
};

const result = jsonSchemaToZod(schema, {
  postProcessors: [
    // Make all objects strict (runs only for ObjectParser)
    (builder) => is.objectBuilder(builder) ? builder.strict() : undefined,

    // Validate email fields (runs only at matching paths)
    (builder, ctx) => {
      if (ctx.matchPath('$..email') && is.stringBuilder(builder)) {
        return builder.email().toLowerCase();
      }
    },
  ],
});

// Output: z.object({ name: z.string(), email: z.string().email().toLowerCase() }).strict()
```

### Example 2: Processor with Early Filtering

```typescript
const result = jsonSchemaToZod(schema, {
  postProcessors: [
    {
      // This processor only runs for string builders at paths matching $..id
      pathPattern: '$..id',
      typeFilter: 'string',
      processor: (builder) => builder.brand('ID').uuid(),
    },

    {
      // This only runs for objects under $.properties.metadata
      pathPattern: '$.properties.metadata.**',
      typeFilter: 'object',
      processor: (builder) => builder.partial(), // Make all fields optional
    },
  ],
});
```

### Example 3: Using Type Guards

```typescript
// Processor with proper type narrowing
const strictObjects: PostProcessor = (builder, ctx) => {
  if (is.objectBuilder(builder)) {
    // TypeScript knows builder is ObjectBuilder here
    return builder.strict();
  }

  if (is.arrayBuilder(builder)) {
    // TypeScript knows builder is ArrayBuilder here
    return builder.nonempty();
  }
};
```

### Example 4: Pre-Processors

```typescript
const result = jsonSchemaToZod(schema, {
  preProcessors: [
    // Transform schema before parsing
    (schema, refs) => {
      // Add format: 'email' to all fields named 'email'
      if (its.object(schema) && schema.properties) {
        for (const [key, prop] of Object.entries(schema.properties)) {
          if (key === 'email' && its.string(prop)) {
            return {
              ...schema,
              properties: {
                ...schema.properties,
                [key]: { ...prop, format: 'email' },
              },
            };
          }
        }
      }
    },
  ],
});
```

## API Reference

### BaseParser

```typescript
abstract class BaseParser {
  constructor(schema: JsonSchema, refs: Context);

  // Main entry point
  parse(): ZodBuilder;

  // Template method hooks (override in subclasses)
  protected abstract parseImpl(schema: JsonSchema): ZodBuilder;
  protected canProduceType(type: string): boolean;

  // Common logic (used by all parsers)
  protected applyPreProcessors(schema: JsonSchema): JsonSchema;
  protected applyPostProcessors(builder: ZodBuilder): ZodBuilder;
  protected applyMetadata(builder: ZodBuilder, schema: JsonSchema): ZodBuilder;

  // Utilities
  protected parseChild(schema: JsonSchema, pathSegment: string | number): ZodBuilder;
  protected createChildContext(pathSegment: string | number): Context;
}
```

### Type Guards

```typescript
export const is = {
  // Builder type guards
  objectBuilder(value: unknown): value is ObjectBuilder;
  stringBuilder(value: unknown): value is StringBuilder;
  arrayBuilder(value: unknown): value is ArrayBuilder;
  numberBuilder(value: unknown): value is NumberBuilder;
  unionBuilder(value: unknown): value is UnionBuilder;
  // ... more ...
};
```

### Parser API

```typescript
export const parse = {
  schema(schema: JsonSchema, refs: Context): ZodBuilder;
  object(schema: JsonSchema, refs: Context): ObjectBuilder;
  array(schema: JsonSchema, refs: Context): ArrayBuilder;
  string(schema: JsonSchema, refs: Context): StringBuilder;
  // ... more ...
};
```

## Breaking Changes

### Minor (Internal API)

- Parser functions become classes (internal implementation)
- `instanceof` replaced with type guards (internal)

### None (Public API)

- `jsonSchemaToZod()` signature unchanged
- Existing options still work
- Post-processors are opt-in

## Migration Guide

### For Library Users

No changes needed - public API is unchanged. Optionally add post-processors:

```typescript
// Before
const result = jsonSchemaToZod(schema);

// After (with post-processing)
const result = jsonSchemaToZod(schema, {
  postProcessors: [/* ... */],
});
```

### For Library Contributors

If extending parsers:

```typescript
// Before
function parseCustom(schema: JsonSchema, refs: Context): ZodBuilder {
  // ...
}

// After
class CustomParser extends BaseParser {
  protected parseImpl(schema: JsonSchema): ZodBuilder {
    // ...
  }
}

// Register
parserRegistry.set('custom', CustomParser);
```

## Testing Strategy

1. **Unit tests per parser class**
   - Each parser in isolation
   - Pre/post-processor application
   - Type guard behavior

2. **Integration tests**
   - End-to-end with complex schemas
   - Multiple post-processors
   - Processor filtering

3. **Regression tests**
   - All existing tests should pass
   - Output unchanged for non-post-processed schemas

## Performance Considerations

1. **Early filtering**: Only run applicable processors (5-10x faster for targeted processors)
2. **Class instantiation overhead**: Minimal (~1-2% overhead)
3. **Type guard performance**: Similar to instanceof
4. **Processor caching**: Filtered processors cached per parser instance

## Success Criteria

- [ ] All parsers converted to classes
- [ ] BaseParser handles common logic (no duplication)
- [ ] Post-processors work with all parser types
- [ ] Early filtering reduces unnecessary processor calls
- [ ] Type guards replace all instanceof checks
- [ ] Symmetric parse/build API
- [ ] 100% test coverage maintained
- [ ] Zero performance regression for non-post-processed schemas
- [ ] Documentation with 10+ examples

## Open Questions

1. **Processor filtering**: Always filter, or opt-in via metadata?
2. **Type guard implementation**: instanceof vs duck typing vs brand checks?
3. **Parser registry**: Static map or runtime registration?
4. **Backward compatibility**: Support old parser function imports?

## Future Enhancements

1. **Parser plugins**: Register custom parsers externally
2. **Async parsers**: Support async pre/post-processors
3. **Parser composition**: Combine multiple parsers
4. **Performance profiling**: Built-in metrics for processor performance
