# Enhancement 003: Post-Processing API

## Overview

Add a post-processing API integrated into the parser architecture that allows manipulation of ZodBuilders during parsing. This enables advanced use cases like builder transformation, optimization, validation, and conditional modifications based on path and type.

**Note**: This enhancement is implemented as part of [Refactor 008: Parser Class Architecture](./refactor-008-parser-class-architecture.md), which provides the foundation for integrated pre/post-processing.

## Motivation

### Current Limitations

1. **No builder manipulation**: Once parsers create builders, there's no way to modify them
2. **Limited customization**: `parserOverride` is all-or-nothing replacement
3. **No conditional logic**: Can't apply transformations based on path or schema context
4. **No builder inspection**: Can't analyze builders before code generation

### Use Cases

1. **Global transformations**: Add `.strict()` to all objects, `.brand()` to all strings
2. **Conditional modifications**: Apply `.optional()` based on path patterns
3. **Builder optimization**: Flatten unnecessary unions, merge intersections
4. **Tree analysis**: Generate metrics, validate schema patterns
5. **Code generation control**: Inject custom code at specific paths
6. **Pre-generation validation**: Ensure builder tree meets project standards

## Design

**See [Refactor 008: Parser Class Architecture](./refactor-008-parser-class-architecture.md) for implementation details.**

### Architecture Overview

Post-processors are integrated directly into the parser architecture via `BaseParser`:

```
JSON Schema
    ↓
Parser Class (extends BaseParser)
    ├─ applyPreProcessors() → Transform schema
    ├─ parseImpl() → Create builder
    └─ applyPostProcessors() → Transform builder
    ↓
ZodBuilder → text() → Code String
```

### Core API

#### Post-Processor Function

```typescript
/**
 * Transform a builder during parsing
 * @param builder - The builder just created by the parser
 * @param context - Parsing context with path, schema, etc.
 * @returns Modified builder or undefined to keep unchanged
 */
type PostProcessor = (
  builder: ZodBuilder,
  context: PostProcessorContext
) => ZodBuilder | undefined;

interface PostProcessorContext {
  /** Current path in schema (e.g., ['properties', 'user', 'properties', 'name']) */
  path: (string | number)[];

  /** Path as string (e.g., '$.properties.user.properties.name') */
  pathString: string;

  /** Original JSON Schema that produced this builder */
  schema: JsonSchema;

  /** Builder factory (for creating new builders) */
  build: typeof buildV3 | typeof buildV4;

  /** Check if current path matches pattern */
  matchPath: (pattern: string) => boolean;
}
```

#### Optional Processor Configuration

For early filtering and optimization:

```typescript
interface PostProcessorConfig {
  /** The processor function */
  processor: PostProcessor;

  /** Only apply if path matches (early filtering for performance) */
  pathPattern?: string | string[];

  /** Only apply to specific builder types (early filtering) */
  typeFilter?: string | string[];
}

// Usage - can be just a function or config object
type PostProcessorInput = PostProcessor | PostProcessorConfig;
```

#### Path Pattern Syntax

```typescript
// JSONPath-inspired patterns for matching builder paths

"$"                          // Root builder
"$.properties.user"          // Specific path
"$.properties.*"             // All properties (wildcard)
"$.properties.**"            // All descendants of properties
"$..email"                   // Any 'email' field (recursive)
"$.properties.metadata.**"   // All descendants of metadata
```

### Integration

```typescript
// In toZod() function
export function toZod(
  schema: JSONSchema,
  {
    // ... existing options ...
    postProcessors, // [NEW]
  }: ToZodOptions = {}
): string {
  const refs: Context = {
    // ... existing context ...
    postProcessors, // Added to context
  };

  // Parse schema (post-processors applied during parsing via BaseParser)
  const builder = parseSchema(schema, refs);

  // Generate code
  return builder.text();
}
```

## Implementation Plan

**Note**: Core implementation is part of [Refactor 008](./refactor-008-parser-class-architecture.md). This plan covers post-processing-specific additions.

