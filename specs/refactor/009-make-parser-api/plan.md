# Implementation Plan: Refactor 009 - Parser/Builder API Symmetry

**Branch**: `refactor/009-make-parser-api`
**Target**: Make parser API symmetric with builder API for JSON Schema-compatible types

---

## Discovery Summary

### What Already Exists ✅
- EnumParser class (`src/JsonSchema/parsers/EnumParser.ts`)
- ConstParser class (`src/JsonSchema/parsers/ConstParser.ts`)
- Both registered in `registry.ts` and handled by `selectParserClass()`
- BaseParser template method pattern in place
- 9 parser methods currently exported (object, array, string, number, boolean, null, anyOf, allOf, oneOf)

### What Needs to Be Added ❌
- `parse.enum()` and `parse.const()` methods (classes exist, just need API exposure)
- TupleParser class and `parse.tuple()` method
- Convenience aliases: `parse.union()`, `parse.intersection()`, `parse.discriminatedUnion()`
- Special type methods: `parse.any()`, `parse.unknown()`, `parse.never()`
- RecordParser class and `parse.record()` method (Phase 2)
- Naming consistency: `parse.Schema` → `parse.schema` (with deprecated alias)
- Comprehensive documentation

---

## Phase 0: Testing Gap Assessment (4.5 days)

### Task 0.1: Assess Current Coverage (1 day)
**Goal**: Document existing test coverage for affected code

**Steps**:
1. Run coverage report: `pnpm test --coverage`
2. Analyze coverage for:
   - `src/JsonSchema/parsers/index.ts`
   - `src/JsonSchema/parsers/EnumParser.ts`
   - `src/JsonSchema/parsers/ConstParser.ts`
   - `src/JsonSchema/parsers/registry.ts`
   - `src/JsonSchema/index.ts`
3. Document findings in `testing-gaps.md`
4. Identify specific gaps in test coverage

**Deliverable**: Updated `testing-gaps.md` with current coverage metrics

---

### Task 0.2: Create Test Suite for Existing Parsers (1.5 days)
**Goal**: Ensure EnumParser and ConstParser have adequate test coverage

**Files to Create/Modify**:
- `test/JsonSchema/parsers/EnumParser.test.ts`
- `test/JsonSchema/parsers/ConstParser.test.ts`

**EnumParser Tests** (> 90% coverage):
```typescript
describe('EnumParser', () => {
  it('should parse enum with string values', () => {
    const schema = { enum: ['red', 'green', 'blue'] };
    const builder = new EnumParser(schema, refs).parse();
    expect(builder.toString()).toBe("z.enum(['red', 'green', 'blue'])");
  });

  it('should parse enum with number values', () => {
    const schema = { enum: [1, 2, 3] };
    // Implementation handles mixed types
  });

  it('should parse enum with mixed values', () => {
    const schema = { enum: ['a', 1, true, null] };
    // Test mixed type enum handling
  });

  it('should handle single value enum', () => {
    const schema = { enum: ['single'] };
    // Edge case: single value
  });

  it('should handle empty enum array', () => {
    const schema = { enum: [] };
    // Edge case: empty enum
  });
});
```

**ConstParser Tests** (> 90% coverage):
```typescript
describe('ConstParser', () => {
  it('should parse const with string value', () => {
    const schema = { const: 'fixed' };
    const builder = new ConstParser(schema, refs).parse();
    expect(builder.toString()).toBe("z.literal('fixed')");
  });

  it('should parse const with number value');
  it('should parse const with boolean value');
  it('should parse const with null value');
  it('should parse const with object value');
  it('should parse const with array value');
});
```

**Acceptance**:
- [ ] All tests pass
- [ ] Coverage > 90% for both EnumParser and ConstParser
- [ ] Edge cases handled

---

### Task 0.3: Create Test Suite for Parser API Methods (1 day)
**Goal**: Test suite for existing 9 parser API methods

**File**: `test/parsers/api-methods.test.ts`

**Tests**:
```typescript
describe('Parser API Methods', () => {
  const refs = createTestRefs();

  describe('parse.object()', () => {
    it('should parse object with properties', () => {
      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' }
        }
      };
      const builder = parse.object(schema, refs);
      expect(builder.toString()).toContain('z.object');
    });
  });

  describe('parse.array()', () => { /* ... */ });
  describe('parse.string()', () => { /* ... */ });
  describe('parse.number()', () => { /* ... */ });
  describe('parse.boolean()', () => { /* ... */ });
  describe('parse.null()', () => { /* ... */ });
  describe('parse.anyOf()', () => { /* ... */ });
  describe('parse.allOf()', () => { /* ... */ });
  describe('parse.oneOf()', () => { /* ... */ });
});
```

**Acceptance**:
- [ ] All existing 9 methods have test coverage
- [ ] Tests verify correct ZodBuilder output
- [ ] Integration with parseSchema tested

---

### Task 0.4: Create Test Template for New Features (1 day)
**Goal**: Prepare test scaffolding for new parser methods

**File**: `test/parsers/api-symmetry.test.ts`

**Tests to prepare** (will be populated during implementation):
```typescript
describe('Parser API Symmetry', () => {
  const refs = createTestRefs();

  describe('New parser methods (Phase 1)', () => {
    describe('parse.enum()', () => {
      it.todo('should parse enum schema');
    });

    describe('parse.const()', () => {
      it.todo('should parse const schema');
    });

    describe('parse.tuple()', () => {
      it.todo('should parse tuple with prefixItems');
      it.todo('should parse tuple with items array');
    });
  });

  describe('Convenience aliases (Phase 2)', () => {
    describe('parse.union()', () => {
      it.todo('should be alias for parse.anyOf()');
    });

    describe('parse.intersection()', () => {
      it.todo('should be alias for parse.allOf()');
    });

    describe('parse.discriminatedUnion()', () => {
      it.todo('should be alias for parse.oneOf()');
    });
  });

  describe('Special types (Phase 2)', () => {
    describe('parse.any()', () => {
      it.todo('should return any builder');
    });

    describe('parse.unknown()', () => {
      it.todo('should return unknown builder');
    });

    describe('parse.never()', () => {
      it.todo('should return never builder');
    });
  });
});
```

