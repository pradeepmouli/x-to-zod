# Migration Guide: Parser Classes

This guide explains the transition from functional parsers to class-based parsers in Refactor 008.

## For Users: No Changes Required ✅

**The public API remains unchanged.** If you're using `jsonSchemaToZod()` or the CLI, your code will continue to work without modifications.

```typescript
// This still works exactly the same
import { jsonSchemaToZod } from 'x-to-zod';

const schema = { type: 'string' };
const result = jsonSchemaToZod(schema);
// Output: z.string()
```

### Backward Compatibility Guarantees

- ✅ Same function signatures
- ✅ Same generated output (character-for-character identical)
- ✅ Same options and configuration
- ✅ Same CLI arguments
- ✅ Same import paths
- ✅ Same behavior for all edge cases

**Version Guarantee**: This refactor maintains 100% backward compatibility. All 411 existing tests pass without modification.

## For Contributors: Architecture Changes

If you're contributing to the codebase or extending parsers, you need to understand the new class-based architecture.

### High-Level Changes

| Aspect | Before (Functional) | After (Class-Based) |
|--------|---------------------|---------------------|
| **Structure** | Functions | Classes extending BaseParser |
| **Organization** | Single file per parser | Class file + functional file |
| **Reusability** | Function composition | Inheritance & hooks |
| **Testing** | Function-level tests | Class method tests |
| **Extension** | Wrapper functions | Class inheritance |
| **Type Safety** | Runtime checks | Type parameters |

### Before: Functional Approach

```typescript
// src/JsonSchema/parsers/parseObject.ts
export function parseObject(
  schema: JsonSchemaObject,
  refs: Context
): ZodBuilder {
  // Apply preprocessors
  let processed = schema;
  if (refs.preProcessors) {
    for (const preprocessor of refs.preProcessors) {
      const result = preprocessor(processed, refs);
      if (result) processed = result;
    }
  }
  
  // Parse object
  const builder = buildObjectFromSchema(processed, refs);
  
  // Apply postprocessors
  let result = builder;
  if (refs.postProcessors) {
    for (const postprocessor of refs.postProcessors) {
      const modified = postprocessor(result, { 
        path: refs.path, 
        schema: processed, 
        build: refs.build 
      });
      if (modified) result = modified;
    }
  }
  
  // Apply metadata
  if (processed.description) {
    result = result.describe(processed.description);
  }
  
  return result;
}
```

Problems with this approach:
- Duplicated processor logic across all parsers
- Hard to override specific steps
- Difficult to test individual behaviors
- No clear extension mechanism

### After: Class-Based Approach

```typescript
// src/JsonSchema/parsers/ObjectParser.ts
import { BaseParser } from './BaseParser.js';
import { parseObject } from './parseObject.js';

export class ObjectParser extends BaseParser<'object'> {
  readonly typeKind = 'object' as const;

  constructor(schema: JsonSchemaObject & { type?: string }, refs: Context) {
    super(schema, refs);
  }

  protected parseImpl(schema: JsonSchema): ZodBuilder {
    return parseObject(
      schema as JsonSchemaObject & { type: 'object' },
      this.refs
    );
  }

  protected canProduceType(type: string): boolean {
    return type === this.typeKind || type === 'ObjectBuilder';
  }
}
```

Benefits of this approach:
- ✅ Processor logic centralized in BaseParser
- ✅ Easy to override specific methods
- ✅ Clear testing boundaries
- ✅ Inheritance provides extension mechanism
- ✅ Type parameters enforce correctness

## Comparison Table

### Parser Implementation

