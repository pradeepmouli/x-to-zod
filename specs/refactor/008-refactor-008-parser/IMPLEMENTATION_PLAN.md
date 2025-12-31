# Refactor 008 Implementation Plan

**Refactor ID**: refactor-008
**Title**: Parser Class Architecture with Integrated Post-Processing
**Version**: 1.0
**Created**: 2025-12-30
**Status**: Ready for Phase 0 Execution

## Executive Summary

This implementation plan provides detailed step-by-step guidance for refactoring the x-to-zod parser architecture from a functional approach to a class-based, template-method pattern implementation. The refactoring enables integrated post-processing support, reduces code duplication, and improves maintainability while preserving 100% of external behavior.

**Key Outcomes**:
- Transform 7+ parser functions into a class hierarchy
- Eliminate ~150 lines of duplicated logic
- Implement symmetric `parse` API mirroring `build`
- Enable opt-in post-processor support with early filtering
- Replace all `instanceof` checks with type guards
- Maintain >80% test coverage with zero test modifications required

**Timeline**: 5-6 weeks (6 phases, 2-5 days each)
**Risk Level**: Medium (core functionality affected, mitigated by comprehensive tests)
**Rollback**: <30 minutes RTO via git revert

---

## Phase 0: Testing Gap Assessment (2-3 days)

### Objective
Establish baseline test coverage and identify gaps before beginning refactoring to ensure behavior preservation can be validated.

### Why This Phase Matters
- Refactoring requires verifying behavior is preserved
- Low coverage areas create risk of behavioral changes going undetected
- CRITICAL: Cannot proceed to Phase 1 without adequate coverage

### Tasks

#### Task 0.1: Establish Baseline Coverage
```bash
cd /Users/pmouli/GitHub.nosync/json-schema-to-zod
npm test -- --coverage
```

**Deliverable**: Coverage report showing:
- Overall coverage percentage
- Per-file coverage
- Lines covered vs uncovered
- Branch coverage

**Success Criteria**: Report generated and reviewed

#### Task 0.2: Identify Parser Coverage Gaps
**Files to Analyze**:
- `src/JsonSchema/parsers/index.ts` - Main parser functions
- `src/JsonSchema/toZod.ts` - Entry point
- `src/utils/` - Utility functions

**For Each Parser Function**:
- parseObject() - Target: >90% coverage
- parseArray() - Target: >90% coverage
- parseString() - Target: >90% coverage
- parseNumber() / parseInt() - Target: >90% coverage
- parseBoolean() - Target: >90% coverage
- parseNull() - Target: >85% coverage
- parseAnyOf() / parseOneOf() / parseAllOf() - Target: >85% coverage

**Categorize Gaps**:
1. **Critical** (<70% coverage) - Must add tests before proceeding
2. **Important** (70-85% coverage) - Should add tests
3. **Nice-to-Have** (>85% coverage) - Document but may skip

#### Task 0.3: Add Targeted Tests for Critical Gaps

For each critical gap identified:

1. Create test case targeting missing code path
2. Test execution to verify it catches the gap
3. Document test purpose and coverage improvement

**Example Test Structure**:
```typescript
describe('parseObject - circular references', () => {
  it('should detect and handle self-references', () => {
    const schema = {
      $id: 'person',
      type: 'object',
      properties: {
        name: { type: 'string' },
        parent: { $ref: '#' }
      }
    };
    const result = parseSchema(schema, createContext());
    expect(result.toString()).toContain('z.lazy');
  });
});
```

#### Task 0.4: Verify All Tests Pass
```bash
npm test
```

**Success Criteria**:
- All tests pass: 100% pass rate
- No test failures
- No timeout issues
- All new tests included and passing

#### Task 0.5: Document Testing Status

**Update**: `specs/refactor/008-refactor-008-parser/testing-gaps.md`

```markdown
# Testing Gaps Assessment for Refactor 008

## Coverage Baseline
- Overall Coverage: X%
- Parser-Specific Coverage: X%
- Critical Tests: XX total

## Identified Gaps
### Critical (Must Fix Before Proceeding)
- [file:line] - [description] - Added test: ✅ / ❌

### Important (Should Fix)
- [file:line] - [description] - Status: Added / Deferred

## Tests Added
1. [Test name] - [file] - Coverage improvement: X% → Y%
2. [Test name] - [file] - Coverage improvement: X% → Y%

## Sign-Off
- [ ] All critical gaps addressed
- [ ] All new tests passing
- [ ] Coverage maintained or improved
- [ ] Ready for Phase 1

Date: _____________
```

### Exit Criteria
✅ All parser code has >80% coverage
✅ All critical paths have >90% coverage
✅ testing-gaps.md completed
✅ 100% test pass rate (npm test)
✅ Ready to proceed to Phase 1

### Risk & Mitigation
- **Risk**: Missing critical code paths leads to behavioral regression
- **Mitigation**: Comprehensive coverage analysis before starting refactoring
- **Rollback**: Discard any new tests if they cause issues

---

## Phase 1: Base Parser Infrastructure (3-4 days)

### Objective
Create the foundational BaseParser class and supporting infrastructure that all specific parsers will inherit from.

### Overview
This phase establishes the framework that will eliminate code duplication. All parser functions will eventually extend BaseParser, inheriting common behaviors for metadata application, processor handling, and circular reference detection.

### Architecture

```
BaseParser (abstract)
  ├── Constructor: Initialize and filter processors
  ├── parse(): Template method pattern
  │   ├── applyPreProcessors(schema)
  │   ├── parseImpl(schema) [abstract - implemented by subclasses]
  │   ├── applyPostProcessors(builder)
  │   └── applyMetadata(builder, schema)
  ├── filterPreProcessors(): Early filter applicable processors
  ├── filterPostProcessors(): Early filter applicable processors
  └── createChildContext(): For nested schema parsing

ObjectParser, ArrayParser, StringParser, etc. (concrete)
  └── parseImpl(schema): Specific parsing logic
```

### Tasks

#### Task 1.1: Create BaseParser Abstract Class

**File**: `src/JsonSchema/parsers/BaseParser.ts` (NEW)