### Phase 1: Path Matching Utilities (Week 1)

1. **Path Pattern Parser**
   - JSONPath-style pattern matching
   - Support wildcards (`*`), recursive descent (`**`)
   - Pattern compilation and caching

2. **Path Matching Function**
   - `matchPath(path: string[], pattern: string): boolean`
   - Used in PostProcessorContext

**Files**:
- `src/PostProcessing/pathMatcher.ts` (new)
- `src/PostProcessing/pathParser.ts` (new)

### Phase 2: Helper Utilities (Week 1-2)

1. **Pre-built Post-Processors**
   - `makeAllOptional()`
   - `strictObjects()`
   - `brandAllIds()`
   - Common transformation patterns

2. **Type Guards for Builders**
   - Part of refactor-008
   - Used in post-processors for type checking

**Files**:
- `src/PostProcessing/presets.ts` (new)
- `src/utils/is.ts` (modify - part of refactor-008)

### Phase 3: Documentation & Testing (Week 2)

1. **Documentation**
   - User guide with examples
   - API reference
   - Common patterns

2. **Tests**
   - Path matching tests
   - Preset post-processors tests
   - Integration with parser classes

**Files**:
- `docs/post-processing.md` (new)
- `test/PostProcessing/pathMatcher.test.ts` (new)
- `test/PostProcessing/presets.test.ts` (new)
- `test/PostProcessing/integration.test.ts` (new)

## Usage Examples

### Example 1: Make All Properties Optional

```typescript
import { jsonSchemaToZod } from 'x-to-zod';

const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'number' }
  }
};

const result = jsonSchemaToZod(schema, {
  postProcessors: [
    (builder, ctx) => {
      // Match all properties
      if (ctx.matchPath('$.properties.*')) {
        return builder.optional();
      }
    }
  ]
});

// Output: z.object({ name: z.string().optional(), age: z.number().optional() })
```

### Example 2: Add Branding to Specific Fields

```typescript
import { is } from 'x-to-zod/utils';

const result = jsonSchemaToZod(schema, {
  postProcessors: [
    (builder, ctx) => {
      if (ctx.matchPath('$.properties.userId') && is.stringBuilder(builder)) {
        return builder.brand('UserId').uuid();
      }
    }
  ]
});
```

### Example 3: Make All Objects Strict

```typescript
import { is } from 'x-to-zod/utils';

const result = jsonSchemaToZod(schema, {
  postProcessors: [
    (builder) => {
      // Use type guard instead of instanceof
      if (is.objectBuilder(builder)) {
        return builder.strict();
      }
    }
  ]
});
```

### Example 4: Email Field Validation

```typescript
import { is } from 'x-to-zod/utils';

const result = jsonSchemaToZod(schema, {
  postProcessors: [
    (builder, ctx) => {
      // All email fields get validated and lowercased
      if (ctx.matchPath('$..email') && is.stringBuilder(builder)) {
        return builder.email().toLowerCase();
      }
    }
  ]
});
```

### Example 5: Multiple Transformations

```typescript
import { is } from 'x-to-zod/utils';

const result = jsonSchemaToZod(schema, {
  postProcessors: [
    // Make all objects strict
    (builder) => is.objectBuilder(builder) ? builder.strict() : undefined,

    // Make all arrays non-empty
    (builder) => is.arrayBuilder(builder) ? builder.nonempty() : undefined,

    // Brand all ID fields
    (builder, ctx) => {
      if (ctx.matchPath('$..id') && is.stringBuilder(builder)) {
        return builder.brand('ID').uuid();
      }
    },

    // Optional metadata fields
    (builder, ctx) => {
      if (ctx.matchPath('$.properties.metadata.**')) {
        return builder.optional();
      }
    }
  ]
});
```

### Example 6: Using Pre-built Helpers

