# Enhancement 003: Post-Processing API

## Overview

Add a post-processing API that allows manipulation of the ZodBuilder tree before final code generation. This enables advanced use cases like builder transformation, optimization, validation, and tree traversal using path-based queries.

## Motivation

### Current Limitations

1. **No pre-output manipulation**: Once parsers create the builder tree, there's no way to modify it before `text()` is called
2. **No tree traversal utilities**: No standard way to navigate the builder tree structure
3. **Limited customization point**: `parserOverride` works during parsing, but not after the complete tree is built
4. **No builder inspection**: Can't analyze or validate the builder tree before code generation

### Use Cases

1. **Global transformations**: Add `.strict()` to all objects, `.brand()` to all strings
2. **Conditional modifications**: Apply `.optional()` based on path patterns
3. **Builder optimization**: Flatten unnecessary unions, merge intersections
4. **Tree analysis**: Generate metrics, validate schema patterns
5. **Code generation control**: Inject custom code at specific paths
6. **Pre-generation validation**: Ensure builder tree meets project standards

## Design

### Architecture Overview

```
JSON Schema
    ↓
parseSchema() → ZodBuilder Tree
    ↓
[NEW] Post-Processors Pipeline
    ├─ Tree Traversal (path-based)
    ├─ Builder Transformation
    ├─ Builder Validation
    └─ Modified ZodBuilder Tree
    ↓
builder.text() → Code String
    ↓
Module Wrapper → Output
```

### Core Components

#### 1. Path Syntax for Builder Tree Traversal

**Path Format**: JSONPath-inspired syntax for navigating builder trees

```typescript
// Path examples
"$"                          // Root builder
"$.properties.user"          // Object property
"$.properties.*"             // All properties (wildcard)
"$.properties.**.name"       // Recursive descent to 'name'
"$.items"                    // Array items
"$.options[0]"               // Union/intersection options by index
"$.options[*]"               // All union options
"$..string"                  // All string builders (recursive)
"$.properties[?(@.optional)]" // Filter: optional properties
```

**Path Components**:
- `$`: Root builder
- `.property`: Object property access
- `[index]`: Array/tuple index
- `[*]`: Wildcard (all children)
- `..`: Recursive descent
- `[?(...)]`: Filter expression
- Type selectors: `.string`, `.number`, `.object`, etc.

#### 2. Post-Processor API

**Core Interface**:

```typescript
/**
 * Post-processor function signature
 * @param builder - The builder at the current path
 * @param context - Traversal context with path, parent, etc.
 * @returns Modified builder, null to remove, or undefined to keep unchanged
 */
type PostProcessor = (
  builder: ZodBuilder,
  context: PostProcessorContext
) => ZodBuilder | null | undefined;

interface PostProcessorContext {
  /** Current path in builder tree (e.g., ['properties', 'user', 'properties', 'name']) */
  path: (string | number)[];

  /** Path as string (e.g., '$.properties.user.properties.name') */
  pathString: string;

  /** Parent builder (null if root) */
  parent: ZodBuilder | null;

  /** Original JSON Schema that produced this builder */
  schema: JsonSchema | undefined;

  /** Builder factory (for creating new builders) */
  build: typeof buildV3 | typeof buildV4;

  /** Zod version being targeted */
  zodVersion: 'v3' | 'v4';

  /** Helper to match path patterns */
  matchPath: (pattern: string) => boolean;

  /** Helper to get child builders */
  getChildren: () => ZodBuilder[];

  /** Helper to replace current builder */
  replace: (newBuilder: ZodBuilder) => void;

  /** Helper to traverse to specific path */
  traverse: (path: string) => ZodBuilder | undefined;
}
```

**Post-Processor Types**:

```typescript
/** Visitor pattern - called for each builder in tree */
interface VisitorPostProcessor {
  type: 'visitor';
  visit: PostProcessor;
  /** Optional filter to limit which builders are visited */
  filter?: (builder: ZodBuilder, context: PostProcessorContext) => boolean;
}

/** Path-based transformer - targets specific paths */
interface PathPostProcessor {
  type: 'path';
  /** Path pattern (supports wildcards, recursion) */
  pattern: string | string[];
  /** Transform function for matched paths */
  transform: PostProcessor;
}

/** Interceptor - wraps parser output before tree assembly */
interface ParserInterceptor {
  type: 'interceptor';
  /** Parser name to intercept (e.g., 'parseObject', 'parseString') */
  parser: string | string[];
  /** Transform builder immediately after parser returns */
  intercept: (builder: ZodBuilder, schema: JsonSchema, context: Context) => ZodBuilder;
}

type PostProcessorConfig =
  | VisitorPostProcessor
  | PathPostProcessor
  | ParserInterceptor
  | PostProcessor; // Shorthand for visitor
```