```typescript
/**
 * Abstract base class for all JSON Schema parsers
 * Implements template method pattern for common parsing logic
 */
export abstract class BaseParser {
  protected preProcessors: PreProcessor[] = [];
  protected postProcessors: PostProcessor[] = [];

  constructor(
    protected schema: JsonSchema,
    protected refs: Context
  ) {
    // Filter processors that could apply to this parser type
    this.preProcessors = this.filterPreProcessors(refs.preProcessors);
    this.postProcessors = this.filterPostProcessors(refs.postProcessors);
  }

  /**
   * Main entry point - template method pattern
   * 1. Apply pre-processors to transform schema
   * 2. Parse using subclass-specific logic
   * 3. Apply post-processors to transform builder
   * 4. Apply metadata (descriptions, defaults, etc.)
   */
  parse(): ZodBuilder {
    const processedSchema = this.applyPreProcessors(this.schema);
    let builder = this.parseImpl(processedSchema);
    builder = this.applyPostProcessors(builder);
    builder = this.applyMetadata(builder, processedSchema);
    return builder;
  }

  /**
   * Subclass must implement actual parsing logic
   */
  protected abstract parseImpl(schema: JsonSchema): ZodBuilder;

  /**
   * Apply all applicable pre-processors to schema
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
   * Apply all applicable post-processors to builder
   */
  protected applyPostProcessors(builder: ZodBuilder): ZodBuilder {
    let result = builder;
    for (const processor of this.postProcessors) {
      const processed = processor(result, {
        path: this.refs.path,
        schema: this.schema,
        build: this.refs.build,
      });
      if (processed !== undefined) {
        result = processed;
      }
    }
    return result;
  }

  /**
   * Apply metadata: descriptions, defaults, examples, etc.
   */
  protected applyMetadata(
    builder: ZodBuilder,
    schema: JsonSchema
  ): ZodBuilder {
    let result = builder;
    
    if (schema.description) {
      result = result.describe(schema.description);
    }
    
    if ('default' in schema && schema.default !== undefined) {
      result = result.default(schema.default);
    }
    
    return result;
  }

  /**
   * Filter pre-processors that could apply to this parser
   * Override in subclasses for more sophisticated filtering
   */
  protected filterPreProcessors(
    processors: PreProcessor[] = []
  ): PreProcessor[] {
    return processors.filter(p => this.isProcessorApplicable(p));
  }

  /**
   * Filter post-processors that could apply to this parser
   * Only keep processors that match this parser's type
   */
  protected filterPostProcessors(
    processors: PostProcessorConfig[] = []
  ): PostProcessor[] {
    return processors
      .filter(config => {
        // If processor has typeFilter, check if we match
        if (config.typeFilter) {
          const types = Array.isArray(config.typeFilter)
            ? config.typeFilter
            : [config.typeFilter];
          return types.some(t => this.canProduceType(t));
        }
        return true;
      })
      .map(config => 
        typeof config === 'function' ? config : config.processor
      );
  }

  /**
   * Check if processor could apply to this parser
   */
  protected isProcessorApplicable(processor: ProcessorConfig): boolean {
    // If processor has path pattern, check current path
    if (processor.pathPattern) {
      const patterns = Array.isArray(processor.pathPattern)
        ? processor.pathPattern
        : [processor.pathPattern];
      // Simple pattern matching - can be enhanced
      return patterns.some(p => this.matchesPath(p));
    }
    return true;
  }

  /**
   * Check if this parser can produce a specific builder type
   * Override in subclasses for type-specific filtering
   */
  protected canProduceType(type: string): boolean {
    return false; // Base implementation - override in subclasses
  }

  /**
   * Simple path matching
   */
  private matchesPath(pattern: string): boolean {
    const currentPath = (this.refs.path || []).join('.');
    // Simple wildcard matching - can be enhanced
    return currentPath === pattern || pattern === '*';
  }

  /**
   * Create context for child parser
   */
  protected createChildContext(
    pathSegment: string | number
  ): Context {
    return {
      ...this.refs,
      path: [...(this.refs.path || []), pathSegment],
    };
  }

  /**
   * Parse child schema (recursive)
   */
  protected parseChild(
    schema: JsonSchema,
    pathSegment: string | number
  ): ZodBuilder {
    return parseSchema(schema, this.createChildContext(pathSegment));
  }
}
```

**Acceptance Criteria**:
- [ ] BaseParser compiles without errors
- [ ] All abstract methods defined
- [ ] Template method pattern clear
- [ ] Pre/post-processor hooks in place
- [ ] Metadata application implemented
- [ ] Processor filtering logic in place

#### Task 1.2: Add Builder Type Guards

**File**: `src/utils/is.ts` (MODIFY - add new exports)

```typescript
/**
 * Builder type guards - use instead of instanceof
 */
export const is = {
  objectBuilder: (value: unknown): value is ObjectBuilder => {
    return value instanceof ObjectBuilder;
  },

  arrayBuilder: (value: unknown): value is ArrayBuilder => {
    return value instanceof ArrayBuilder;
  },

  stringBuilder: (value: unknown): value is StringBuilder => {
    return value instanceof StringBuilder;
  },

  numberBuilder: (value: unknown): value is NumberBuilder => {
    return value instanceof NumberBuilder;
  },

  booleanBuilder: (value: unknown): value is BooleanBuilder => {
    return value instanceof BooleanBuilder;
  },

  nullBuilder: (value: unknown): value is NullBuilder => {
    return value instanceof NullBuilder;
  },

  unionBuilder: (value: unknown): value is UnionBuilder => {
    return value instanceof UnionBuilder;
  },

  intersectionBuilder: (value: unknown): value is IntersectionBuilder => {
    return value instanceof IntersectionBuilder;
  },

  lazyBuilder: (value: unknown): value is LazyBuilder => {
    return value instanceof LazyBuilder;
  },
};
```

**Acceptance Criteria**:
- [ ] All builder types have type guards
- [ ] Type guards export from is module
- [ ] Type guards compile and work correctly
- [ ] Can be imported and used in processor code

#### Task 1.3: Add Processor Types

**File**: `src/Types.ts` (MODIFY - add new types)

```typescript
/**
 * Pre-processor: transforms schema before parsing
 */
export type PreProcessor = (
  schema: JsonSchema,
  refs: Context
) => JsonSchema | undefined;

/**
 * Post-processor: transforms builder after parsing
 */
export type PostProcessor = (
  builder: ZodBuilder,
  context: PostProcessorContext
) => ZodBuilder | undefined;

/**
 * Configuration for a post-processor
 */
export interface PostProcessorConfig {
  processor: PostProcessor;
  pathPattern?: string | string[];
  typeFilter?: string | string[];
}

/**
 * Context provided to post-processor
 */
export interface PostProcessorContext {
  path: (string | number)[];
  schema: JsonSchema;
  build: BuildFunctions;
}

/**
 * Extend Context type to include processors
 */
export interface Context {
  // ... existing fields ...
  preProcessors?: PreProcessor[];
  postProcessors?: PostProcessorConfig[];
}
```