**Acceptance**:
- [ ] Test file created with todo tests
- [ ] Test structure matches implementation plan
- [ ] Ready to convert todos to real tests during implementation

---

**Phase 0 Checkpoint**:
- [ ] All existing parsers have > 90% test coverage
- [ ] All existing parser API methods tested
- [ ] Test scaffolding ready for new features
- [ ] `testing-gaps.md` fully documented
- [ ] Ready to capture baseline metrics

---

## Phase 1: Baseline Capture (0.5 days)

### Task 1.1: Capture Initial Metrics
**Goal**: Document current state before any changes

**Steps**:
1. Ensure all tests pass: `pnpm test`
2. Run coverage: `pnpm test --coverage`
3. Capture metrics (automatically done via script)
4. Document behavioral snapshot in `behavioral-snapshot.md`
5. Create git tag: `git tag pre-refactor-009 -m "Baseline before parser API symmetry"`

**Deliverable**: Completed `metrics-before.md` and git tag

---

## Phase 2: Implementation - Part 1 (Core Parsers) (2 days)

### Task 2.1: Create TupleParser Class (0.5 days)
**Goal**: Implement parser for JSON Schema tuple types

**File**: `src/JsonSchema/parsers/TupleParser.ts`

**Implementation**:
```typescript
import type { JsonSchema, JsonSchemaObject, Context } from '../../Types.js';
import { BaseParser } from './BaseParser.js';
import type { ZodBuilder } from '../../ZodBuilder/BaseBuilder.js';

export class TupleParser extends BaseParser<'tuple'> {
  readonly typeKind = 'tuple' as const;

  protected parseImpl(schema: JsonSchema): ZodBuilder {
    const s = schema as JsonSchemaObject;
    
    // JSON Schema 2020-12 uses prefixItems
    const items = s.prefixItems || 
                 (Array.isArray(s.items) ? s.items : undefined);
    
    if (!items || items.length === 0) {
      // Empty tuple
      return this.refs.build.tuple([]);
    }

    // Parse each item schema
    const itemBuilders = items.map((itemSchema, index) =>
      this.parseChild(itemSchema, `[${index}]`)
    );

    return this.refs.build.tuple(itemBuilders);
  }

  protected canProduceType(type: string): boolean {
    return type === this.typeKind || type === 'TupleBuilder';
  }
}
```

**Tests**: `test/JsonSchema/parsers/TupleParser.test.ts`
```typescript
describe('TupleParser', () => {
  it('should parse tuple with prefixItems (JSON Schema 2020-12)', () => {
    const schema = {
      prefixItems: [
        { type: 'string' },
        { type: 'number' },
        { type: 'boolean' }
      ]
    };
    const builder = new TupleParser(schema, refs).parse();
    expect(builder.toString()).toBe('z.tuple([z.string(), z.number(), z.boolean()])');
  });

  it('should parse tuple with items array (draft-07)', () => {
    const schema = {
      items: [
        { type: 'string' },
        { type: 'number' }
      ]
    };
    const builder = new TupleParser(schema, refs).parse();
    expect(builder.toString()).toBe('z.tuple([z.string(), z.number()])');
  });

  it('should parse empty tuple', () => {
    const schema = { prefixItems: [] };
    const builder = new TupleParser(schema, refs).parse();
    expect(builder.toString()).toBe('z.tuple([])');
  });

  it('should parse tuple with nested schemas', () => {
    const schema = {
      prefixItems: [
        { type: 'object', properties: { id: { type: 'number' } } },
        { type: 'array', items: { type: 'string' } }
      ]
    };
    // Test nested parsing
  });
});
```

**Acceptance**:
- [ ] TupleParser class created
- [ ] Handles both prefixItems (2020-12) and items array (draft-07)
- [ ] Tests pass with > 90% coverage
- [ ] Integrates with BaseParser template method

---

### Task 2.2: Register TupleParser in Registry (0.25 days)
**Goal**: Enable automatic tuple detection in parseSchema

**File**: `src/JsonSchema/parsers/registry.ts`

**Changes**:
1. Import TupleParser:
```typescript
import { TupleParser } from './TupleParser.js';
```

2. Add to ParserClass type:
```typescript
type ParserClass =
  | typeof ObjectParser
  | typeof ArrayParser
  // ... existing types
  | typeof TupleParser;
```

3. Add tuple detection to `selectParserClass()`:
```typescript
export function selectParserClass(schema: JsonSchema): ParserClass | undefined {
  // ... existing checks ...
  
  // Check for const (before tuple to handle const arrays)
  if (its.a.const(schema)) {
    return ConstParser;
  }
  
  // Check for tuple (prefixItems is 2020-12, items array is draft-07)
  if ('prefixItems' in schema && Array.isArray((schema as any).prefixItems)) {
    return TupleParser;
  }
  if ('items' in schema && Array.isArray((schema as any).items)) {
    return TupleParser;
  }
  
  // ... continue with existing checks ...
}
```

**Tests**: Add to `test/JsonSchema/parsers/registry.test.ts`
```typescript
describe('selectParserClass', () => {
  it('should select TupleParser for prefixItems', () => {
    const schema = { prefixItems: [{ type: 'string' }] };
    expect(selectParserClass(schema)).toBe(TupleParser);
  });

  it('should select TupleParser for items array', () => {
    const schema = { items: [{ type: 'string' }] };
    expect(selectParserClass(schema)).toBe(TupleParser);
  });
});
```

**Acceptance**:
- [ ] TupleParser registered
- [ ] selectParserClass returns TupleParser for tuple schemas
- [ ] Tests verify correct selection
- [ ] No regression in existing parser selection

---

### Task 2.3: Add Core Parser Methods to API (0.5 days)
**Goal**: Expose enum, const, and tuple parsers via parse API

**File**: `src/JsonSchema/parsers/index.ts`

**Changes**:
1. Import new parsers:
```typescript
import { EnumParser } from './EnumParser.js';
import { ConstParser } from './ConstParser.js';
import { TupleParser } from './TupleParser.js';
```