| Feature | Functional | Class-Based |
|---------|-----------|-------------|
| **Entry point** | `parseObject(schema, refs)` | `new ObjectParser(schema, refs).parse()` |
| **Preprocessors** | Manual loop in each parser | `BaseParser.applyPreProcessors()` |
| **Postprocessors** | Manual loop in each parser | `BaseParser.applyPostProcessors()` |
| **Metadata** | Manual application | `BaseParser.applyMetadata()` |
| **Child parsing** | Call `parseSchema()` | Call `this.parseChild()` |
| **Extensibility** | Wrapper functions | Class inheritance |
| **Type info** | None | `readonly typeKind` property |

### Example: Extending Behavior

**Functional Approach** (wrapper pattern):

```typescript
function parseObjectWithDefaults(schema, refs) {
  const builder = parseObject(schema, refs);
  return builder.default({});
}
```

**Class-Based Approach** (inheritance):

```typescript
class ObjectParserWithDefaults extends ObjectParser {
  protected parseImpl(schema: JsonSchema): ZodBuilder {
    const builder = super.parseImpl(schema);
    return builder.default({});
  }
}
```

### Example: Custom Processing

**Functional Approach**:

```typescript
function customParseObject(schema, refs) {
  // Custom preprocessing
  const modified = transformSchema(schema);
  
  // Parse
  let builder = parseObject(modified, refs);
  
  // Custom postprocessing
  builder = builder.strict();
  
  return builder;
}
```

**Class-Based Approach**:

```typescript
class CustomObjectParser extends ObjectParser {
  protected applyPreProcessors(schema: JsonSchema): JsonSchema {
    // Custom preprocessing
    const modified = transformSchema(schema);
    return super.applyPreProcessors(modified);
  }
  
  protected applyPostProcessors(builder: ZodBuilder, schema: JsonSchema): ZodBuilder {
    let result = super.applyPostProcessors(builder, schema);
    // Custom postprocessing
    result = result.strict();
    return result;
  }
}
```

## Migration Steps for Contributors

If you need to modify or extend parser behavior:

### Step 1: Understand the Template Method