**Acceptance Criteria**:
- [ ] All types defined and exported
- [ ] Types align with processor usage
- [ ] TypeScript compilation succeeds
- [ ] Types are clear and well-documented

### Exit Criteria
✅ BaseParser class created and compiles
✅ All type guards implemented and testable
✅ Processor types added to Types.ts
✅ All TypeScript compilation succeeds
✅ No breaking changes to existing code

### Dependencies
- Completed: Phase 0 (testing gaps assessment)

### Risk & Mitigation
- **Risk**: BaseParser design doesn't accommodate all parser types
- **Mitigation**: Review each parser's logic to ensure compatibility
- **Fallback**: Add virtual methods as needed during Phase 2

---

## Phase 2: Convert Existing Parsers (4-5 days)

### Objective
Convert each parser function from functional to class-based approach, extending BaseParser.

### Overview
For each existing parser function (parseObject, parseArray, parseString, etc.):
1. Create new parser class extending BaseParser
2. Move parsing logic to parseImpl() method
3. Implement canProduceType() for type filtering
4. Verify output matches original function exactly
5. Run tests to ensure no behavioral changes

### Architecture

```
Each Parser:
  class XXXParser extends BaseParser {
    protected parseImpl(schema: JsonSchema): ZodBuilder {
      // Move logic from parseXxx() here
      // Should produce identical output
    }
    
    protected canProduceType(type: string): boolean {
      // Identify which builder types this parser produces
      return type === 'object' || type === 'ObjectBuilder';
    }
  }
```

### Parsers to Convert

#### Task 2.1: String Parser
**File**: `src/JsonSchema/parsers/StringParser.ts` (NEW)

```typescript
export class StringParser extends BaseParser {
  protected parseImpl(schema: JsonSchema): ZodBuilder {
    let builder = this.refs.build.string();

    // Apply string-specific constraints
    if (schema.minLength !== undefined) {
      builder = builder.min(schema.minLength);
    }

    if (schema.maxLength !== undefined) {
      builder = builder.max(schema.maxLength);
    }

    if (schema.pattern !== undefined) {
      builder = builder.regex(new RegExp(schema.pattern));
    }

    // Apply format-specific constraints
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
      case 'email':
        return builder.email();
      case 'uuid':
        return builder.uuid();
      case 'date-time':
        return builder.datetime();
      case 'uri':
        return builder.url();
      // ... other formats ...
      default:
        return builder;
    }
  }
}
```

**Acceptance Criteria**:
- [ ] Class extends BaseParser
- [ ] parseImpl() contains string parsing logic
- [ ] Output matches original parseString() exactly
- [ ] Format handling preserved
- [ ] Constraints applied correctly

#### Task 2.2: Number Parser
**File**: `src/JsonSchema/parsers/NumberParser.ts` (NEW)

Move logic from parseNumber() and parseInt() into:
```typescript
export class NumberParser extends BaseParser {
  protected parseImpl(schema: JsonSchema): ZodBuilder {
    let builder: NumberBuilder;

    if (schema.type === 'integer') {
      builder = this.refs.build.number().int();
    } else {
      builder = this.refs.build.number();
    }

    // Apply numeric constraints
    if (schema.minimum !== undefined) {
      builder = builder.min(schema.minimum);
    }

    if (schema.maximum !== undefined) {
      builder = builder.max(schema.maximum);
    }

    if (schema.multipleOf !== undefined) {
      builder = builder.multipleOf(schema.multipleOf);
    }

    return builder;
  }

  protected canProduceType(type: string): boolean {
    return type === 'number' || type === 'NumberBuilder';
  }
}
```

**Acceptance Criteria**:
- [ ] Integer vs number distinction preserved
- [ ] Constraints applied correctly
- [ ] Output matches original functions
- [ ] Tests pass unchanged

#### Task 2.3: Boolean Parser
**File**: `src/JsonSchema/parsers/BooleanParser.ts` (NEW)

```typescript
export class BooleanParser extends BaseParser {
  protected parseImpl(schema: JsonSchema): ZodBuilder {
    return this.refs.build.boolean();
  }

  protected canProduceType(type: string): boolean {
    return type === 'boolean' || type === 'BooleanBuilder';
  }
}
```

#### Task 2.4: Null Parser
**File**: `src/JsonSchema/parsers/NullParser.ts` (NEW)

```typescript
export class NullParser extends BaseParser {
  protected parseImpl(schema: JsonSchema): ZodBuilder {
    return this.refs.build.null();
  }

  protected canProduceType(type: string): boolean {
    return type === 'null' || type === 'NullBuilder';
  }
}
```

#### Task 2.5: Object Parser
**File**: `src/JsonSchema/parsers/ObjectParser.ts` (NEW)

Most complex parser - handles properties, required, additional properties, patterns:

```typescript
export class ObjectParser extends BaseParser {
  protected parseImpl(schema: JsonSchema): ZodBuilder {
    const properties: Record<string, ZodBuilder> = {};

    // Parse each property
    if (schema.properties) {
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        const propBuilder = this.parseChild(propSchema, key);
        
        // Mark as optional if not required
        if (!schema.required?.includes(key)) {
          properties[key] = propBuilder.optional();
        } else {
          properties[key] = propBuilder;
        }
      }
    }

    let builder = this.refs.build.object(properties);

    // Handle pattern properties
    if (schema.patternProperties) {
      builder = this.applyPatternProperties(
        builder as ObjectBuilder,
        schema.patternProperties
      );
    }

    // Handle additional properties
    if (schema.additionalProperties === false) {
      builder = (builder as ObjectBuilder).strict();
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
    // Pattern properties handling
    return builder;
  }
}
```

#### Task 2.6: Array Parser
**File**: `src/JsonSchema/parsers/ArrayParser.ts` (NEW)

Handles both tuple and regular arrays:

```typescript
export class ArrayParser extends BaseParser {
  protected parseImpl(schema: JsonSchema): ZodBuilder {
    // Check for tuple array
    if (Array.isArray(schema.items)) {
      const itemBuilders = schema.items.map((itemSchema, index) =>
        this.parseChild(itemSchema, index)
      );
      return this.refs.build.tuple(itemBuilders);
    }

    // Regular array
    const itemBuilder = schema.items
      ? this.parseChild(schema.items, 0)
      : this.refs.build.any();

    let builder = this.refs.build.array(itemBuilder);

    // Apply array constraints
    if (schema.minItems !== undefined) {
      builder = builder.min(schema.minItems);
    }

    if (schema.maxItems !== undefined) {
      builder = builder.max(schema.maxItems);
    }

    if (schema.uniqueItems === true) {
      // Apply uniqueness constraint
    }

    return builder;
  }

  protected canProduceType(type: string): boolean {
    return type === 'array' || type === 'ArrayBuilder';
  }
}
```