2. Add new methods to parse object:
```typescript
export const parse = {
  // ... existing methods ...

  /**
   * Parse a JSON Schema enum type.
   *
   * @param schema - The JSON Schema with enum to parse
   * @param refs - Parsing context
   * @returns A ZodBuilder representing the parsed enum
   * @example
   * const schema = { enum: ['red', 'green', 'blue'] };
   * const builder = parse.enum(schema, refs);
   * // Returns: z.enum(['red', 'green', 'blue'])
   */
  enum(schema: JsonSchemaObject & { enum: any[] }, refs: Context): ZodBuilder {
    const parser = new (EnumParser as any)(schema, refs);
    return parser.parse();
  },

  /**
   * Parse a JSON Schema const type (literal value).
   * Note: JSON Schema uses 'const', Zod uses 'literal'.
   *
   * @param schema - The JSON Schema with const to parse
   * @param refs - Parsing context
   * @returns A ZodBuilder representing the parsed const/literal
   * @example
   * const schema = { const: 'fixed' };
   * const builder = parse.const(schema, refs);
   * // Returns: z.literal('fixed')
   */
  const(schema: JsonSchemaObject & { const: any }, refs: Context): ZodBuilder {
    const parser = new (ConstParser as any)(schema, refs);
    return parser.parse();
  },

  /**
   * Parse a JSON Schema tuple type.
   * Supports both prefixItems (2020-12) and items array (draft-07).
   *
   * @param schema - The JSON Schema with tuple definition
   * @param refs - Parsing context
   * @returns A ZodBuilder representing the parsed tuple
   * @example
   * const schema = {
   *   prefixItems: [
   *     { type: 'string' },
   *     { type: 'number' }
   *   ]
   * };
   * const builder = parse.tuple(schema, refs);
   * // Returns: z.tuple([z.string(), z.number()])
   */
  tuple(
    schema: JsonSchemaObject & { prefixItems?: JsonSchema[]; items?: JsonSchema[] },
    refs: Context
  ): ZodBuilder {
    const parser = new (TupleParser as any)(schema, refs);
    return parser.parse();
  },
};
```

**Tests**: Update `test/parsers/api-symmetry.test.ts`
```typescript
describe('New parser methods (Phase 1)', () => {
  describe('parse.enum()', () => {
    it('should parse enum schema', () => {
      const schema = { enum: ['a', 'b', 'c'] };
      const builder = parse.enum(schema, refs);
      expect(builder.toString()).toBe("z.enum(['a', 'b', 'c'])");
    });
  });

  describe('parse.const()', () => {
    it('should parse const schema', () => {
      const schema = { const: 42 };
      const builder = parse.const(schema, refs);
      expect(builder.toString()).toBe('z.literal(42)');
    });
  });

  describe('parse.tuple()', () => {
    it('should parse tuple with prefixItems', () => {
      const schema = {
        prefixItems: [{ type: 'string' }, { type: 'number' }]
      };
      const builder = parse.tuple(schema, refs);
      expect(builder.toString()).toBe('z.tuple([z.string(), z.number()])');
    });
  });
});
```

**Acceptance**:
- [ ] parse.enum(), parse.const(), parse.tuple() methods added
- [ ] All methods have comprehensive JSDoc
- [ ] Tests pass with examples matching docs
- [ ] TypeScript types correct

---

### Task 2.4: Align Naming Convention (0.25 days)
**Goal**: Rename parse.Schema → parse.schema (with deprecated alias)

**File**: `src/JsonSchema/index.ts`

**Changes**:
```typescript
export const parse = {
  // class-based parse methods
  array: classParse.array,
  object: classParse.object,
  boolean: classParse.boolean,
  string: classParse.string,
  number: classParse.number,
  null: classParse.null,
  anyOf: classParse.anyOf,
  allOf: classParse.allOf,
  oneOf: classParse.oneOf,
  enum: classParse.enum,     // NEW
  const: classParse.const,   // NEW
  tuple: classParse.tuple,   // NEW

  // functional helpers (lowercase naming)
  default: parseDefault,
  discriminator: undefined,

  // Multi-schema support (aligned naming)
  schema: parseSchema,  // NEW - lowercase
  ref: parseRef,        // NEW - lowercase

  // Deprecated aliases (backward compatibility)
  /**
   * @deprecated Use parse.schema instead
   */
  Schema: parseSchema,
  
  /**
   * @deprecated Use parse.ref instead
   */
  Ref: parseRef,
};
```

**Tests**: Add deprecation tests
```typescript
describe('Naming consistency', () => {
  it('should have lowercase schema method', () => {
    expect(typeof parse.schema).toBe('function');
  });

  it('should maintain deprecated Schema alias', () => {
    expect(parse.Schema).toBe(parse.schema);
  });

  it('should have lowercase ref method', () => {
    expect(typeof parse.ref).toBe('function');
  });

  it('should maintain deprecated Ref alias', () => {
    expect(parse.Ref).toBe(parse.ref);
  });
});
```

**Acceptance**:
- [ ] parse.schema and parse.ref use lowercase
- [ ] parse.Schema and parse.Ref still work (deprecated)
- [ ] JSDoc @deprecated tags added
- [ ] All internal usages updated to lowercase
- [ ] Tests verify both versions work

---

**Phase 2 Checkpoint**:
- [ ] TupleParser created and tested (> 90% coverage)
- [ ] All core parsers registered in registry
- [ ] parse.enum(), parse.const(), parse.tuple() methods added
- [ ] Naming aligned (lowercase, with deprecated aliases)
- [ ] All tests pass
- [ ] No breaking changes

---

## Phase 3: Implementation - Part 2 (Aliases & Remaining) (1.5 days)

### Task 3.1: Add Convenience Aliases (0.5 days)
**Goal**: Add Zod-terminology aliases for compound types

**File**: `src/JsonSchema/parsers/index.ts`

