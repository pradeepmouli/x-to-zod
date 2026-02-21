# Behavioral Snapshot — refactor-010

**Purpose**: Document observable behavior before refactoring to verify it is preserved after.

**Refactor**: Abstract parser/schema project surface for non-JSONSchema inputs
**Branch**: `refactor/010-abstract-parser-schema`
**Captured**: 2026-02-20 (pre-refactoring baseline)
**Verified after**: 2026-02-21 (post-refactoring — all 782 tests pass)

---

## Key Behaviors to Preserve

### Behavior 1: Primitive string schema

**Input**:
```json
{ "type": "string" }
```
**Expected Output**: string containing `z.string()`

**Actual Output (before)**: [ ] Verified — run `jsonSchemaToZod({ type: 'string' })`
**Actual Output (after)**: [x] Verified — `z.string()` (test/JsonSchema/parsers/StringParser.test.ts)

---

### Behavior 2: Primitive number schema

**Input**:
```json
{ "type": "number" }
```
**Expected Output**: string containing `z.number()`

**Actual Output (before)**: [ ] Verified
**Actual Output (after)**: [x] Verified — `z.number()` (NumberParser.test.ts)

---

### Behavior 3: Primitive boolean schema

**Input**:
```json
{ "type": "boolean" }
```
**Expected Output**: string containing `z.boolean()`

**Actual Output (before)**: [ ] Verified
**Actual Output (after)**: [x] Verified — `z.boolean()` (BooleanParser.test.ts)

---

### Behavior 4: Primitive null schema

**Input**:
```json
{ "type": "null" }
```
**Expected Output**: string containing `z.null()`

**Actual Output (before)**: [ ] Verified
**Actual Output (after)**: [x] Verified — `z.null()` (NullParser.test.ts)

---

### Behavior 5: Boolean schema `true`

**Input**:
```js
true  // (JavaScript boolean, not JSON Schema object)
```
**Expected Output**: string containing `z.any()`

**Actual Output (before)**: [ ] Verified — run `jsonSchemaToZod(true)`
**Actual Output (after)**: [x] Verified — `z.any()` (its.test.ts)

---

### Behavior 6: Boolean schema `false`

**Input**:
```js
false
```
**Expected Output**: string containing `z.never()`

**Actual Output (before)**: [ ] Verified — run `jsonSchemaToZod(false)`
**Actual Output (after)**: [x] Verified — `z.never()` (its.test.ts)

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
**Actual Output (after)**: [x] Verified — passes all ObjectParser.test.ts tests

---

### Behavior 8: Array schema

**Input**:
```json
{ "type": "array", "items": { "type": "string" } }
```
**Expected Output**: contains `z.array(z.string())`

**Actual Output (before)**: [ ] Verified
**Actual Output (after)**: [x] Verified — `z.array(z.string())` (ArrayParser.test.ts)

---

### Behavior 9: `anyOf` union

**Input**:
```json
{ "anyOf": [{ "type": "string" }, { "type": "number" }] }
```
**Expected Output**: contains `z.union([z.string(), z.number()])`

**Actual Output (before)**: [ ] Verified
**Actual Output (after)**: [x] Verified — AnyOfParser.test.ts passes

---

### Behavior 10: `allOf` intersection

**Input**:
```json
{ "allOf": [{ "type": "object", "properties": { "a": { "type": "string" } } }, { "type": "object", "properties": { "b": { "type": "number" } } }] }
```
**Expected Output**: contains `z.intersection(...)` or `z.and(...)` equivalent

**Actual Output (before)**: [ ] Verified
**Actual Output (after)**: [x] Verified — AllOfParser.test.ts passes

---

### Behavior 11: `enum` schema

**Input**:
```json
{ "enum": ["alpha", "beta", "gamma"] }
```
**Expected Output**: contains `z.enum(["alpha", "beta", "gamma"])` or `z.union([z.literal("alpha"), ...])`

**Actual Output (before)**: [ ] Verified
**Actual Output (after)**: [x] Verified — EnumParser.test.ts passes

---

### Behavior 12: `const` schema

**Input**:
```json
{ "const": 42 }
```
**Expected Output**: contains `z.literal(42)`

**Actual Output (before)**: [ ] Verified
**Actual Output (after)**: [x] Verified — `z.literal(42)` (parseConst.test.ts)

---

### Behavior 13: Nullable schema (OpenAPI 3.0 style)

**Input**:
```json
{ "type": "string", "nullable": true }
```
**Expected Output**: contains `z.string().nullable()` or `z.union([z.string(), z.null()])`

**Actual Output (before)**: [ ] Verified
**Actual Output (after)**: [x] Verified — parseNullable.test.ts passes

