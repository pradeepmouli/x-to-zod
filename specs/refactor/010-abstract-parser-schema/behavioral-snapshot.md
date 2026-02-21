# Behavioral Snapshot — refactor-010

**Purpose**: Document observable behavior before refactoring to verify it is preserved after.

**Refactor**: Abstract parser/schema project surface for non-JSONSchema inputs
**Branch**: `refactor/010-abstract-parser-schema`
**Captured**: 2026-02-20 (pre-refactoring baseline)

---

## Key Behaviors to Preserve

### Behavior 1: Primitive string schema

**Input**:
```json
{ "type": "string" }
```
**Expected Output**: string containing `z.string()`

**Actual Output (before)**: [ ] Verified — run `jsonSchemaToZod({ type: 'string' })`
**Actual Output (after)**: [ ] Must match

---

### Behavior 2: Primitive number schema

**Input**:
```json
{ "type": "number" }
```
**Expected Output**: string containing `z.number()`

**Actual Output (before)**: [ ] Verified
**Actual Output (after)**: [ ] Must match

---

### Behavior 3: Primitive boolean schema

**Input**:
```json
{ "type": "boolean" }
```
**Expected Output**: string containing `z.boolean()`

**Actual Output (before)**: [ ] Verified
**Actual Output (after)**: [ ] Must match

---

### Behavior 4: Primitive null schema

**Input**:
```json
{ "type": "null" }
```
**Expected Output**: string containing `z.null()`

**Actual Output (before)**: [ ] Verified
**Actual Output (after)**: [ ] Must match

---

### Behavior 5: Boolean schema `true`

**Input**:
```js
true  // (JavaScript boolean, not JSON Schema object)
```
**Expected Output**: string containing `z.any()`

**Actual Output (before)**: [ ] Verified — run `jsonSchemaToZod(true)`
**Actual Output (after)**: [ ] Must match

---

### Behavior 6: Boolean schema `false`

**Input**:
```js
false
```
**Expected Output**: string containing `z.never()`

**Actual Output (before)**: [ ] Verified — run `jsonSchemaToZod(false)`
**Actual Output (after)**: [ ] Must match

---

### Behavior 7: Object schema with required properties

**Input**:
```json
{
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "age":  { "type": "number" }
  },
  "required": ["name"]
}
```
**Expected Output**: contains `z.object({ name: z.string(), age: z.number().optional() })` (or equivalent)

**Actual Output (before)**: [ ] Verified
**Actual Output (after)**: [ ] Must match

---

### Behavior 8: Array schema

**Input**:
```json
{ "type": "array", "items": { "type": "string" } }
```
**Expected Output**: contains `z.array(z.string())`

**Actual Output (before)**: [ ] Verified
**Actual Output (after)**: [ ] Must match

---

### Behavior 9: `anyOf` union

**Input**:
```json
{ "anyOf": [{ "type": "string" }, { "type": "number" }] }
```
**Expected Output**: contains `z.union([z.string(), z.number()])`

**Actual Output (before)**: [ ] Verified
**Actual Output (after)**: [ ] Must match

---

### Behavior 10: `allOf` intersection

**Input**:
```json
{ "allOf": [{ "type": "object", "properties": { "a": { "type": "string" } } }, { "type": "object", "properties": { "b": { "type": "number" } } }] }
```
**Expected Output**: contains `z.intersection(...)` or `z.and(...)` equivalent

**Actual Output (before)**: [ ] Verified
**Actual Output (after)**: [ ] Must match

---

### Behavior 11: `enum` schema

**Input**:
```json
{ "enum": ["alpha", "beta", "gamma"] }
```
**Expected Output**: contains `z.enum(["alpha", "beta", "gamma"])` or `z.union([z.literal("alpha"), ...])`

**Actual Output (before)**: [ ] Verified
**Actual Output (after)**: [ ] Must match

---

### Behavior 12: `const` schema

**Input**:
```json
{ "const": 42 }
```
**Expected Output**: contains `z.literal(42)`

**Actual Output (before)**: [ ] Verified
**Actual Output (after)**: [ ] Must match

---

### Behavior 13: Nullable schema (OpenAPI 3.0 style)

**Input**:
```json
{ "type": "string", "nullable": true }
```
**Expected Output**: contains `z.string().nullable()` or `z.union([z.string(), z.null()])`

**Actual Output (before)**: [ ] Verified
**Actual Output (after)**: [ ] Must match

---

### Behavior 14: Tuple schema (draft 2020-12 `prefixItems`)

