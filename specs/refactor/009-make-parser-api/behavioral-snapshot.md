# Behavioral Snapshot: Refactor 009 - Parser/Builder API Symmetry

**Purpose**: Document observable behaviors before refactoring to verify they're preserved after.
**Refactor ID**: refactor-009
**Created**: 2026-02-15

## Key Behaviors to Preserve

### Behavior 1: parseSchema Selects Correct Parser Class
**Description**: parseSchema must continue to select the correct parser class via registry for all schema types

**Input**: Various JSON Schema objects
```typescript
const stringSchema = { type: 'string' };
const objectSchema = { type: 'object', properties: {} };
const arraySchema = { type: 'array', items: {} };
const anyOfSchema = { anyOf: [{ type: 'string' }, { type: 'number' }] };
```

**Expected Output**:
- stringSchema → StringParser
- objectSchema → ObjectParser
- arraySchema → ArrayParser
- anyOfSchema → AnyOfParser

**Actual Output** (before refactor): [TO BE DOCUMENTED]
**Actual Output** (after refactor): [MUST MATCH BEFORE]

**Verification Command**:
```bash
pnpm test -- parseSchema.test.ts
```

---

### Behavior 2: Existing Parser Methods Produce Identical ZodBuilder Output
**Description**: parse.object(), parse.array(), etc. must produce identical ZodBuilder instances

**Input**: Standard schemas for each parser type
```typescript
import { parse } from 'x-to-zod/JsonSchema';
import { buildV4 } from 'x-to-zod/ZodBuilder/v4';

const refs = {
  seen: new Map(),
  path: [],
  matchPath: () => false,
  build: buildV4
};

const objectSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'number' }
  }
};
const arraySchema = { type: 'array', items: { type: 'string' } };
const stringSchema = { type: 'string', minLength: 5 };
```

**Expected Output**:
```typescript
parse.object(objectSchema, refs).toString();
// "z.object({ name: z.string(), age: z.number() })"

parse.array(arraySchema, refs).toString();
// "z.array(z.string())"

parse.string(stringSchema, refs).toString();
// "z.string().min(5)"
```

**Actual Output** (before refactor): [TO BE DOCUMENTED]
**Actual Output** (after refactor): [MUST MATCH BEFORE]

**Verification Command**:
```bash
pnpm test -- parsers/index.test.ts
```

---

### Behavior 3: Parser Class Instantiation and .parse() Method
**Description**: Creating parser instances and calling .parse() must work identically

**Input**: Direct parser class instantiation
```typescript
import { ObjectParser } from 'x-to-zod/JsonSchema/parsers/ObjectParser';
import { buildV4 } from 'x-to-zod/ZodBuilder/v4';

const schema = {
  type: 'object',
  properties: { id: { type: 'number' } }
};
const refs = {
  seen: new Map(),
  path: [],
  matchPath: () => false,
  build: buildV4
};

const parser = new ObjectParser(schema, refs);
const builder = parser.parse();
```

**Expected Output**:
- parser instance created successfully
- builder.toString() returns "z.object({ id: z.number() })"

**Actual Output** (before refactor): [TO BE DOCUMENTED]
**Actual Output** (after refactor): [MUST MATCH BEFORE]

**Verification Command**:
```bash
pnpm test -- JsonSchema/parsers/ObjectParser.test.ts
```

---

### Behavior 4: Context (refs) Threading Through Nested Parsers
**Description**: Context must be correctly passed through nested parser calls

**Input**: Nested schema structure
```typescript
const nestedSchema = {
  type: 'object',
  properties: {
    user: {
      type: 'object',
      properties: {
        profile: {
          type: 'object',
          properties: {
            name: { type: 'string' }
          }
        }
      }
    }
  }
};
```

**Expected Output**:
- All nested objects parsed correctly
- Path tracking preserved (refs.path)
- Circular reference detection works (refs.seen)
- Builder produces: "z.object({ user: z.object({ profile: z.object({ name: z.string() }) }) })"

**Actual Output** (before refactor): [TO BE DOCUMENTED]
**Actual Output** (after refactor): [MUST MATCH BEFORE]

