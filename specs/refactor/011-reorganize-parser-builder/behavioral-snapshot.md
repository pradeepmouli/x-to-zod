# Behavioral Snapshot

**Purpose**: Document observable behavior before refactoring to verify it's preserved after.

---

## Key Behaviors to Preserve

### Behavior 1: Default Export — `jsonSchemaToZod(schema, options)` produces Zod code
**Input**: Any valid JSON Schema object + optional `Options`
**Expected Output**: A string containing valid Zod v4 code (default) or v3 code (if `zodVersion: 3`)
**Verification**: `npm test` — covered by `tests/jsonSchemaToZod.test.ts` and related suites
**Actual Output** (before): All tests pass
**Actual Output** (after): [Re-run after refactoring — must match]

### Behavior 2: `parseSchema()` dispatches to correct parser per schema type
**Input**: JSON Schema with `type`, combinators (`allOf`/`anyOf`/`oneOf`), or structural inference
**Expected Output**: Correct `Builder` instance for the schema type
**Verification**: Covered by per-parser test files (`tests/parsers/`)
**Actual Output** (before): All tests pass
**Actual Output** (after): [Re-run after refactoring — must match]

### Behavior 3: `buildV3.*` and `buildV4.*` produce correct Zod code strings
**Input**: Builder factory method calls with various parameters
**Expected Output**: Correct Zod code strings (e.g., `z.string().email()`, `z.object({...})`)
**Verification**: Covered by builder test suites
**Actual Output** (before): All tests pass
**Actual Output** (after): [Re-run after refactoring — must match]

### Behavior 4: `SchemaProject.generate()` produces multi-file output with imports
**Input**: Multiple JSON Schema files with `$ref` cross-references
**Expected Output**: Correct TypeScript source files with proper imports and Zod schemas
**Verification**: Covered by SchemaProject integration tests
**Actual Output** (before): All tests pass
**Actual Output** (after): [Re-run after refactoring — must match]

### Behavior 5: CLI `--input`/`--output` produces correct file output
**Input**: CLI invocation with schema file path
**Expected Output**: Generated Zod code written to output file or stdout
**Verification**: CLI tests (if present) or manual verification
**Actual Output** (before): All tests pass
**Actual Output** (after): [Re-run after refactoring — must match]

### Behavior 6: `registerParser()` extension mechanism works
**Input**: Custom parser class registered via `registerParser(typeKind, ParserClass)`
**Expected Output**: Custom parser selected for matching schemas
**Verification**: Covered by parser registry tests
**Actual Output** (before): All tests pass
**Actual Output** (after): [Re-run after refactoring — must match]

### Behavior 7: Package exports resolve correctly
**Input**: `import` from `.`, `./v3`, `./v4`, `./builders`, `./parsers/json`, `./post-processing`
**Expected Output**: All named exports available and functional
**Verification**: Node.js module resolution + export surface tests (to be added)
**Actual Output** (before): All exports resolve
**Actual Output** (after): [Re-run after refactoring — must match]

### Behavior 8: `preProcessors` transform schemas before parsing
**Input**: `jsonSchemaToZod(schema, { preProcessors: [fn] })` where `fn` modifies the schema
**Expected Output**: Parser receives the transformed schema; output reflects the transformation
**Verification**: `test/JsonSchema/parsers/BaseParser.test.ts` — tests `applyPreProcessors`, `filterPreProcessors`
**Key semantics**: Returning `undefined` = skip (use original); path filtering via `pathPattern` property
**Actual Output** (before): All tests pass
**Actual Output** (after): [Re-run after refactoring — must match]

### Behavior 9: `postProcessors` transform builders after parsing
**Input**: `jsonSchemaToZod(schema, { postProcessors: [fn] })` or `{ postProcessors: [{ processor: fn, pathPattern, typeFilter }] }`
**Expected Output**: Builder output is modified by the post-processor
**Verification**: `test/postProcessors.test.ts`, `test/PostProcessing/integration.test.ts`, `test/PostProcessing/presets.test.ts`
**Key semantics**: Returning `undefined` = skip; supports `pathPattern` and `typeFilter` filtering; accepts raw functions or config objects
**Actual Output** (before): All tests pass
**Actual Output** (after): [Re-run after refactoring — must match]

### Behavior 10: `parserOverride` intercepts schema dispatch
**Input**: `jsonSchemaToZod(schema, { parserOverride: fn })` where `fn` returns a Builder or void
**Expected Output**: If override returns a Builder, that Builder is used instead of normal dispatch; if void/undefined, falls through to normal parsing
**Verification**: `test/JsonSchema/parsers/parseSchema.test.ts`
**Key semantics**: Called before parser selection; `void`/`null`/`undefined` = fallthrough; non-null = use override
**Actual Output** (before): All tests pass
**Actual Output** (after): [Re-run after refactoring — must match]

### Behavior 11: SchemaProject post-processor presets resolve by name
**Input**: `new SchemaProject({ globalPostProcessors: [{ name: 'strictObjects' }] })`
**Expected Output**: Named preset is resolved to actual PostProcessor function and applied during generation
**Verification**: `test/SchemaProject/postProcessors.test.ts`
**Actual Output** (before): All tests pass
**Actual Output** (after): [Re-run after refactoring — must match]

---

## Verification Commands

```bash
# Run full test suite — must pass 100% before and after
npm test

# Verify build succeeds
npm run build

# Verify CLI works (manual spot-check)
echo '{"type":"string"}' | npx x-to-zod

# Verify package exports resolve (Node.js)
node -e "import('x-to-zod').then(m => console.log(Object.keys(m).length, 'exports'))"
```

## Invariants

These must hold true throughout the entire refactoring:

1. **`npm test` passes 100%** — no test modifications allowed unless testing implementation details
2. **`npm run build` succeeds** — TypeScript compilation must work at every commit
3. **Package exports unchanged** — same names exported from same paths
4. **Default export is `jsonSchemaToZod`** — backward compatibility with existing consumers
5. **CLI behavior identical** — same inputs produce same outputs
6. **No assertion weakening** — do not change test expectations to make tests pass
7. **PreProcessors transform schemas** — `preProcessors` callbacks receive schema + context, return modified schema or undefined
8. **PostProcessors transform builders** — `postProcessors` callbacks receive builder + context, return modified builder or undefined
9. **ParserOverride takes precedence** — override is evaluated before parser selection; non-null return bypasses dispatch
10. **Processor filtering works** — `pathPattern` and `typeFilter` correctly narrow which processors apply

---

*Update this file with actual test output snapshots before starting refactoring*