**Input**:
```json
{ "prefixItems": [{ "type": "string" }, { "type": "number" }] }
```
**Expected Output**: contains `z.tuple([z.string(), z.number()])`

**Actual Output (before)**: [ ] Verified
**Actual Output (after)**: [ ] Must match

---

### Behavior 15: Multiple-type array (`type: ["string", "null"]`)

**Input**:
```json
{ "type": ["string", "null"] }
```
**Expected Output**: contains `z.union([z.string(), z.null()])` or equivalent

**Actual Output (before)**: [ ] Verified
**Actual Output (after)**: [ ] Must match

---

### Behavior 16: Conditional schema (`if`/`then`/`else`)

**Input**:
```json
{
  "if":   { "type": "string" },
  "then": { "minLength": 1 },
  "else": { "type": "number" }
}
```
**Expected Output**: valid Zod expression using `z.union` or conditional equivalent

**Actual Output (before)**: [ ] Verified
**Actual Output (after)**: [ ] Must match

---

### Behavior 17: Schema with `description` annotation

**Input**:
```json
{ "type": "string", "description": "A user's name" }
```
**Expected Output**: contains `.describe("A user's name")`

**Actual Output (before)**: [ ] Verified
**Actual Output (after)**: [ ] Must match

---

### Behavior 18: Schema with `default` annotation

**Input**:
```json
{ "type": "string", "default": "hello" }
```
**Expected Output**: contains `.default("hello")`

**Actual Output (before)**: [ ] Verified
**Actual Output (after)**: [ ] Must match

---

### Behavior 19: `parserOverride` hook — raw string (pre-migration baseline)

> ⚠️ This behavior documents the **old** escape hatch that is being replaced. Capture it before Step 0 so we can verify the new `refs.build.code()` path produces identical output.

**Input**:
```js
parseSchema({ type: 'string' }, {
  ...defaultRefs,
  parserOverride: () => 'z.custom()'   // raw string — old API
})
```
**Expected Output**: result emits `z.custom()`

**Actual Output (before)**: [ ] Verified — snapshot `text()` value
**Actual Output (after Step 0)**: [ ] Must match when called via `refs.build.code('z.custom()')`

---

### Behavior 19b: `parserOverride` hook — `Builder` return (post-migration)

**Input**:
```js
parseSchema({ type: 'string' }, {
  ...defaultRefs,
  parserOverride: (_, refs) => refs.build.code('z.custom()')  // new Builder API
})
```
**Expected Output**: result emits `z.custom()` — identical to Behavior 19

**Actual Output (before)**: [ ] Verified (should match Behavior 19)
**Actual Output (after)**: [ ] Must match

---

### Behavior 19c: `parserOverride` hook — returning a `Builder` instance

**Input**:
```js
parseSchema({ type: 'string' }, {
  ...defaultRefs,
  parserOverride: (_, refs) => refs.build.number()
})
```
**Expected Output**: result emits `z.number()` (override takes precedence over schema type)

**Actual Output (before)**: [ ] Verified
**Actual Output (after)**: [ ] Must match

---

### Behavior 26: `Parser` interface — third-party lightweight parser (no `AbstractParser` inheritance)

**Input**:
```js
// A minimal parser that satisfies only the Parser interface
class CustomStringParser {
  typeKind = 'custom-string';
  parse() { return refs.build.code('z.string().min(1)'); }
}
registerParser('custom-string', CustomStringParser);
parseSchema({ type: 'custom-string' }, defaultRefs)
```
**Expected Output**: result emits `z.string().min(1)`

**Actual Output (before)**: N/A — not possible before this refactoring (registry only accepted subclasses of `BaseParser`)
**Actual Output (after)**: [ ] Must work — third-party parser registered and dispatched correctly

---

### Behavior 27: `AbstractParser` (renamed `BaseParser`) — all built-in parsers still work

**Input**: Run existing integration tests for all 15+ parser types (object, array, string, number, boolean, null, anyOf, allOf, oneOf, enum, const, nullable, tuple, multipleType, conditional, not) after the `extend BaseParser` → `extend AbstractParser` rename

**Expected Output**: All outputs identical to pre-refactoring baseline

**Actual Output (before)**: [ ] Baseline captured from full test run
**Actual Output (after)**: [ ] Must match — no regression across any parser type

---

### Behavior 28: `BaseParser` re-export alias — deprecated import still compiles

**Input**:
```ts
import { BaseParser } from 'x-to-zod';
class MyParser extends BaseParser { ... }  // deprecated but must not be a compile error
```
**Expected Output**: TypeScript compiles with deprecation warning (not error); runtime behaviour unchanged