**Verification Command**:
```bash
pnpm test -- jsonSchemaToZod.test.ts --grep "nested"
```

---

### Behavior 5: Post-Processor and Pre-Processor Application
**Description**: Processors must continue to be applied correctly during parsing

**Input**: Schema with post-processor configuration
```typescript
import { parseSchema } from 'x-to-zod/JsonSchema';
import { addOptional } from 'x-to-zod/PostProcessing';

const schema = { type: 'string' };
const refs = {
  seen: new Map(),
  path: ['myString'],
  matchPath: (pattern) => pattern === '$.myString',
  build: buildV4,
  postProcessors: [addOptional({ paths: ['$.myString'] })]
};

const builder = parseSchema(schema, refs);
```

**Expected Output**:
- Post-processor addOptional is applied
- builder.toString() includes ".optional()"

**Actual Output** (before refactor): [TO BE DOCUMENTED]
**Actual Output** (after refactor): [MUST MATCH BEFORE]

**Verification Command**:
```bash
pnpm test -- PostProcessing/
```

---

### Behavior 6: Circular Reference Handling
**Description**: Circular references must be detected and handled correctly

**Input**: Schema with circular reference
```typescript
const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    parent: { $ref: '#' }
  }
};
```

**Expected Output**:
- Circular reference detected via refs.seen
- Builder uses lazy() or appropriate Zod construct
- No infinite recursion

**Actual Output** (before refactor): [TO BE DOCUMENTED]
**Actual Output** (after refactor): [MUST MATCH BEFORE]

**Verification Command**:
```bash
pnpm test -- jsonSchemaToZod.test.ts --grep "circular"
```

---

### Behavior 7: Export Structure and API Surface
**Description**: Public exports from src/JsonSchema/index.ts must remain accessible

**Input**: Import statements
```typescript
import { parse, toZod, JsonSchema } from 'x-to-zod';
```

**Expected Output**:
- parse object has all expected methods
- parse.object, parse.array, etc. are functions
- parse.Schema and parse.schema both exist (latter new, former aliased)
- toZod function is exported
- JsonSchema types are exported

**Actual Output** (before refactor): [TO BE DOCUMENTED]
**Actual Output** (after refactor): [MUST MATCH BEFORE]

**Verification Command**:
```bash
pnpm test -- packageExports.test.ts
```

---

## Verification Checklist

Run these tests before and after refactoring. All outputs MUST be identical.

### Before Refactoring
- [ ] Run all tests: `pnpm test`
- [ ] Document outputs for each behavior above
- [ ] Capture test coverage: `pnpm test --coverage`
- [ ] Note any warnings or errors

### After Refactoring
- [ ] Run all tests: `pnpm test`
- [ ] Compare outputs for each behavior - MUST match
- [ ] Compare test coverage - MUST be ≥ baseline
- [ ] Verify no new warnings or errors

### Test Commands
```bash
# Run full test suite
pnpm test

# Run with coverage
pnpm test --coverage

# Run specific test files
pnpm test -- parseSchema.test.ts
pnpm test -- parsers/index.test.ts
pnpm test -- JsonSchema/parsers/ObjectParser.test.ts
pnpm test -- jsonSchemaToZod.test.ts
pnpm test -- PostProcessing/
pnpm test -- packageExports.test.ts

# Run tests matching pattern
pnpm test -- --grep "nested"
pnpm test -- --grep "circular"
```

## Success Criteria

✅ **Refactoring is successful if**:
1. All existing tests pass without modification
2. All behaviors documented above produce identical outputs
3. Test coverage is maintained or increased
4. No new runtime errors or warnings
5. API surface remains backward compatible

❌ **Refactoring FAILED if**:
1. Any existing test fails
2. Any behavior output differs
3. Test coverage decreases
4. New runtime errors occur
5. Breaking changes to public API

---

**Notes**:
- Document actual outputs during Phase 1 (Baseline)
- Re-run all verifications during Phase 3 (Validation)
- Any difference in output is a regression and must be fixed before merging