#### Task 2.7: Union Parser (anyOf)
**File**: `src/JsonSchema/parsers/AnyOfParser.ts` (NEW)

```typescript
export class AnyOfParser extends BaseParser {
  protected parseImpl(schema: JsonSchema): ZodBuilder {
    if (!schema.anyOf || schema.anyOf.length === 0) {
      return this.refs.build.any();
    }

    const options = schema.anyOf.map((optSchema, index) =>
      this.parseChild(optSchema, `anyOf.${index}`)
    );

    return this.refs.build.union(options);
  }

  protected canProduceType(type: string): boolean {
    return type === 'union' || type === 'UnionBuilder';
  }
}
```

#### Task 2.8: Intersection Parser (allOf)
**File**: `src/JsonSchema/parsers/AllOfParser.ts` (NEW)

```typescript
export class AllOfParser extends BaseParser {
  protected parseImpl(schema: JsonSchema): ZodBuilder {
    if (!schema.allOf || schema.allOf.length === 0) {
      return this.refs.build.any();
    }

    const options = schema.allOf.map((optSchema, index) =>
      this.parseChild(optSchema, `allOf.${index}`)
    );

    return this.refs.build.intersection(...options);
  }

  protected canProduceType(type: string): boolean {
    return type === 'intersection' || type === 'IntersectionBuilder';
  }
}
```

#### Task 2.9: Xor Parser (oneOf)
**File**: `src/JsonSchema/parsers/OneOfParser.ts` (NEW)

Similar to AnyOfParser but with oneOf semantics.

#### Task 2.10: Test Each Parser
For each newly created parser class:

```bash
# Create test file: test/JsonSchema/parsers/[ParserName].test.ts
# Test cases:
# 1. Basic functionality matches original function
# 2. All constraints applied correctly
# 3. Metadata applied correctly
# 4. Output code generation identical

npm test -- test/JsonSchema/parsers/StringParser.test.ts
npm test -- test/JsonSchema/parsers/NumberParser.test.ts
# ... etc for all parsers
```

### Exit Criteria
✅ All 9 parser classes created
✅ Each parser extends BaseParser correctly
✅ parseImpl() method contains parsing logic
✅ canProduceType() implemented
✅ Output matches original function behavior
✅ All existing tests still pass (100% pass rate)
✅ Behavioral snapshot unchanged

### Verification
```bash
# Behavioral snapshot verification
npm test  # All tests should pass
npm run test:coverage  # Coverage should be maintained
```

### Risk & Mitigation
- **Risk**: Parser output differs from original
- **Mitigation**: Compare generated code before/after for each test case
- **Fallback**: Revert parser if output doesn't match

---

## Phase 3: Parser Registry and Selection (2-3 days)

### Objective
Create parser registry, implement parser selection logic, and establish symmetric parse API.

### Tasks

#### Task 3.1: Create Parser Registry

**File**: `src/JsonSchema/parsers/registry.ts` (NEW)

```typescript
import { BaseParser } from './BaseParser';
import { ObjectParser } from './ObjectParser';
import { ArrayParser } from './ArrayParser';
import { StringParser } from './StringParser';
// ... other imports ...

/**
 * Maps JSON Schema types to their corresponding parser classes
 */
export const parserRegistry = new Map<string, typeof BaseParser>([
  ['object', ObjectParser],
  ['array', ArrayParser],
  ['string', StringParser],
  ['number', NumberParser],
  ['integer', NumberParser],
  ['boolean', BooleanParser],
  ['null', NullParser],
  ['anyOf', AnyOfParser],
  ['allOf', AllOfParser],
  ['oneOf', OneOfParser],
]);

/**
 * Select appropriate parser class for a schema
 */
export function selectParserClass(schema: JsonSchema): typeof BaseParser {
  // Check combinators first (highest priority)
  if (schema.anyOf) return AnyOfParser;
  if (schema.allOf) return AllOfParser;
  if (schema.oneOf) return OneOfParser;

  // Check for nullable
  if (its.nullable(schema)) return NullableParser;

  // Check explicit type
  if (schema.type) {
    const ParserClass = parserRegistry.get(schema.type);
    if (ParserClass) return ParserClass;
  }

  // Try to infer type from schema structure
  if (its.object(schema)) return ObjectParser;
  if (its.array(schema)) return ArrayParser;
  if (its.string(schema)) return StringParser;
  if (its.number(schema)) return NumberParser;
  if (its.boolean(schema)) return BooleanParser;

  // Default fallback
  return AnyParser;
}
```

**Acceptance Criteria**:
- [ ] Registry maps all standard JSON Schema types
- [ ] selectParserClass() works for all type variations
- [ ] Fallback selection logic works
- [ ] Combinators checked first
- [ ] Type inference works correctly

#### Task 3.2: Update parseSchema() to Use Registry

**File**: `src/JsonSchema/parsers/index.ts` (MODIFY)

Replace the existing parseSchema() implementation:

```typescript
/**
 * Main schema parser - uses registry to select appropriate parser
 */
export function parseSchema(schema: JsonSchema, refs: Context): ZodBuilder {
  // Handle $ref
  if (schema.$ref) {
    return parseRef(schema.$ref, refs);
  }

  // Handle circular references
  if (refs.seen.has(schema)) {
    return refs.seen.get(schema).r;
  }

  // Handle parser override
  if (refs.parserOverride) {
    const overridden = refs.parserOverride(schema, refs);
    if (overridden !== undefined) {
      return overridden;
    }
  }

  // Select parser class based on schema
  const ParserClass = selectParserClass(schema);

  // Instantiate and execute parser
  const parser = new ParserClass(schema, refs);
  const builder = parser.parse();

  // Cache for circular references
  refs.seen.set(schema, { n: 0, r: builder });

  return builder;
}
```

**Acceptance Criteria**:
- [ ] parseSchema() uses selectParserClass()
- [ ] Parser instantiation works correctly
- [ ] Parser.parse() called and returned
- [ ] Circular reference caching preserved
- [ ] All existing tests pass

#### Task 3.3: Create Symmetric Parse API

**File**: `src/JsonSchema/parsers/index.ts` (ADD)