**Actual Output (before)**: N/A
**Actual Output (after)**: [ ] Must compile (deprecation, not breaking)

---

### Behavior 25: `Builder` interface — chained modifier methods produce correct output

**Input**:
```js
// Treat result as Builder interface (not ZodBuilder class)
const builder: Builder = parseSchema({ type: 'string' }, defaultRefs);
const result = builder.optional().describe('A name').nullable();
result.text()
```
**Expected Output**: string containing `z.string().describe("A name").nullable().optional()` (or equivalent modifier order)

**Actual Output (before)**: [ ] Verified — `ZodBuilder` already supports chaining
**Actual Output (after)**: [ ] Must match — `Builder` interface chains identically

---

### Behavior 20: Pre-processor transforms schema before parsing

**Input**:
```js
parseSchema({ type: 'string' }, {
  ...defaultRefs,
  preProcessors: [
    (schema) => schema.type === 'string' ? { ...schema, minLength: 1 } : undefined
  ]
})
```
**Expected Output**: result includes `.min(1)` modifier

**Actual Output (before)**: [ ] Verified
**Actual Output (after)**: [ ] Must match

---

### Behavior 21: Post-processor transforms builder after parsing

**Input**:
```js
parseSchema({ type: 'object', properties: { x: { type: 'string' } } }, {
  ...defaultRefs,
  postProcessors: [(builder) => builder.strict()]
})
```
**Expected Output**: result includes `.strict()`

**Actual Output (before)**: [ ] Verified
**Actual Output (after)**: [ ] Must match

---

### Behavior 22: Circular reference depth-limit (no infinite loop)

**Input**:
```json
{
  "type": "object",
  "properties": {
    "child": { "$ref": "#" }
  }
}
```
with `depth: 2` option

**Expected Output**: terminates and returns a valid Zod expression using `z.any()` at depth limit

**Actual Output (before)**: [ ] Verified
**Actual Output (after)**: [ ] Must match — no stack overflow

---

### Behavior 23: Named ESM export with `name` option

**Input**:
```js
jsonSchemaToZod({ type: 'string' }, { name: 'MySchema', module: 'esm' })
```
**Expected Output**: string containing `export const MySchema = z.string()`

**Actual Output (before)**: [ ] Verified
**Actual Output (after)**: [ ] Must match

---

### Behavior 24: `--project` multi-schema generation (CLI / `SchemaProject`)

**Input**: Directory with multiple JSON Schema files and cross-file `$ref`s

**Expected Output**: Multiple `.ts` output files with correct `import` statements and schema declarations

**Actual Output (before)**: [ ] Verified — run project mode integration test
**Actual Output (after)**: [ ] Must match

---

## Verification Checklist

Before each refactoring commit, run:

```bash
# Full test suite
npm test

# With coverage (optional but encouraged)
npm run test:coverage

# Manual spot-check of key behaviors
node -e "import('./src/index.js').then(({jsonSchemaToZod}) => { console.log(jsonSchemaToZod({ type: 'string' })); console.log(jsonSchemaToZod(true)); console.log(jsonSchemaToZod(false)); })"
```

After all refactoring commits are complete, re-run and compare against this snapshot.

---

## Test Commands
```bash
# Run full suite
npm test

# Run with coverage
npm run test:coverage

# Quick programmatic smoke-test (ESM)
node --input-type=module << 'EOF'
import { jsonSchemaToZod } from './src/index.js';

const cases = [
  [{ type: 'string' },                                    'z.string()'],
  [{ type: 'number' },                                    'z.number()'],
  [{ type: 'boolean' },                                   'z.boolean()'],
  [{ type: 'null' },                                      'z.null()'],
  [true,                                                   'z.any()'],
  [false,                                                  'z.never()'],
  [{ enum: ['a', 'b'] },                                  'z.enum'],
  [{ const: 42 },                                         'z.literal(42)'],
  [{ anyOf: [{ type: 'string' }, { type: 'number' }] },  'z.union'],
  [{ type: 'array', items: { type: 'string' } },          'z.array(z.string())'],
];

let pass = 0, fail = 0;
for (const [schema, expectedSubstring] of cases) {
  const result = jsonSchemaToZod(schema);
  if (result.includes(expectedSubstring)) {
    console.log('✓', JSON.stringify(schema));
    pass++;
  } else {
    console.error('✗', JSON.stringify(schema), '→', result, '(expected to include:', expectedSubstring, ')');
    fail++;
  }
}
console.log(`\n${pass} passed, ${fail} failed`);
EOF
```

---

*Update "Actual Output (after)" entries once refactoring is complete. All must match "before" values.*