**Add to parse object**:
```typescript
export const parse = {
  // ... existing methods ...

  /**
   * Parse a union type. Convenience alias for parse.anyOf().
   * JSON Schema uses 'anyOf', Zod uses 'union'.
   *
   * @param schema - The JSON Schema with anyOf to parse
   * @param refs - Parsing context
   * @returns A ZodBuilder representing the union
   * @example
   * const schema = {
   *   anyOf: [
   *     { type: 'string' },
   *     { type: 'number' }
   *   ]
   * };
   * const builder = parse.union(schema, refs);
   * // Returns: z.union([z.string(), z.number()])
   */
  union(schema: JsonSchemaObject & { anyOf: JsonSchema[] }, refs: Context): ZodBuilder {
    return this.anyOf(schema, refs);
  },

  /**
   * Parse an intersection type. Convenience alias for parse.allOf().
   * JSON Schema uses 'allOf', Zod uses 'intersection' or 'and'.
   *
   * @param schema - The JSON Schema with allOf to parse
   * @param refs - Parsing context
   * @returns A ZodBuilder representing the intersection
   */
  intersection(schema: JsonSchemaObject & { allOf: JsonSchema[] }, refs: Context): ZodBuilder {
    return this.allOf(schema, refs);
  },

  /**
   * Parse a discriminated union. Convenience alias for parse.oneOf().
   * Best used when oneOf has a discriminator property.
   *
   * @param schema - The JSON Schema with oneOf to parse
   * @param refs - Parsing context
   * @returns A ZodBuilder representing the discriminated union
   */
  discriminatedUnion(schema: JsonSchemaObject & { oneOf: JsonSchema[] }, refs: Context): ZodBuilder {
    return this.oneOf(schema, refs);
  },
};
```

**Tests**: Update `test/parsers/api-symmetry.test.ts`
```typescript
describe('Convenience aliases', () => {
  describe('parse.union()', () => {
    it('should be alias for parse.anyOf()', () => {
      const schema = {
        anyOf: [{ type: 'string' }, { type: 'number' }]
      };
      const unionResult = parse.union(schema, refs);
      const anyOfResult = parse.anyOf(schema, refs);
      expect(unionResult.toString()).toBe(anyOfResult.toString());
    });
  });

  describe('parse.intersection()', () => {
    it('should be alias for parse.allOf()', () => {
      const schema = {
        allOf: [
          { type: 'object', properties: { a: { type: 'string' } } },
          { type: 'object', properties: { b: { type: 'number' } } }
        ]
      };
      const intersectionResult = parse.intersection(schema, refs);
      const allOfResult = parse.allOf(schema, refs);
      expect(intersectionResult.toString()).toBe(allOfResult.toString());
    });
  });

  describe('parse.discriminatedUnion()', () => {
    it('should be alias for parse.oneOf()', () => {
      const schema = {
        oneOf: [
          { type: 'object', properties: { type: { const: 'a' } } },
          { type: 'object', properties: { type: { const: 'b' } } }
        ]
      };
      const discriminatedResult = parse.discriminatedUnion(schema, refs);
      const oneOfResult = parse.oneOf(schema, refs);
      expect(discriminatedResult.toString()).toBe(oneOfResult.toString());
    });
  });
});
```

**Acceptance**:
- [ ] Three alias methods added
- [ ] All aliases properly documented with JSDoc
- [ ] Tests verify aliases produce identical output
- [ ] No duplication of parser logic

---

### Task 3.2: Add Special Type Methods (0.25 days)
**Goal**: Add methods for any, unknown, never types

**File**: `src/JsonSchema/parsers/index.ts`

**Add to parse object**:
```typescript
export const parse = {
  // ... existing methods ...

  /**
   * Create an 'any' type builder.
   * Note: 'any' has no direct JSON Schema equivalent (empty schema {} implies any).
   *
   * @param _schema - Unused, for API consistency
   * @param refs - Parsing context
   * @returns A ZodBuilder representing z.any()
   */
  any(_schema: JsonSchemaObject, refs: Context): ZodBuilder {
    return refs.build.any();
  },

  /**
   * Create an 'unknown' type builder.
   * Note: 'unknown' has no direct JSON Schema equivalent.
   *
   * @param _schema - Unused, for API consistency
   * @param refs - Parsing context
   * @returns A ZodBuilder representing z.unknown()
   */
  unknown(_schema: JsonSchemaObject, refs: Context): ZodBuilder {
    return refs.build.unknown();
  },

  /**
   * Create a 'never' type builder.
   * JSON Schema equivalent: { not: {} } or schema that can never validate.
   *
   * @param _schema - Unused, for API consistency
   * @param refs - Parsing context
   * @returns A ZodBuilder representing z.never()
   */
  never(_schema: JsonSchemaObject, refs: Context): ZodBuilder {
    return refs.build.never();
  },
};
```

**Tests**: Update `test/parsers/api-symmetry.test.ts`
```typescript
describe('Special types', () => {
  describe('parse.any()', () => {
    it('should return any builder', () => {
      const builder = parse.any({}, refs);
      expect(builder.toString()).toBe('z.any()');
    });
  });

  describe('parse.unknown()', () => {
    it('should return unknown builder', () => {
      const builder = parse.unknown({}, refs);
      expect(builder.toString()).toBe('z.unknown()');
    });
  });

  describe('parse.never()', () => {
    it('should return never builder', () => {
      const builder = parse.never({}, refs);
      expect(builder.toString()).toBe('z.never()');
    });
  });
});
```

**Acceptance**:
- [ ] Three special type methods added
- [ ] Methods documented with JSDoc
- [ ] Tests verify correct builder types returned

---

### Task 3.3: Create RecordParser (0.5 days) [DEFERRED TO PHASE 2]
**Goal**: Implement parser for JSON Schema record/additionalProperties patterns

**File**: `src/JsonSchema/parsers/RecordParser.ts`