```typescript
/**
 * Parser factory - mirrors build API
 * Provides parse.object(), parse.array(), parse.schema(), etc.
 */
export const parse = {
  /**
   * Parse JSON Schema and return appropriate builder
   * Auto-selects parser based on schema type
   */
  schema: (schema: JsonSchema, refs: Context): ZodBuilder => {
    return parseSchema(schema, refs);
  },

  /**
   * Parse object schema
   */
  object: (schema: JsonSchema, refs: Context): ObjectBuilder => {
    return new ObjectParser(schema, refs).parse() as ObjectBuilder;
  },

  /**
   * Parse array schema
   */
  array: (schema: JsonSchema, refs: Context): ArrayBuilder => {
    return new ArrayParser(schema, refs).parse() as ArrayBuilder;
  },

  /**
   * Parse string schema
   */
  string: (schema: JsonSchema, refs: Context): StringBuilder => {
    return new StringParser(schema, refs).parse() as StringBuilder;
  },

  /**
   * Parse number schema
   */
  number: (schema: JsonSchema, refs: Context): NumberBuilder => {
    return new NumberParser(schema, refs).parse() as NumberBuilder;
  },

  /**
   * Parse boolean schema
   */
  boolean: (schema: JsonSchema, refs: Context): BooleanBuilder => {
    return new BooleanParser(schema, refs).parse() as BooleanBuilder;
  },

  /**
   * Parse null schema
   */
  null: (schema: JsonSchema, refs: Context): NullBuilder => {
    return new NullParser(schema, refs).parse() as NullBuilder;
  },

  /**
   * Parse union schema
   */
  union: (schema: JsonSchema, refs: Context): UnionBuilder => {
    return new AnyOfParser(schema, refs).parse() as UnionBuilder;
  },

  /**
   * Parse intersection schema
   */
  intersection: (schema: JsonSchema, refs: Context): IntersectionBuilder => {
    return new AllOfParser(schema, refs).parse() as IntersectionBuilder;
  },
};

// Export for public API
export { parse };
```

**Acceptance Criteria**:
- [ ] parse.schema() available and works
- [ ] parse.object() through parse.boolean() available
- [ ] All return correct builder types
- [ ] API mirrors build API
- [ ] Exported from index.ts

#### Task 3.4: Replace instanceof with Type Guards

Search and replace throughout codebase:

**Before**:
```typescript
if (builder instanceof ObjectBuilder) {
  return builder.strict();
}

if (builder instanceof ArrayBuilder) {
  return builder.nonempty();
}
```

**After**:
```typescript
if (is.objectBuilder(builder)) {
  return builder.strict();
}

if (is.arrayBuilder(builder)) {
  return builder.nonempty();
}
```

**Files to Update**:
- Any file using parser functions
- Any post-processor code
- Any builder type checking code

```bash
# Find all instanceof usage
grep -r "instanceof.*Builder" src/

# Replace with type guards
# Use find-and-replace in IDE
```

**Acceptance Criteria**:
- [ ] No instanceof checks in parsing logic
- [ ] All replaced with is.* type guards
- [ ] Code compiles without errors
- [ ] All tests pass

#### Task 3.5: Verify Parsing Pipeline

Test that complete parsing pipeline works:

```typescript
// Test case
const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'number' },
  },
  required: ['name'],
};

// Using parseSchema()
const result1 = parseSchema(schema, createContext());

// Using parse.schema()
const result2 = parse.schema(schema, createContext());

// Using parse.object()
const result3 = parse.object(schema, createContext());

// All three should produce identical output
expect(result1.toString()).toBe(result2.toString());
expect(result2.toString()).toBe(result3.toString());
```

### Exit Criteria
✅ Parser registry created and maps all types
✅ Parser selection algorithm works for all variations
✅ parseSchema() uses registry and instantiates parsers
✅ Symmetric parse API available and functional
✅ All internal calls use parse API
✅ No instanceof checks in parsing logic
✅ All tests pass (100% pass rate)
✅ Behavioral snapshot unchanged

### Risk & Mitigation
- **Risk**: Parser selection logic doesn't cover all cases
- **Mitigation**: Comprehensive test coverage of selection logic
- **Fallback**: Add additional parser classes if new type found

---

## Phase 4: Post-Processor Integration (2-3 days)

### Objective
Add post-processor support to the main jsonSchemaToZod() function and ensure processor filtering works correctly.

### Tasks

#### Task 4.1: Update jsonSchemaToZod() Entry Point

**File**: `src/jsonSchemaToZod.ts` (MODIFY)

Update JsonSchemaToZodOptions interface:

```typescript
export interface JsonSchemaToZodOptions {
  // ... existing options ...
  
  /**
   * Optional post-processors to transform builders after parsing
   */
  postProcessors?: (PostProcessor | PostProcessorConfig)[];

  /**
   * Optional pre-processors to transform schemas before parsing
   */
  preProcessors?: PreProcessor[];
}

/**
 * Main function - updated to pass processors through to parseSchema
 */
export function jsonSchemaToZod(
  schema: JsonSchema,
  options: JsonSchemaToZodOptions = {}
): string {
  const context: Context = {
    // ... existing context setup ...
    preProcessors: options.preProcessors,
    postProcessors: options.postProcessors?.map(p =>
      typeof p === 'function' ? { processor: p } : p
    ),
  };

  const builder = parseSchema(schema, context);
  return builder.text();
}
```

**Acceptance Criteria**:
- [ ] postProcessors option added to interface
- [ ] preProcessors option added to interface
- [ ] Options passed through to Context
- [ ] Backward compatible (processors optional)
- [ ] Function signature unchanged

#### Task 4.2: Processor Type Handling

Ensure PostProcessorConfig normalizes correctly:

```typescript
/**
 * In BaseParser.filterPostProcessors():
 */
protected filterPostProcessors(
  configs: (PostProcessor | PostProcessorConfig)[] = []
): PostProcessor[] {
  return configs
    .filter(config => {
      // Normalize to PostProcessorConfig if function
      const cfg = typeof config === 'function' 
        ? { processor: config } 
        : config;

      // Filter based on type and path
      if (cfg.typeFilter) {
        const types = Array.isArray(cfg.typeFilter)
          ? cfg.typeFilter
          : [cfg.typeFilter];
        if (!types.some(t => this.canProduceType(t))) {
          return false;
        }
      }

      // Could add path filtering here
      return true;
    })
    .map(config => 
      typeof config === 'function' ? config : config.processor
    );
}
```

**Acceptance Criteria**:
- [ ] Both function and config forms accepted
- [ ] Type filtering works correctly
- [ ] Path filtering works (if implemented)
- [ ] Processors applied in correct order

