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

### Behavior 19: `parserOverride` hook returning a string

**Input**:
```js
parseSchema({ type: 'string' }, {
  ...defaultRefs,
  parserOverride: () => 'z.custom()'
})
```
**Expected Output**: `ZodBuilder` that emits `z.custom()`

**Actual Output (before)**: [ ] Verified
**Actual Output (after)**: [ ] Must match

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