**Implementation**:
```typescript
import type { JsonSchema, JsonSchemaObject, Context } from '../../Types.js';
import { BaseParser } from './BaseParser.js';
import type { ZodBuilder } from '../../ZodBuilder/BaseBuilder.js';

export class RecordParser extends BaseParser<'record'> {
  readonly typeKind = 'record' as const;

  protected parseImpl(schema: JsonSchema): ZodBuilder {
    const s = schema as JsonSchemaObject;
    
    // additionalProperties defines the value type
    const valueSchema = s.additionalProperties;
    
    if (typeof valueSchema === 'boolean') {
      if (valueSchema === true) {
        // additionalProperties: true → record(string(), any())
        return this.refs.build.record(
          this.refs.build.string(),
          this.refs.build.any()
        );
      } else {
        // additionalProperties: false → strict object (not a record)
        // This shouldn't reach RecordParser, but handle gracefully
        return this.refs.build.object({});
      }
    }
    
    // additionalProperties is a schema
    const keyBuilder = this.refs.build.string(); // keys are always strings
    const valueBuilder = this.parseChild(valueSchema || {}, 'additionalProperties');
    
    return this.refs.build.record(keyBuilder, valueBuilder);
  }

  protected canProduceType(type: string): boolean {
    return type === this.typeKind || type === 'RecordBuilder';
  }
}
```

**Tests**: `test/JsonSchema/parsers/RecordParser.test.ts`
```typescript
describe('RecordParser', () => {
  it('should parse additionalProperties with schema', () => {
    const schema = {
      type: 'object',
      additionalProperties: { type: 'string' }
    };
    const builder = new RecordParser(schema, refs).parse();
    expect(builder.toString()).toBe('z.record(z.string(), z.string())');
  });

  it('should parse additionalProperties: true', () => {
    const schema = {
      type: 'object',
      additionalProperties: true
    };
    const builder = new RecordParser(schema, refs).parse();
    expect(builder.toString()).toBe('z.record(z.string(), z.any())');
  });

  it('should parse record with complex value type', () => {
    const schema = {
      type: 'object',
      additionalProperties: {
        type: 'object',
        properties: { id: { type: 'number' } }
      }
    };
    // Test nested schema parsing
  });
});
```

**Note**: RecordParser requires careful integration with ObjectParser. May need to adjust ObjectParser to detect record patterns.

**Acceptance**:
- [ ] RecordParser class created
- [ ] Handles additionalProperties: schema, true, false
- [ ] Tests pass with > 90% coverage
- [ ] Integration with ObjectParser verified

---

### Task 3.4: Add parse.record() Method (0.25 days)
**Goal**: Expose RecordParser via parse API

**File**: `src/JsonSchema/parsers/index.ts`

**Add to parse object**:
```typescript
/**
 * Parse a record type (object with additionalProperties).
 * JSON Schema uses additionalProperties, Zod uses record().
 *
 * @param schema - The JSON Schema with additionalProperties
 * @param refs - Parsing context
 * @returns A ZodBuilder representing the record
 * @example
 * const schema = {
 *   type: 'object',
 *   additionalProperties: { type: 'string' }
 * };
 * const builder = parse.record(schema, refs);
 * // Returns: z.record(z.string(), z.string())
 */
record(
  schema: JsonSchemaObject & { additionalProperties?: JsonSchema | boolean },
  refs: Context
): ZodBuilder {
  const parser = new (RecordParser as any)(schema, refs);
  return parser.parse();
},
```

**Tests**: Update `test/parsers/api-symmetry.test.ts`
```typescript
describe('parse.record()', () => {
  it('should parse record schema', () => {
    const schema = {
      type: 'object',
      additionalProperties: { type: 'number' }
    };
    const builder = parse.record(schema, refs);
    expect(builder.toString()).toBe('z.record(z.string(), z.number())');
  });
});
```

**Acceptance**:
- [ ] parse.record() method added
- [ ] Method documented with JSDoc
- [ ] Tests pass
- [ ] Integration verified

---

**Phase 3 Checkpoint**:
- [ ] All convenience aliases added (union, intersection, discriminatedUnion)
- [ ] Special type methods added (any, unknown, never)
- [ ] RecordParser created and tested
- [ ] parse.record() method added
- [ ] All tests pass
- [ ] Parser API now has 15+ methods

---

## Phase 4: Documentation (2 days)

### Task 4.1: Update API Documentation (1 day)
**Goal**: Document all new parser methods in main API docs

**File**: `docs/API.md`

**Section to Add**: "Parser API vs Builder API"
```markdown
## Parser API vs Builder API

The parser API provides direct access to parser classes for converting JSON Schema to Zod builders. It mirrors the builder API for all JSON Schema-compatible types.

### Symmetry Overview

| JSON Schema Feature | Parser Method | Builder Method | Notes |
|---------------------|---------------|----------------|-------|
| `type: "string"` | `parse.string()` | `build.string()` | ✅ Symmetric |
| `type: "number"` | `parse.number()` | `build.number()` | ✅ Symmetric |
| `type: "boolean"` | `parse.boolean()` | `build.boolean()` | ✅ Symmetric |
| `type: "null"` | `parse.null()` | `build.null()` | ✅ Symmetric |
| `type: "object"` | `parse.object()` | `build.object()` | ✅ Symmetric |
| `type: "array"` | `parse.array()` | `build.array()` | ✅ Symmetric |
| `enum` | `parse.enum()` | `build.enum()` | ✅ Symmetric |
| `const` | `parse.const()` | `build.literal()` | ⚠️ Different naming |
| `prefixItems`/`items[]` | `parse.tuple()` | `build.tuple()` | ✅ Symmetric |
| `additionalProperties` | `parse.record()` | `build.record()` | ✅ Symmetric |
| `anyOf` | `parse.anyOf()` | `build.union()` | ⚠️ Different naming |
| `allOf` | `parse.allOf()` | `build.intersection()` | ⚠️ Different naming |
| `oneOf` | `parse.oneOf()` | `build.discriminatedUnion()` | ⚠️ Different naming |

### Convenience Aliases

For Zod terminology familiarity:
- `parse.union()` → alias for `parse.anyOf()`
- `parse.intersection()` → alias for `parse.allOf()`
- `parse.discriminatedUnion()` → alias for `parse.oneOf()`

### Zod-Only Types (No JSON Schema Equivalent)

These builder types have no JSON Schema equivalent:
- `build.promise()` - Promises cannot be represented in JSON Schema
- `build.lazy()` - Lazy evaluation is runtime-only
- `build.function()` - Functions cannot be serialized to JSON
- `build.codec()` - Transformation is runtime-only
- `build.preprocess()` - Preprocessing is runtime-only
- `build.pipe()` - Piping is runtime-only
- `build.date()` - Could be simulated with `format: "date-time"`
- `build.bigint()` - Could be simulated with string/number
- `build.symbol()`, `build.nan()`, `build.void()`, `build.undefined()` - No JSON representation

### Usage Examples

#### Direct Parser API
\`\`\`typescript
import { parse } from 'x-to-zod/JsonSchema';
import { buildV4 } from 'x-to-zod/ZodBuilder/v4';

const refs = {
  seen: new Map(),
  path: [],
  matchPath: () => false,
  build: buildV4
};

// Parse enum
const enumSchema = { enum: ['red', 'green', 'blue'] };
const enumBuilder = parse.enum(enumSchema, refs);
console.log(enumBuilder.toString());
// z.enum(['red', 'green', 'blue'])

// Parse const (literal)
const constSchema = { const: 42 };
const constBuilder = parse.const(constSchema, refs);
console.log(constBuilder.toString());
// z.literal(42)

// Parse tuple
const tupleSchema = {
  prefixItems: [
    { type: 'string' },
    { type: 'number' }
  ]
};
const tupleBuilder = parse.tuple(tupleSchema, refs);
console.log(tupleBuilder.toString());
// z.tuple([z.string(), z.number()])
\`\`\`

#### Using Convenience Aliases
\`\`\`typescript
// Using Zod terminology
const unionSchema = {
  anyOf: [{ type: 'string' }, { type: 'number' }]
};
const unionBuilder = parse.union(unionSchema, refs);
// Same as: parse.anyOf(unionSchema, refs)
\`\`\`
```

