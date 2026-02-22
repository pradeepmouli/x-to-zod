# Post-Refactoring Metrics (After Refactoring)

**Timestamp**: 2026-02-21
**Git Commit**: 51f3277b10245594ff63fe07a09ffd69ace2fd27
**Branch**: refactor/010-abstract-parser-schema

---

## Test Suite

- **Test Files**: 77 passed (77 total)  ← +7 vs baseline (70)
- **Tests**: 782 passed | 3 skipped (785 total)  ← +60 tests vs baseline (722)
- **Duration**: ~33 s
- **Pass rate**: 100%

## Build

- **Build Time**: ~7 s (tsgo native Go compiler, CI environment; ~2 s locally)
- **Build result**: ✅ Success — no TypeScript errors, no lint errors
- **Outputs**: `dist/cjs/`, `dist/esm/`, `dist/types/`

## Code Coverage (after)

| Scope            | Stmts  | Branch | Funcs  | Lines  |
|------------------|--------|--------|--------|--------|
| All files        | 88.52% | 76.3%  | 88.25% | 88.97% |
| src/Parser       | 85.88% | 77.01% | 79.16% | 86.25% |
| src/SchemaInput  | 92.3%  | 81.81% | 100%   | 92.3%  |

## Comparison vs Baseline

| Metric            | Before      | After       | Delta   |
|-------------------|-------------|-------------|---------|
| Test files        | 70          | 77          | +7      |
| Tests passing     | 722         | 782         | +60     |
| Pass rate         | 100%        | 100%        | ±0      |
| Build clean       | ✅           | ✅           | ±0      |
| New modules       | 0           | 2 new       | +2      |

## New Exports Added

- `Builder` (interface)
- `Parser` (interface)
- `ParserConstructor` (type)
- `AbstractParser` (class)
- `SchemaInput` (type)
- `SchemaMetadata` (interface)
- `SchemaInputAdapter` (interface)
- `registerAdapter` (function)
- `getGlobalAdapter` (function)
- `registerParser` (function)
- `JsonSchemaAdapter` (class)
- `jsonSchemaAdapter` (singleton)

## Performance (T051)

### Build Time
- Measured: ~7 s (CI environment overhead; 3.5× baseline ~2 s)
- Assessment: **Pass** — environment-induced overhead; tsgo native compiler speed unchanged
- The adapter dispatch layer adds zero build-time cost

### Parse Throughput Spot Check (T051b)
- 100 representative schemas (20 types × 5 iterations) parsed via `dist/esm` in ~6.22ms
- Average: ~0.062ms per schema
- Assessment: **Pass** — no regression; adapter dispatch adds ≤1 `Map.get()` + `adapter.isValid()` call per parse (O(1))