---

### Behavior 14: Tuple schema (draft 2020-12 `prefixItems`)

**Input**:
```json
{ "prefixItems": [{ "type": "string" }, { "type": "number" }] }
```
**Expected Output**: contains `z.tuple([z.string(), z.number()])`

**Actual Output (before)**: [ ] Verified
**Actual Output (after)**: [x] Verified — TupleParser.test.ts passes

---

### Behavior 15: Multiple-type array (`type: ["string", "null"]`)

**Input**:
```json
{ "type": ["string", "null"] }
```
**Expected Output**: contains `z.union([z.string(), z.null()])` or equivalent

**Actual Output (before)**: [ ] Verified
**Actual Output (after)**: [x] Verified — parseMultipleType.test.ts passes

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
**Actual Output (after)**: [x] Verified — ConditionalParser.test.ts passes

---

### Behavior 17: Schema with `description` annotation

**Input**:
```json
{ "type": "string", "description": "A user's name" }
```
**Expected Output**: contains `.describe("A user's name")`

**Actual Output (before)**: [ ] Verified
**Actual Output (after)**: [x] Verified — BaseParser.test.ts (AbstractParser) `applyMetadata` tests pass

---

### Behavior 18: Schema with `default` annotation

**Input**:
```json
{ "type": "string", "default": "hello" }
```
**Expected Output**: contains `.default("hello")`

**Actual Output (before)**: [ ] Verified
**Actual Output (after)**: [x] Verified — AbstractParser applyMetadata tests pass; integration tests pass

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
**Actual Output (after Step 0)**: [x] Verified — parserOverride string return still handled via Builder wrapping; test/JsonSchema/parsers/parseSchema.test.ts passes

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
**Actual Output (after)**: [x] Verified — `refs.build.code(str)` path confirmed working

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
**Actual Output (after)**: [x] Verified — parserOverride Builder path confirmed working

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
**Actual Output (after)**: [x] Verified — test/SchemaInput/third-party-parser.test.ts T022 passes; T045 (CustomDateTimeParser from quickstart) also passes

---

### Behavior 27: `AbstractParser` (renamed `BaseParser`) — all built-in parsers still work

**Input**: Run existing integration tests for all 15+ parser types (object, array, string, number, boolean, null, anyOf, allOf, oneOf, enum, const, nullable, tuple, multipleType, conditional, not) after the `extend BaseParser` → `extend AbstractParser` rename

**Expected Output**: All outputs identical to pre-refactoring baseline

**Actual Output (before)**: [ ] Baseline captured from full test run
**Actual Output (after)**: [x] Verified — 782 tests pass (60 more than baseline of 722); no regression

---

### Behavior 28: `BaseParser` re-export alias — decision: NOT re-exported

**Decision taken during implementation**: After discussion, `BaseParser` will NOT be re-exported as an alias for `AbstractParser`. The old `BaseParser` class was deleted (T026). The new `AbstractParser` is in `src/Parser/AbstractParser.ts`. Any code that imported `BaseParser` directly must update its import.

**Actual Output (before)**: N/A
**Actual Output (after)**: [x] Confirmed — `BaseParser` does not appear in `src/index.ts` exports; confirmed by grep. Third-party code must import `AbstractParser` directly.

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
**Actual Output (after)**: [x] Verified — Builder interface tests pass (test/Builder/builder-interface.test.ts); all chaining methods work

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
**Actual Output (after)**: [x] Verified — AbstractParser.test.ts pre-processor tests pass

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
**Actual Output (after)**: [x] Verified — AbstractParser.test.ts post-processor tests pass

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
**Actual Output (after)**: [x] Verified — circular reference tests pass (parseSchema.test.ts)

---

### Behavior 23: Named ESM export with `name` option

**Input**:
```js
jsonSchemaToZod({ type: 'string' }, { name: 'MySchema', module: 'esm' })
```
**Expected Output**: string containing `export const MySchema = z.string()`

**Actual Output (before)**: [ ] Verified
**Actual Output (after)**: [x] Verified — toZod.test.ts name/module tests pass

---

### Behavior 24: `--project` multi-schema generation (CLI / `SchemaProject`)

**Input**: Directory with multiple JSON Schema files and cross-file `$ref`s

**Expected Output**: Multiple `.ts` output files with correct `import` statements and schema declarations

**Actual Output (before)**: [ ] Verified — run project mode integration test
**Actual Output (after)**: [x] Verified — cli.test.ts project mode tests pass; SchemaProject tests pass

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

*All "Actual Output (after)" entries verified 2026-02-21 — 782 tests pass, 0 failures.*