**Acceptance**:
- [ ] Parser/Builder comparison table added
- [ ] All new methods documented
- [ ] Usage examples provided
- [ ] Zod-only types clearly listed

---

### Task 4.2: Update Parser Architecture Docs (0.5 days)
**Goal**: Document API design principles and symmetry goal

**File**: `docs/parser-architecture.md`

**Section to Add**: "API Design Principles"
```markdown
## API Design Principles

### Symmetry Goal

The parser API design follows these principles:

1. **JSON Schema Terminology**: Parser methods use JSON Schema keyword names
   - `parse.const()` not `parse.literal()` (even though Zod uses literal)
   - `parse.enum()` (both use enum)
   - `parse.anyOf()` not `parse.union()` (but union alias provided)

2. **Convenience Aliases**: Provide aliases for Zod terminology
   - `parse.union()` → `parse.anyOf()`
   - `parse.intersection()` → `parse.allOf()`
   - Users can choose based on mental model

3. **Scope**: Only JSON Schema-compatible types
   - No parser for `promise`, `lazy`, `function`, etc.
   - These are Zod-specific runtime types
   - Cannot be represented in static JSON Schema

4. **Consistency**: All methods follow same pattern
   - Accept schema and refs parameters
   - Return ZodBuilder
   - Instantiate parser class and call .parse()

### When to Use Parser API vs parseSchema

**Use `parseSchema()`** (recommended):
- Converting arbitrary JSON Schema
- Need automatic parser selection
- Want full feature support (refs, processors, etc.)
- Don't know schema structure in advance

**Use direct parser methods** (advanced):
- You know the exact schema type
- Want explicit control over parsing
- Building custom parsing logic
- Performance-critical tight loops

### Adding New Parser Methods

When adding a new parser method:
1. Create parser class extending BaseParser
2. Register in registry.ts
3. Add method to parsers/index.ts
4. Use JSON Schema terminology for method name
5. Add comprehensive JSDoc with examples
6. Create test suite (> 90% coverage)
7. Update documentation
```

**Acceptance**:
- [ ] API design principles documented
- [ ] Guidance on when to use parser API vs parseSchema
- [ ] Instructions for adding new parsers
- [ ] Clear rationale for naming decisions

---

### Task 4.3: Create API Symmetry Reference (0.5 days)
**Goal**: Create comprehensive reference document

**File**: `docs/api-symmetry.md` (NEW)