#### 3. Builder Tree Traversal API

**TreeWalker Class**:

```typescript
class BuilderTreeWalker {
  constructor(root: ZodBuilder);

  /** Find all builders matching path pattern */
  find(pattern: string): BuilderMatch[];

  /** Find first builder matching pattern */
  findOne(pattern: string): BuilderMatch | null;

  /** Traverse tree with visitor */
  walk(visitor: (builder: ZodBuilder, context: PostProcessorContext) => void): void;

  /** Transform tree with post-processor */
  transform(processor: PostProcessor): ZodBuilder;

  /** Query tree with filter predicate */
  filter(predicate: (builder: ZodBuilder, context: PostProcessorContext) => boolean): BuilderMatch[];

  /** Get all descendant builders */
  descendants(): BuilderMatch[];

  /** Get direct children */
  children(): BuilderMatch[];

  /** Apply multiple post-processors in sequence */
  pipe(...processors: PostProcessorConfig[]): ZodBuilder;
}

interface BuilderMatch {
  builder: ZodBuilder;
  path: (string | number)[];
  pathString: string;
  parent: ZodBuilder | null;
  context: PostProcessorContext;
}
```

#### 4. Parser Interception

**Intercept builders at parse time** (before tree assembly):

```typescript
interface ParserInterceptorRegistry {
  /** Register interceptor for specific parser */
  register(parserName: string, interceptor: ParserInterceptor['intercept']): void;

  /** Intercept all parsers */
  registerGlobal(interceptor: ParserInterceptor['intercept']): void;

  /** Remove interceptor */
  unregister(parserName: string): void;
}

// Integration in parseSchema()
function parseSchema(schema: JsonSchema, refs: Context): ZodBuilder {
  // ... existing parser selection ...
  let builder = selectedParser(schema, refs);

  // [NEW] Apply parser-specific interceptors
  if (refs.parserInterceptors?.has(parserName)) {
    const interceptor = refs.parserInterceptors.get(parserName);
    builder = interceptor(builder, schema, refs);
  }

  // [NEW] Apply global interceptors
  for (const interceptor of refs.globalInterceptors || []) {
    builder = interceptor(builder, schema, refs);
  }

  return builder;
}
```

### Integration Points

#### Updated `toZod()` Function

```typescript
export function toZod(
  schema: JSONSchema,
  {
    // ... existing options ...

    // [NEW] Post-processing options
    postProcessors,
    parserInterceptors,

  }: ToZodOptions = {}
): string {
  const build = zodVersion === 'v3' ? buildV3 : buildV4;

  const refs: Context = {
    build,
    path: [],
    seen: new Map(),
    zodVersion,
    preprocessors,
    parserOverride,

    // [NEW] Add interceptors to context
    parserInterceptors: new Map(parserInterceptors || []),
    globalInterceptors: globalInterceptors || [],
  };

  // Parse schema into builder tree
  let builder = parseSchema(schema, refs);

  // [NEW] Apply post-processors
  if (postProcessors && postProcessors.length > 0) {
    const walker = new BuilderTreeWalker(builder);
    builder = walker.pipe(...postProcessors);
  }

  // Generate code from (possibly modified) builder
  const zodSchema = builder.text();

  // ... module wrapping ...
}
```

#### Updated Options Type

```typescript
interface ToZodOptions {
  // ... existing options ...

  /**
   * Post-processors to apply to builder tree before code generation
   * Applied in array order (pipeline)
   */
  postProcessors?: PostProcessorConfig[];

  /**
   * Parser interceptors - transform builders immediately after parsing
   * Map of parser name → interceptor function
   */
  parserInterceptors?: Map<string, ParserInterceptor['intercept']>;

  /**
   * Global interceptors - applied to all parsers
   */
  globalInterceptors?: ParserInterceptor['intercept'][];
}
```

## Implementation Plan

### Phase 1: Tree Traversal Foundation

1. **Builder Tree Introspection API**
   - Add `getChildren()` method to BaseBuilder
   - Implement for ObjectBuilder, ArrayBuilder, UnionBuilder, etc.
   - Add builder type metadata (`.builderType: 'object' | 'string' | ...`)