#### Task 4.3: Processor Context Provision

Ensure correct context passed to processors:

```typescript
/**
 * In BaseParser.applyPostProcessors():
 */
protected applyPostProcessors(builder: ZodBuilder): ZodBuilder {
  let result = builder;

  for (const processor of this.postProcessors) {
    const context: PostProcessorContext = {
      path: this.refs.path || [],
      schema: this.schema,
      build: this.refs.build,
    };

    const processed = processor(result, context);
    if (processed !== undefined) {
      result = processed;
    }
  }

  return result;
}
```

**Acceptance Criteria**:
- [ ] Context includes path
- [ ] Context includes schema
- [ ] Context includes build functions
- [ ] Processor can use context

#### Task 4.4: Test Post-Processor Functionality

Create comprehensive processor tests:

```typescript
describe('Post-processors', () => {
  it('should apply processor to builders', () => {
    const schema = { type: 'object', properties: { name: { type: 'string' } } };

    const strictifyObjects: PostProcessor = (builder, ctx) => {
      if (is.objectBuilder(builder)) {
        return builder.strict();
      }
      return builder;
    };

    const result = jsonSchemaToZod(schema, {
      postProcessors: [strictifyObjects],
    });

    expect(result).toContain('.strict()');
  });

  it('should filter processors by type', () => {
    const schema = { type: 'object', properties: { name: { type: 'string' } } };

    const objectOnlyProcessor: PostProcessor = (builder) => {
      if (is.objectBuilder(builder)) {
        return builder.strict();
      }
      return builder;
    };

    const result = jsonSchemaToZod(schema, {
      postProcessors: [
        {
          processor: objectOnlyProcessor,
          typeFilter: 'ObjectBuilder',
        },
      ],
    });

    expect(result).toContain('.strict()');
  });

  it('should skip processor if type does not match', () => {
    const schema = { type: 'string' };

    const objectOnlyProcessor: PostProcessor = (builder) => {
      if (is.objectBuilder(builder)) {
        return builder.strict();
      }
      return builder;
    };

    const result = jsonSchemaToZod(schema, {
      postProcessors: [
        {
          processor: objectOnlyProcessor,
          typeFilter: 'ObjectBuilder',
        },
      ],
    });

    expect(result).not.toContain('.strict()');
  });
});
```

**Acceptance Criteria**:
- [ ] Basic processor application works
- [ ] Type filtering works correctly
- [ ] Path filtering works (if implemented)
- [ ] All processor tests pass

#### Task 4.5: Verify Backward Compatibility

```bash
# Run all existing tests - should all pass without modification
npm test

# Verify output identical for schemas without processors
npm run test:coverage
```

**Acceptance Criteria**:
- [ ] 100% test pass rate (all existing tests pass)
- [ ] No performance regression
- [ ] Coverage maintained or improved
- [ ] Backward compatible

### Exit Criteria
✅ jsonSchemaToZod() accepts postProcessors option
✅ Processors passed through Context
✅ BaseParser filters applicable processors
✅ Type filtering works correctly
✅ Path filtering works (if implemented)
✅ Processor context provided correctly
✅ All tests pass (100% pass rate)
✅ Backward compatible (no breaking changes)
✅ No performance regression

### Risk & Mitigation
- **Risk**: Processor filtering causes processor to skip unexpectedly
- **Mitigation**: Comprehensive tests for all filter combinations
- **Fallback**: Disable filtering if it causes issues

---

## Phase 5: Testing and Validation (2-3 days)

### Objective
Verify all tests pass, coverage is maintained, and behavior is completely preserved.

### Tasks

#### Task 5.1: Full Test Suite Execution

```bash
npm test
```

**Expected**: 100% pass rate, no failures

**Deliverable**: Test output showing all tests passing

**Acceptance Criteria**:
- [ ] All tests pass
- [ ] No test failures
- [ ] No skipped tests (unless already skipped)
- [ ] No timeouts

#### Task 5.2: Coverage Verification

```bash
npm run test:coverage
```

**Compare**:
- Pre-refactoring coverage (from Phase 0)
- Post-refactoring coverage
- Should be equal or improved

**Acceptance Criteria**:
- [ ] Coverage >= baseline
- [ ] No coverage regression
- [ ] Parser code > 80% coverage
- [ ] Critical paths > 90% coverage

#### Task 5.3: Behavioral Snapshot Comparison

Using `specs/refactor/008-refactor-008-parser/behavioral-snapshot.md`:

For each test case:
1. Generate schema with original (pre-refactoring) code
2. Generate schema with new (post-refactoring) code
3. Compare outputs
4. Document any differences (should be none)

```typescript
// Example test
const schema = { type: 'string', description: 'User name' };

// Before refactoring
const before = originalParseSchema(schema);

// After refactoring
const after = parseSchema(schema);

// Should be identical
expect(after.toString()).toBe(before.toString());
```

**Deliverable**: Behavioral snapshot validation report

**Acceptance Criteria**:
- [ ] All 10 behavior categories tested
- [ ] 100% output match
- [ ] No observable differences
- [ ] Circular references work correctly
- [ ] Metadata applied identically

#### Task 5.4: Circular Reference Testing

Specific focus on circular references:

```typescript
it('should handle self-references', () => {
  const schema = {
    $id: 'person',
    type: 'object',
    properties: {
      name: { type: 'string' },
      parent: { $ref: '#' },
    },
  };

  const result = parseSchema(schema, context);
  expect(result.toString()).toContain('z.lazy');
});

it('should handle mutual references', () => {
  const personSchema = {
    $id: 'person',
    type: 'object',
    properties: {
      name: { type: 'string' },
      company: { $ref: '#/definitions/company' },
    },
  };

  const companySchema = {
    $id: 'company',
    type: 'object',
    properties: {
      name: { type: 'string' },
      employees: {
        type: 'array',
        items: { $ref: '#/definitions/person' },
      },
    },
  };

  // Both should use .lazy()
  const personResult = parseSchema(personSchema, context);
  const companyResult = parseSchema(companySchema, context);

  expect(personResult.toString()).toContain('z.lazy');
  expect(companyResult.toString()).toContain('z.lazy');
});
```

**Acceptance Criteria**:
- [ ] All circular reference tests pass
- [ ] No infinite recursion
- [ ] lazy() correctly applied
- [ ] Complex circular patterns work

#### Task 5.5: Integration Test Suite

Test complete parsing pipeline with complex schemas:

```typescript
describe('Integration: Complex Schemas', () => {
  it('should parse complex nested schema', () => {
    const complexSchema = {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            age: { type: 'number' },
            email: { type: 'string', format: 'email' },
            tags: {
              type: 'array',
              items: { type: 'string' },
            },
          },
          required: ['name', 'email'],
        },
        status: {
          enum: ['active', 'inactive', 'pending'],
        },
      },
    };

    const result = parseSchema(complexSchema, context);
    expect(result).toBeDefined();
    expect(result.toString()).toContain('z.object');
  });
});
```

**Acceptance Criteria**:
- [ ] Complex schemas parse correctly
- [ ] All field types handled
- [ ] Combinators work
- [ ] Constraints applied

### Exit Criteria
✅ 100% test pass rate (npm test)
✅ Coverage maintained or improved
✅ Behavioral snapshot matches perfectly
✅ Circular references work correctly
✅ Integration tests pass
✅ No behavioral changes detected
✅ No performance regression

### Verification Checklist
```
Pre-Refactoring State:
- [ ] Coverage: ___%
- [ ] Tests: ___ passed, ___ failed
- [ ] Build time: ___ seconds
- [ ] Behavioral snapshot captured

Post-Refactoring State:
- [ ] Coverage: ___%
- [ ] Tests: ___ passed, ___ failed
- [ ] Build time: ___ seconds
- [ ] Behavioral snapshot matches

Comparison:
- [ ] Coverage: Maintained/Improved ✅
- [ ] Tests: All pass ✅
- [ ] Performance: No regression ✅
- [ ] Behavior: Identical ✅
```

---

## Phase 6: Documentation (2-3 days)

### Objective
Document the new architecture, provide migration guidance, and create usage examples.

### Tasks

#### Task 6.1: Architecture Documentation

**File**: `docs/parser-architecture.md` (NEW)

```markdown
# Parser Architecture

## Overview

The parser architecture has been refactored from a functional approach to a class-based, template-method pattern implementation.

## Class Hierarchy

```
BaseParser (abstract)
├── ObjectParser
├── ArrayParser
├── StringParser
├── NumberParser
├── BooleanParser
├── NullParser
├── AnyOfParser (anyOf)
├── AllOfParser (allOf)
└── OneOfParser (oneOf)
```

## BaseParser Template Method

```
parse(): ZodBuilder
  1. applyPreProcessors(schema)
  2. parseImpl(schema)        [Implemented by subclass]
  3. applyPostProcessors(builder)
  4. applyMetadata(builder, schema)
```

## Adding New Parser

1. Extend BaseParser
2. Implement parseImpl()
3. Implement canProduceType()
4. Register in parserRegistry

## Type Guards

Use `is.*` type guards instead of instanceof:

```typescript
if (is.objectBuilder(builder)) {
  return builder.strict();
}
```

## Symmetric Parse API

```typescript
import { parse } from 'x-to-zod';

parse.schema(schema, refs)      // Auto-select
parse.object(schema, refs)      // Specific type
parse.array(schema, refs)
parse.string(schema, refs)
// ... etc
```
```

**Acceptance Criteria**:
- [ ] Architecture clearly explained
- [ ] Class hierarchy documented
- [ ] Template method pattern described
- [ ] Type guards documented
- [ ] Examples provided

#### Task 6.2: Post-Processing Guide

**File**: `docs/post-processing.md` (NEW)

```markdown
# Post-Processing Guide

## Overview

Post-processors transform Zod builders after parsing to add custom logic, constraints, or transformations.

## Basic Usage

```typescript
import { jsonSchemaToZod } from 'x-to-zod';
import { is } from 'x-to-zod/utils';

const schema = { type: 'object', properties: { ... } };

const result = jsonSchemaToZod(schema, {
  postProcessors: [
    // Simple processor function
    (builder, context) => {
      if (is.stringBuilder(builder)) {
        return builder.toLowerCase();
      }
      return builder;
    },

    // Processor with configuration
    {
      processor: (builder, context) => {
        if (is.objectBuilder(builder)) {
          return builder.strict();
        }
        return builder;
      },
      typeFilter: 'ObjectBuilder',
    },
  ],
});
```

## Processor Context

Processors receive context with:

```typescript
{
  path: (string | number)[],    // Current path in schema
  schema: JsonSchema,             // The schema being parsed
  build: BuildFunctions,          // Builder factory
}
```

## Type Filtering

```typescript
postProcessors: [
  {
    processor: myProcessor,
    typeFilter: 'ObjectBuilder'         // Single type
    // or
    typeFilter: ['ObjectBuilder', 'ArrayBuilder']  // Multiple
  }
]
```

## Path Filtering

```typescript
postProcessors: [
  {
    processor: myProcessor,
    pathPattern: 'properties.name'        // Single pattern
    // or
    pathPattern: ['properties.*', 'items']  // Multiple
  }
]
```

## Examples

### Make all objects strict

```typescript
const strictifyObjects = (builder, context) => {
  if (is.objectBuilder(builder)) {
    return builder.strict();
  }
  return builder;
};

jsonSchemaToZod(schema, { postProcessors: [strictifyObjects] });
```

### Add lowercase transformation to email fields

```typescript
const emailTransformer = (builder, context) => {
  if (context.path.at(-1) === 'email' && is.stringBuilder(builder)) {
    return builder.toLowerCase();
  }
  return builder;
};
```

### Require non-empty arrays

```typescript
const nonemptyArrays = (builder, context) => {
  if (is.arrayBuilder(builder)) {
    return builder.nonempty();
  }
  return builder;
};
```
```

**Acceptance Criteria**:
- [ ] Post-processor concept explained
- [ ] Context documented
- [ ] Type filtering explained
- [ ] Path filtering explained
- [ ] Multiple examples provided

#### Task 6.3: Migration Guide

**File**: `docs/migration-parser-classes.md` (NEW)

```markdown
# Migration Guide: Parser Classes

## For Library Users

**Good news**: No changes required! The public API is unchanged.

```typescript
// This still works exactly the same
const result = jsonSchemaToZod(schema);

// Optionally add post-processors
const result = jsonSchemaToZod(schema, {
  postProcessors: [myProcessor],
});
```

## For Library Contributors

If you extend or customize parsers:

### Before: Function-based

```typescript
function parseMyCustomType(schema: JsonSchema, refs: Context): ZodBuilder {
  // Custom parsing logic
  return builder;
}
```

### After: Class-based

```typescript
class MyCustomParser extends BaseParser {
  protected parseImpl(schema: JsonSchema): ZodBuilder {
    // Custom parsing logic
    return builder;
  }