**Content**:
```markdown
# Parser/Builder API Symmetry Reference

This document provides a comprehensive mapping between JSON Schema keywords, parser methods, and builder methods.

## Quick Reference Table

| Category | JSON Schema | Parser API | Builder API | Status |
|----------|-------------|------------|-------------|--------|
| **Primitives** |
| String | `type: "string"` | `parse.string()` | `build.string()` | ✅ |
| Number | `type: "number"` | `parse.number()` | `build.number()` | ✅ |
| Integer | `type: "integer"` | `parse.number()` | `build.number().int()` | ✅ |
| Boolean | `type: "boolean"` | `parse.boolean()` | `build.boolean()` | ✅ |
| Null | `type: "null"` | `parse.null()` | `build.null()` | ✅ |
| **Structured** |
| Object | `type: "object"` | `parse.object()` | `build.object()` | ✅ |
| Array | `type: "array"` | `parse.array()` | `build.array()` | ✅ |
| Tuple | `prefixItems` / `items[]` | `parse.tuple()` | `build.tuple()` | ✅ |
| Record | `additionalProperties` | `parse.record()` | `build.record()` | ✅ |
| **Literals** |
| Enum | `enum: [...]` | `parse.enum()` | `build.enum()` | ✅ |
| Const | `const: value` | `parse.const()` | `build.literal()` | ⚠️ Name diff |
| **Combinators** |
| AnyOf (Union) | `anyOf: [...]` | `parse.anyOf()` | `build.union()` | ⚠️ Name diff |
|  |  | `parse.union()` *(alias)* |  | ✅ |
| AllOf (Intersection) | `allOf: [...]` | `parse.allOf()` | `build.intersection()` | ⚠️ Name diff |
|  |  | `parse.intersection()` *(alias)* |  | ✅ |
| OneOf | `oneOf: [...]` | `parse.oneOf()` | `build.discriminatedUnion()` | ⚠️ Name diff |
|  |  | `parse.discriminatedUnion()` *(alias)* |  | ✅ |
| **Special** |
| Any | `{}` (empty schema) | `parse.any()` | `build.any()` | ✅ |
| Unknown | N/A | `parse.unknown()` | `build.unknown()` | ✅ |
| Never | `not: {}` | `parse.never()` | `build.never()` | ✅ |

## Zod-Only Types (No Parser)

| Builder Method | Why No Parser | Alternative |
|----------------|---------------|-------------|
| `build.promise()` | Promises aren't JSON-serializable | N/A |
| `build.lazy()` | Runtime lazy evaluation | Use $ref for recursion |
| `build.function()` | Functions aren't JSON-serializable | N/A |
| `build.codec()` | Runtime transformation | Use postProcessors |
| `build.preprocess()` | Runtime transformation | Use preProcessors |
| `build.pipe()` | Runtime transformation | Use postProcessors |
| `build.date()` | No native JSON date | Use `format: "date-time"` |
| `build.bigint()` | No native JSON bigint | Use `type: "string"` with pattern |
| `build.symbol()` | Not JSON-serializable | N/A |
| `build.nan()` | JSON doesn't support NaN | N/A |
| `build.void()` | Not JSON-serializable | Use `type: "null"` |
| `build.undefined()` | JSON doesn't have undefined | Omit property |
| `build.set()` | Not directly JSON-serializable | Use `type: "array"` with `uniqueItems` |
| `build.map()` | Not directly JSON-serializable | Use `type: "object"` or custom |

## Naming Rationale

### Why Different Names?

**Parser uses JSON Schema terms**:
- Input is JSON Schema → use JSON Schema vocabulary
- Makes it clear what JSON Schema keyword maps to what parser
- Example: `const` keyword → `parse.const()` method

**Builder uses Zod terms**:
- Output is Zod code → use Zod vocabulary
- Matches Zod API users are familiar with
- Example: Zod has `z.literal()` → `build.literal()` method

### Convenience Aliases

To bridge the terminology gap, we provide aliases:
- `parse.union()` = `parse.anyOf()` (Zod term for anyOf)
- `parse.intersection()` = `parse.allOf()` (Zod term for allOf)
- `parse.discriminatedUnion()` = `parse.oneOf()` (Zod term when used with discriminator)

Users can choose based on their mental model.

## Migration Guide

### If You Were Using parseSchema

No changes needed! `parseSchema()` automatically uses new parsers.

### If You Want Direct Parser Access

\`\`\`typescript
// Before: Only 9 methods available
parse.object(schema, refs);
parse.array(schema, refs);
// ... 7 others

// After: 15+ methods available
parse.enum(schema, refs);      // NEW
parse.const(schema, refs);     // NEW
parse.tuple(schema, refs);     // NEW
parse.union(schema, refs);     // NEW (alias)
parse.record(schema, refs);    // NEW
parse.any(schema, refs);       // NEW
// ... and more
\`\`\`

### Deprecated Names

Old naming is still supported with deprecation warnings:
\`\`\`typescript
// Old (deprecated but works)
parse.Schema(schema, refs);

// New (recommended)
parse.schema(schema, refs);
\`\`\`
```

**Acceptance**:
- [ ] Comprehensive reference table created
- [ ] Zod-only types clearly documented
- [ ] Naming rationale explained
- [ ] Migration guide provided

---

**Phase 4 Checkpoint**:
- [ ] All documentation updated
- [ ] API reference complete
- [ ] Examples provided
- [ ] Migration guide available

---

## Phase 5: Validation (1 day)

### Task 5.1: Run Full Test Suite
**Goal**: Verify all tests pass

**Steps**:
```bash
pnpm test
```

**Acceptance**:
- [ ] All tests pass (100% pass rate)
- [ ] No test failures
- [ ] No new warnings

---

### Task 5.2: Measure Final Metrics
**Goal**: Capture post-refactor metrics

**Steps**:
```bash
pnpm test --coverage
# Metrics captured in metrics-after.md
```

**Compare metrics**:
- [ ] Test coverage maintained or increased (target: > 95%)
- [ ] Build time no regression (< 5% increase)
- [ ] Bundle size acceptable (< 5KB increase)
- [ ] No performance regression in parseSchema

**Acceptance**:
- [ ] metrics-after.md created
- [ ] All target metrics met
- [ ] No unacceptable regressions

---

### Task 5.3: Verify Behavioral Snapshot
**Goal**: Confirm behavior unchanged

**Steps**:
1. Re-run behavioral snapshot tests from `behavioral-snapshot.md`
2. Compare outputs before/after
3. Verify identical behavior

**Key checks**:
- [ ] parseSchema selects correct parsers
- [ ] Existing parser methods produce identical output
- [ ] Context threading works correctly
- [ ] Post-processors still apply
- [ ] Circular references handled
- [ ] Export structure unchanged

**Acceptance**:
- [ ] All behavioral snapshots match
- [ ] No behavior regressions
- [ ] External contracts preserved

---

### Task 5.4: API Symmetry Verification
**Goal**: Confirm symmetry goals achieved

**Manual checks**:
```typescript
// List all parser methods
const parserMethods = Object.keys(parse);
console.log('Parser API methods:', parserMethods.length);
// Expected: 15+ methods

// List all builder methods
const builderMethods = Object.keys(buildV4);
console.log('Builder API methods:', builderMethods.length);

// Calculate symmetry ratio for JSON Schema types
const jsonSchemaBuilderTypes = 15; // JSON Schema-compatible types
const parserApiMethods = 15;
const symmetryRatio = parserApiMethods / jsonSchemaBuilderTypes;
console.log('Symmetry ratio:', symmetryRatio);
// Expected: 1.0 (100% coverage)
```

**Acceptance**:
- [ ] Parser API has 15+ methods
- [ ] All JSON Schema-compatible types have parsers
- [ ] Symmetry ratio = 1.0
- [ ] Zod-only types documented (no parsers expected)

---

### Task 5.5: Request Peer Review
**Goal**: Get external validation

**Items for review**:
- [ ] Refactor spec accuracy
- [ ] Implementation correctness
- [ ] Test coverage adequacy
- [ ] Documentation completeness
- [ ] API design decisions
- [ ] Backward compatibility

**Acceptance**:
- [ ] Peer review completed
- [ ] All feedback addressed
- [ ] Approved for merge