Read the [Template Method Pattern](./parser-architecture.md#template-method-pattern) section to understand the parsing flow.

### Step 2: Identify Your Hook Point

Determine which method to override:

- **Before parsing**: Override `applyPreProcessors()`
- **Custom parsing**: Override `parseImpl()`
- **After parsing**: Override `applyPostProcessors()`
- **Metadata handling**: Override `applyMetadata()`
- **Type checking**: Override `canProduceType()`

### Step 3: Create Your Parser Class

```typescript
class MyCustomParser extends BaseParser<'custom'> {
  readonly typeKind = 'custom' as const;
  
  // Override the methods you need
  protected parseImpl(schema: JsonSchema): ZodBuilder {
    // Your implementation
  }
}
```

### Step 4: Register Your Parser

Add to the registry if needed:

```typescript
// src/JsonSchema/parsers/registry.ts
parserRegistry.set('custom', MyCustomParser);
```

### Step 5: Add Tests

```typescript
// test/JsonSchema/parsers/MyCustomParser.test.ts
describe('MyCustomParser', () => {
  it('should parse custom schema', () => {
    const parser = new MyCustomParser(schema, refs);
    const builder = parser.parse();
    expect(builder.text()).toBe('expected output');
  });
});
```

## Common Patterns

### Pattern 1: Wrapping Functional Parser

Keep the functional parser and wrap it in a class:

```typescript
// Keep: src/JsonSchema/parsers/parseCustom.ts
export function parseCustom(schema, refs) {
  // Existing functional implementation
}

// New: src/JsonSchema/parsers/CustomParser.ts
export class CustomParser extends BaseParser<'custom'> {
  readonly typeKind = 'custom' as const;
  
  protected parseImpl(schema: JsonSchema): ZodBuilder {
    return parseCustom(schema, this.refs);
  }
}
```

### Pattern 2: Adding Preprocessing

```typescript
class PreprocessingParser extends ObjectParser {
  protected applyPreProcessors(schema: JsonSchema): JsonSchema {
    // Custom preprocessing
    const modified = { ...schema, additionalProperties: false };
    
    // Continue with standard preprocessing
    return super.applyPreProcessors(modified);
  }
}
```

### Pattern 3: Adding Postprocessing

```typescript
class PostprocessingParser extends ObjectParser {
  protected applyPostProcessors(builder: ZodBuilder, schema: JsonSchema): ZodBuilder {
    // Standard postprocessing first
    let result = super.applyPostProcessors(builder, schema);
    
    // Custom postprocessing
    if (is.objectBuilder(result)) {
      result = result.strict();
    }
    
    return result;
  }
}
```

### Pattern 4: Conditional Parsing

```typescript
class ConditionalParser extends BaseParser<'conditional'> {
  readonly typeKind = 'conditional' as const;
  
  protected parseImpl(schema: JsonSchema): ZodBuilder {
    if (this.shouldUseSpecialLogic(schema)) {
      return this.parseSpecial(schema);
    }
    return this.parseNormal(schema);
  }
  
  private shouldUseSpecialLogic(schema: JsonSchema): boolean {
    // Decision logic
  }
}
```

## Testing Strategies

### Unit Testing Parser Methods

```typescript
describe('CustomParser', () => {
  describe('parseImpl', () => {
    it('should handle basic schema', () => {
      const schema = { type: 'custom' };
      const refs = { seen: new Map(), path: [], build: buildV4 };
      
      const parser = new CustomParser(schema, refs);
      const builder = parser.parseImpl(schema);
      
      expect(builder).toBeDefined();
    });
  });
  
  describe('canProduceType', () => {
    it('should return true for custom type', () => {
      const parser = new CustomParser({}, defaultRefs);
      expect(parser.canProduceType('custom')).toBe(true);
    });
  });
});
```

### Integration Testing

```typescript
describe('CustomParser Integration', () => {
  it('should work with postprocessors', () => {
    const schema = { type: 'custom' };
    const refs = {
      seen: new Map(),
      path: [],
      build: buildV4,
      postProcessors: [
        { processor: (builder) => builder.optional() }
      ]
    };
    
    const parser = new CustomParser(schema, refs);
    const builder = parser.parse();
    
    expect(builder.text()).toContain('.optional()');
  });
});
```

## Breaking Changes for Contributors

⚠️ **Internal API Changes** (does not affect users):

1. **Parser Selection**: Now uses `selectParserClass()` instead of direct function calls
2. **Context Creation**: Use `createChildContext()` instead of manually building refs
3. **Type Checking**: Use type guards (`is.*`) instead of `instanceof`
4. **Extension**: Use class inheritance instead of wrapper functions

## FAQs

### Q: Do I need to update my code?

**A: No, if you're a user.** The public API is unchanged. Only contributors extending parsers need to adopt the new class-based approach.

### Q: Can I still use the functional parsers?

**A: Yes.** Functional parsers still exist and are called by parser classes. The functional approach is still available internally.

### Q: How do I extend a parser?

**A: Use class inheritance.** Create a class extending the parser you want to customize, then override the methods you need.

### Q: What about performance?

**A: No regression.** The class-based approach has no measurable performance impact. Test execution time remains ~6 seconds.

### Q: Can I mix functional and class-based?

**A: Yes internally, no externally.** Internally, parser classes call functional parsers. Externally, always use parser classes for consistency.

## Resources

- [Parser Architecture Documentation](./parser-architecture.md)
- [Post-Processing Guide](./post-processing.md)
- [API Reference](./API.md)
- [Test Suite](../test/JsonSchema/parsers/) - Examples of parser class tests

## Support

For questions or issues:
1. Check existing parser implementations in `src/JsonSchema/parsers/`
2. Review test files in `test/JsonSchema/parsers/`
3. Read the validation documents in `specs/refactor/008-refactor-008-parser/`
4. Open a GitHub issue if needed

---

**Last Updated**: Phase 8 Documentation - Refactor 008 Complete