2. **Path Parser**
   - Implement JSONPath parser for builder tree paths
   - Support wildcards (`*`), recursive descent (`..`), filters
   - Path matching algorithm

3. **TreeWalker Implementation**
   - Depth-first traversal with context tracking
   - Path tracking and string conversion
   - Basic find/filter operations

**Files to Create/Modify**:
- `src/PostProcessing/TreeWalker.ts` (new)
- `src/PostProcessing/PathParser.ts` (new)
- `src/ZodBuilder/BaseBuilder.ts` (modify - add `getChildren()`, metadata)

### Phase 2: Post-Processor Pipeline

1. **Post-Processor Types & Interfaces**
   - Define all types from design above
   - Implement PostProcessorContext builder

2. **Post-Processor Executor**
   - Apply visitor pattern processors
   - Apply path-based processors (with pattern matching)
   - Handle builder replacement/removal
   - Error handling and validation

3. **Builder Cloning/Immutability**
   - Optional immutable mode (clone before modify)
   - Deep clone utility for builders

**Files to Create**:
- `src/PostProcessing/types.ts`
- `src/PostProcessing/PostProcessorExecutor.ts`
- `src/PostProcessing/utils.ts`

### Phase 3: Parser Interception

1. **Interceptor Registry**
   - Implement registry with per-parser and global interceptors
   - Integration in parseSchema()

2. **Context Enhancement**
   - Add interceptor fields to Context type
   - Thread through parser calls

**Files to Modify**:
- `src/Types.ts` (add interceptor fields to Context)
- `src/JsonSchema/parsers/parseSchema.ts` (apply interceptors)

### Phase 4: Integration & API

1. **Update toZod() Function**
   - Add postProcessors parameter
   - Integrate TreeWalker
   - Apply post-processing pipeline

2. **Convenience Utilities**
   - Pre-built post-processors (e.g., `makeAllOptional`, `addBranding`)
   - Path pattern helpers
   - Builder transformation utilities

**Files to Create/Modify**:
- `src/JsonSchema/toZod.ts` (modify)
- `src/PostProcessing/index.ts` (new - public API)
- `src/PostProcessing/presets.ts` (new - pre-built processors)

### Phase 5: Documentation & Testing

1. **Unit Tests**
   - TreeWalker tests (path matching, traversal)
   - Post-processor execution tests
   - Parser interceptor tests

2. **Integration Tests**
   - End-to-end with complex schemas
   - Multi-processor pipelines

3. **Documentation**
   - API reference
   - Usage examples
   - Migration guide

**Files to Create**:
- `test/PostProcessing/TreeWalker.test.ts`
- `test/PostProcessing/PostProcessor.test.ts`
- `test/PostProcessing/integration.test.ts`
- `docs/post-processing.md`

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
    {
      type: 'path',
      pattern: '$.properties.*',
      transform: (builder) => builder.optional()
    }
  ]
});

// Output: z.object({ name: z.string().optional(), age: z.number().optional() })
```

### Example 2: Add Branding to Specific Fields

```typescript
const result = jsonSchemaToZod(schema, {
  postProcessors: [
    {
      type: 'path',
      pattern: '$.properties.userId',
      transform: (builder, ctx) => {
        if (builder instanceof StringBuilder) {
          return builder.brand('UserId');
        }
      }
    }
  ]
});
```

### Example 3: Visitor Pattern - Add Descriptions

```typescript
const result = jsonSchemaToZod(schema, {
  postProcessors: [
    (builder, ctx) => {
      // Add path-based description to all builders
      return builder.describe(`Generated from path: ${ctx.pathString}`);
    }
  ]
});
```

### Example 4: Parser Interception

```typescript
const result = jsonSchemaToZod(schema, {
  parserInterceptors: new Map([
    ['parseObject', (builder, schema, refs) => {
      // Automatically make all objects strict
      return builder.strict();
    }]
  ])
});
```

### Example 5: Complex Tree Transformation

```typescript
import { BuilderTreeWalker } from 'x-to-zod/post-processing';