---

**Phase 5 Checkpoint**:
- [ ] All tests pass
- [ ] Metrics meet targets
- [ ] Behavior verified unchanged
- [ ] API symmetry confirmed
- [ ] Peer review approved
- [ ] Ready to merge

---

## Phase 6: Merge & Monitor (0.5 days)

### Task 6.1: Final Pre-Merge Checks
**Goal**: Last verification before merge

**Steps**:
1. Rebase on latest master
2. Resolve any conflicts
3. Run full test suite again
4. Verify build succeeds
5. Check for lint errors

**Acceptance**:
- [ ] Up to date with master
- [ ] All tests pass post-rebase
- [ ] Build succeeds
- [ ] No lint errors
- [ ] No merge conflicts

---

### Task 6.2: Update Changelog
**Goal**: Document changes for users

**File**: `CHANGELOG.md`

**Entry**:
```markdown
## [Unreleased]

### Added
- **Parser API Symmetry**: Added 6+ new parser methods to match builder API for JSON Schema-compatible types
  - `parse.enum()` - Parse JSON Schema enum types
  - `parse.const()` - Parse JSON Schema const (literal values)
  - `parse.tuple()` - Parse JSON Schema tuple types (prefixItems/items array)
  - `parse.union()` - Convenience alias for anyOf
  - `parse.intersection()` - Convenience alias for allOf
  - `parse.discriminatedUnion()` - Convenience alias for oneOf
  - `parse.any()`, `parse.unknown()`, `parse.never()` - Special type methods
  - `parse.record()` - Parse additionalProperties as record types
- TupleParser class for parsing JSON Schema tuple types
- RecordParser class for parsing additionalProperties patterns
- Comprehensive documentation on parser/builder API symmetry

### Changed
- **Naming Consistency**: Renamed parse.Schema → parse.schema (lowercase)
  - Old names (parse.Schema, parse.Ref) still work but are deprecated
  - All internal usages updated to lowercase convention
  
### Documentation
- Added `docs/api-symmetry.md` - comprehensive parser/builder reference
- Updated `docs/API.md` - parser vs builder comparison  
- Updated `docs/parser-architecture.md` - API design principles

### Improved
- Better API discoverability - parser methods match JSON Schema keywords
- Developer experience - can choose JSON Schema or Zod terminology
- Test coverage increased for parser classes and methods
```

**Acceptance**:
- [ ] Changelog updated
- [ ] All changes documented
- [ ] User-facing changes highlighted

---

### Task 6.3: Merge to Master
**Goal**: Integrate changes

**Steps**:
```bash
git checkout master
git merge --no-ff refactor/009-make-parser-api
git push origin master
```

**Acceptance**:
- [ ] Merged to master
- [ ] Pushed to remote
- [ ] CI passes on master

---

### Task 6.4: Monitor for Issues
**Goal**: Watch for problems post-merge

**Duration**: 2 weeks

**What to monitor**:
- [ ] GitHub issues related to parser API
- [ ] User questions about new methods
- [ ] Bug reports about enum/const/tuple parsing
- [ ] Performance complaints
- [ ] Breaking change reports

**Action items**:
- Respond to issues within 24 hours
- Fix critical bugs immediately
- Document common questions in FAQ

**Success criteria**:
- No critical bugs reported
- < 2 minor bugs in 2 weeks
- Positive user feedback on API improvements

---

**Phase 6 Checkpoint**:
- [ ] Changes merged
- [ ] Changelog updated
- [ ] Monitoring active
- [ ] No critical issues
- [ ] Refactor complete! 🎉

---

## Timeline Summary

| Phase | Tasks | Duration | Cumulative |
|-------|-------|----------|------------|
| Phase 0 | Testing gap assessment | 4.5 days | 4.5 days |
| Phase 1 | Baseline capture | 0.5 days | 5 days |
| Phase 2 | Core parsers (enum, const, tuple) | 2 days | 7 days |
| Phase 3 | Aliases & remaining (union, record, etc.) | 1.5 days | 8.5 days |
| Phase 4 | Documentation | 2 days | 10.5 days |
| Phase 5 | Validation | 1 day | 11.5 days |
| Phase 6 | Merge & monitor | 0.5 days | 12 days |

**Total effort**: ~12 working days

---

## Risk Mitigation

### High-Risk Areas
1. **TupleParser registry integration** - May conflict with array detection
   - Mitigation: Test registry selection thoroughly
   - Fallback: Adjust priority order in selectParserClass

2. **RecordParser vs ObjectParser** - Overlapping concerns with additionalProperties
   - Mitigation: Clear separation of concerns, comprehensive tests
   - Fallback: Make RecordParser opt-in via explicit method call

3. **Backward compatibility** - Deprecated names must continue working
   - Mitigation: Maintain aliases, comprehensive deprecation tests
   - Fallback: Keep old names indefinitely if needed

### Rollback Plan
If critical issues discovered:
1. Revert merge commit on master
2. Create hotfix branch
3. Address issues
4. Re-merge when fixed

---

## Success Criteria Checklist

- [ ] Parser API has 15+ methods (currently 9)
- [ ] All JSON Schema-compatible types covered
- [ ] EnumParser, ConstParser, TupleParser functional
- [ ] RecordParser handles additionalProperties
- [ ] Convenience aliases work (union, intersection, discriminatedUnion)
- [ ] Naming consistent (lowercase: parse.schema, parse.ref)
- [ ] Deprecated aliases maintained (parse.Schema, parse.Ref)
- [ ] Test coverage > 95%
- [ ] All tests pass (100% pass rate)
- [ ] Documentation complete and accurate
- [ ] No performance regression > 5%
- [ ] Peer review approved
- [ ] No critical bugs in 2 weeks post-merge

---

## References

- [Refactor Spec](./refactor-spec.md)
- [Testing Gaps](./testing-gaps.md)
- [Behavioral Snapshot](./behavioral-snapshot.md)
- [Metrics Before](./metrics-before.md)
- [Parser Architecture Docs](../../docs/parser-architecture.md)
- [BaseParser Template Method](../../src/JsonSchema/parsers/BaseParser.ts)