```typescript
import { postProcessors } from 'x-to-zod/post-processing';

const result = jsonSchemaToZod(schema, {
  postProcessors: [
    postProcessors.strictObjects(),
    postProcessors.brandIds(),
    postProcessors.makeOptional('$.properties.metadata.**'),
  ]
});
```

## API Reference

### PostProcessor Function

```typescript
type PostProcessor = (
  builder: ZodBuilder,
  context: PostProcessorContext
) => ZodBuilder | undefined;
```

### PostProcessorContext

```typescript
interface PostProcessorContext {
  path: (string | number)[];
  pathString: string;
  schema: JsonSchema;
  build: typeof buildV3 | typeof buildV4;
  matchPath: (pattern: string) => boolean;
}
```

### Pre-built Helpers

```typescript
// src/PostProcessing/presets.ts
export const postProcessors = {
  /** Make all objects strict */
  strictObjects: () => PostProcessor,

  /** Make all arrays non-empty */
  nonemptyArrays: () => PostProcessor,

  /** Brand all ID fields */
  brandIds: (brand?: string) => PostProcessor,

  /** Make fields at pattern optional */
  makeOptional: (pattern: string) => PostProcessor,

  /** Make fields at pattern required (remove .optional()) */
  makeRequired: (pattern: string) => PostProcessor,

  /** Apply transformation to matching paths */
  matchPath: (pattern: string, transform: PostProcessor) => PostProcessor,
};
```

### Type Guards

```typescript
// src/utils/is.ts
export const is = {
  objectBuilder(value: unknown): value is ObjectBuilder;
  stringBuilder(value: unknown): value is StringBuilder;
  arrayBuilder(value: unknown): value is ArrayBuilder;
  numberBuilder(value: unknown): value is NumberBuilder;
  unionBuilder(value: unknown): value is UnionBuilder;
  // ... more builder type guards
};
```

### Path Patterns

```typescript
// Common path patterns
"$"                          // Root
"$.properties.*"             // All top-level properties
"$.properties.**"            // All nested under properties
"$..fieldName"               // Any field named 'fieldName'
"$.properties.user.properties.email"  // Specific path
```

## Breaking Changes

None - this is a purely additive enhancement.

## Migration Guide

Existing code continues to work unchanged. To use post-processing:

```typescript
// Before
const result = jsonSchemaToZod(schema);

// After (with post-processing)
const result = jsonSchemaToZod(schema, {
  postProcessors: [
    // Your post-processors here
  ]
});
```

## Testing Strategy

1. **Unit Tests**:
   - Path pattern matching (`matchPath` function)
   - Pre-built post-processors (presets)
   - Type guards (`is.*Builder`)
   - Early processor filtering

2. **Integration Tests**:
   - Post-processors with parser classes (from refactor-008)
   - Multi-processor pipelines
   - Complex schemas with multiple transformations
   - Error handling

3. **Performance Tests**:
   - Early filtering effectiveness
   - Large schema processing
   - Multiple post-processors

## Performance Considerations

1. **Early filtering**: Only run processors that match path/type (part of refactor-008)
2. **Pattern caching**: Compile and cache path patterns
3. **Bottom-up processing**: Builders processed during parsing (natural tree construction)
4. **No double-traversal**: Post-processors run during parsing, not as separate phase

## Open Questions

1. **Error handling**: Fail fast or collect processor errors?
2. **Processor ordering**: Guaranteed order of execution?
3. **Builder mutability**: In-place modification or always return new builder?
4. **Pattern syntax**: Support full JSONPath or limited subset?

## Success Criteria

- [ ] Path pattern matching supports common patterns (`*`, `**`, specific paths)
- [ ] Post-processors integrate cleanly with BaseParser
- [ ] Type guards work for all builder types
- [ ] Pre-built helpers cover common use cases
- [ ] Early filtering reduces unnecessary processor calls
- [ ] Documentation with 10+ examples
- [ ] 95%+ test coverage
- [ ] Zero performance regression for non-post-processed schemas
- [ ] Backward compatible (no breaking changes)