const result = jsonSchemaToZod(schema, {
  postProcessors: [
    // Step 1: Find all email strings
    {
      type: 'path',
      pattern: '$..email',
      transform: (builder, ctx) => {
        if (builder instanceof StringBuilder) {
          return builder.email().toLowerCase();
        }
      }
    },

    // Step 2: Add refinement to all numbers
    {
      type: 'visitor',
      filter: (builder) => builder instanceof NumberBuilder,
      visit: (builder) => {
        return builder.refine(
          (val) => val >= 0,
          { message: 'Must be non-negative' }
        );
      }
    },

    // Step 3: Custom transformation
    (builder, ctx) => {
      const walker = new BuilderTreeWalker(builder);

      // Find all union builders with more than 5 options
      const largeUnions = walker.filter((b) =>
        b instanceof UnionBuilder && b.options.length > 5
      );

      // Log warning
      if (largeUnions.length > 0) {
        console.warn(`Found ${largeUnions.length} large unions`);
      }

      return builder; // No modification
    }
  ]
});
```

### Example 6: Conditional Modifications by Path Pattern

```typescript
const result = jsonSchemaToZod(schema, {
  postProcessors: [
    {
      type: 'path',
      pattern: '$.properties.metadata.**',
      transform: (builder, ctx) => {
        // All fields nested under 'metadata' become optional
        return builder.optional();
      }
    },
    {
      type: 'path',
      pattern: '$..id',
      transform: (builder) => {
        // All 'id' fields get branded
        if (builder instanceof StringBuilder) {
          return builder.brand('ID').uuid();
        }
      }
    }
  ]
});
```

## API Reference

### TreeWalker

```typescript
class BuilderTreeWalker {
  constructor(root: ZodBuilder);

  // Query methods
  find(pattern: string): BuilderMatch[];
  findOne(pattern: string): BuilderMatch | null;
  filter(predicate: (builder: ZodBuilder, ctx: PostProcessorContext) => boolean): BuilderMatch[];

  // Traversal methods
  walk(visitor: PostProcessor): void;
  descendants(): BuilderMatch[];
  children(): BuilderMatch[];

  // Transformation methods
  transform(processor: PostProcessor): ZodBuilder;
  pipe(...processors: PostProcessorConfig[]): ZodBuilder;

  // Utility methods
  getContext(builder: ZodBuilder): PostProcessorContext;
  matchPath(path: string, pattern: string): boolean;
}
```

### Post-Processor Helpers

```typescript
// Pre-built post-processors
export const postProcessors = {
  /** Make all properties optional */
  makeAllOptional: () => PathPostProcessor,

  /** Add branding to all strings */
  brandAllStrings: (brand: string) => PostProcessor,

  /** Make all objects strict */
  strictObjects: () => PostProcessor,

  /** Add descriptions from JSON Schema */
  preserveDescriptions: () => PostProcessor,

  /** Remove all `.optional()` modifiers */
  makeAllRequired: () => PostProcessor,

  /** Add custom refinement to all builders */
  addGlobalRefinement: (fn: RefinementFn) => PostProcessor,
};

// Path pattern utilities
export const pathPatterns = {
  /** Match all properties in objects */
  allProperties: '$.properties.*',

  /** Match all array items */
  allItems: '$.items',

  /** Match all builders of specific type */
  ofType: (type: string) => `$..${type}`,

  /** Match by field name (anywhere in tree) */
  byName: (name: string) => `$..${name}`,

  /** Match nested paths */
  nested: (...segments: string[]) => `$.${segments.join('.')}`,
};
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
   - Path parser (pattern matching)
   - TreeWalker (traversal, queries)
   - Post-processor execution
   - Builder cloning

2. **Integration Tests**:
   - Multi-processor pipelines
   - Complex tree transformations
   - Parser interception
   - Error handling

3. **Performance Tests**:
   - Large tree traversal
   - Deep nesting
   - Multiple post-processors

## Performance Considerations

1. **Lazy evaluation**: Only traverse needed paths
2. **Caching**: Memoize path matching results
3. **Immutability option**: Allow in-place modification for performance
4. **Early termination**: Stop traversal when pattern found (for `findOne`)

## Open Questions

1. **Immutability**: Should post-processors always clone builders, or allow in-place modification?
2. **Order of operations**: Should parser interceptors run before or after metadata application?
3. **Error handling**: How to handle post-processor errors? Fail fast or collect and report?
4. **Performance**: Maximum tree depth? Warning thresholds?

## Success Criteria

- [ ] TreeWalker can traverse any builder tree
- [ ] Path patterns work for all standard JSONPath features
- [ ] Post-processors can transform builders without breaking code generation
- [ ] Parser interceptors integrate cleanly with existing parsers
- [ ] Documentation with 10+ real-world examples
- [ ] 95%+ test coverage
- [ ] Zero performance regression for non-post-processed schemas
- [ ] Backward compatible (no breaking changes)