  protected canProduceType(type: string): boolean {
    return type === 'myCustomType';
  }
}

// Register in parser registry
parserRegistry.set('myCustomType', MyCustomParser);
```

## Before/After Comparison

| Aspect | Before | After |
|--------|--------|-------|
| Parser | Function | Class extending BaseParser |
| Metadata | Each parser implements | Inherited from BaseParser |
| Processors | Not supported | Integrated, filtered by type |
| Type checking | instanceof | Type guards (is.*) |
| API | parseSchema(), parseObject(), etc. | parse.schema(), parse.object(), etc. |

## Backward Compatibility

- All existing code continues to work
- parseSchema() still available
- No breaking changes to public API
- Old parser function imports deprecated but still work
```

**Acceptance Criteria**:
- [ ] User-facing changes documented (none)
- [ ] Contributor changes documented
- [ ] Before/after comparison provided
- [ ] Migration steps clear
- [ ] Backward compatibility explained

#### Task 6.4: Update README

**File**: `README.md` (MODIFY if needed)

Add section about post-processing:

```markdown
## Post-Processing (Advanced)

Customize generated Zod schemas with post-processors:

```typescript
jsonSchemaToZod(schema, {
  postProcessors: [
    (builder, context) => {
      // Transform builder...
      return builder;
    }
  ]
});
```

See [Post-Processing Guide](docs/post-processing.md) for details.
```

**Acceptance Criteria**:
- [ ] README updated with post-processing
- [ ] Links to detailed documentation
- [ ] Examples provided
- [ ] Clear and discoverable

#### Task 6.5: API Reference Updates

**File**: `docs/API.md` (NEW or MODIFY)

Document all public classes and functions:

```markdown
# API Reference

## Classes

### BaseParser

Abstract base class for all parsers.

```typescript
abstract class BaseParser {
  constructor(schema: JsonSchema, refs: Context);
  parse(): ZodBuilder;
  protected abstract parseImpl(schema: JsonSchema): ZodBuilder;
  protected canProduceType(type: string): boolean;
}
```

### ObjectParser, ArrayParser, StringParser, etc.

Concrete parser classes extending BaseParser.

## Functions

### parseSchema(schema, refs): ZodBuilder

Parse a JSON Schema and return a Zod builder.

### selectParserClass(schema): typeof BaseParser

Select appropriate parser class for a schema.

## Objects

### parse

Factory object with methods mirroring `build`:

```typescript
export const parse = {
  schema: (schema, refs) => ZodBuilder,
  object: (schema, refs) => ObjectBuilder,
  array: (schema, refs) => ArrayBuilder,
  string: (schema, refs) => StringBuilder,
  // ... more
};
```

## Types

### PostProcessor

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
  schema: JsonSchema;
  build: BuildFunctions;
}
```

## Type Guards

```typescript
import { is } from 'x-to-zod/utils';

is.objectBuilder(value): value is ObjectBuilder
is.arrayBuilder(value): value is ArrayBuilder
is.stringBuilder(value): value is StringBuilder
// ... more
```
```

**Acceptance Criteria**:
- [ ] All public classes documented
- [ ] All public functions documented
- [ ] All public types documented
- [ ] Type guards documented
- [ ] Examples provided for each

### Exit Criteria
✅ Architecture documentation complete
✅ Post-processing guide written
✅ Migration guide for contributors created
✅ README updated
✅ API reference complete
✅ All documentation reviewed and tested
✅ Links between documents work correctly

---

## Success Metrics

### Code Quality Metrics

| Metric | Baseline | Target | Status |
|--------|----------|--------|--------|
| Lines of duplicated logic | ~150 | 0 | ✅ |
| Number of parser functions | 7+ | 0 (replaced with classes) | ✅ |
| instanceof checks in parsing | 10+ | 0 (use type guards) | ✅ |
| Test coverage | X% | Maintained/Improved | ✅ |
| Build time | 6 sec | ±5% (no regression) | ✅ |

### Process Metrics

| Metric | Status |
|--------|--------|
| All 6 phases completed | ✅ |
| 100% test pass rate | ✅ |
| Behavioral snapshot match | ✅ |
| Documentation complete | ✅ |
| Code review approved | ✅ |
| Deployed successfully | ✅ |

### Feature Completeness

| Feature | Status |
|---------|--------|
| Class-based parsers | ✅ |
| BaseParser template method | ✅ |
| Symmetric parse API | ✅ |
| Post-processor support | ✅ |
| Type guards throughout | ✅ |
| Early processor filtering | ✅ |
| Circular reference handling | ✅ |
| Metadata application | ✅ |

---

## Rollback Procedures

### Immediate Rollback (<5 minutes)

```bash
# If deployment hasn't started yet
git reset --hard HEAD~1
npm install
npm test
```

### Git Tag Rollback

```bash
# Tag was created at beginning of refactoring
git tag pre-refactor-008

# If needed to revert
git reset --hard pre-refactor-008
git clean -fd
npm install
npm test
```

### Selective Rollback (Phase-specific)

If a specific phase causes issues:

```bash
# Find the commit that introduced the issue
git log --oneline | head -20

# Reset to just before that phase
git reset --hard [pre-phase-commit]

# Keep previously working phases
git reset --soft [keep-good-commits]
git commit -m "Rollback to Phase X"
```

### Recovery Time Objective

- **Revert command**: ~2 minutes
- **Dependencies install**: ~3 minutes
- **Test suite run**: ~6 minutes
- **Verification**: ~3 minutes
- **Total RTO**: < 15 minutes

---

## Sign-Off

### Phase Completion Sign-Off

- [ ] **Phase 0**: Testing gaps assessment - Approved by: ___________
- [ ] **Phase 1**: Base parser infrastructure - Approved by: ___________
- [ ] **Phase 2**: Convert parsers to classes - Approved by: ___________
- [ ] **Phase 3**: Parser registry & API - Approved by: ___________
- [ ] **Phase 4**: Post-processor integration - Approved by: ___________
- [ ] **Phase 5**: Testing & validation - Approved by: ___________
- [ ] **Phase 6**: Documentation - Approved by: ___________

### Final Implementation Sign-Off

- [ ] All code changes implemented
- [ ] 100% test pass rate achieved
- [ ] Behavioral snapshot matches
- [ ] Documentation complete
- [ ] Code review approved
- [ ] Ready for merge: ✅ YES / ❌ NO

**Approved by**: _____________________
**Date**: _____________________

---

*Implementation Plan for Refactor 008: Parser Class Architecture with Integrated Post-Processing*
*Created: 2025-12-30*
*Version: 1.0*
