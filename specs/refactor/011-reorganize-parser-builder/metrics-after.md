# Post-Refactoring Metrics

**Timestamp**: 2026-03-06
**Git Commit**: 7cea576
**Branch**: refactor/011-reorganize-parser-builder

---

## Summary of Changes

- **20 source files changed**: 74 insertions, 260 deletions (net −186 lines)
- **1 file deleted**: `src/jsonSchemaToZod.ts` (dead wrapper)

## Key File Metrics (Before → After)

| File | Before | After | Δ |
|------|--------|-------|---|
| `src/Types.ts` | 106 | 97 | −9 (removed `ParserOverride`, legacy `preprocessors`) |
| `src/v3.ts` | 40 | 32 | −8 (deduplicated, re-exports from index) |
| `src/v4.ts` | 39 | 31 | −8 (deduplicated, re-exports from index) |
| `src/ZodBuilder/index.ts` | 182 | 131 | −51 (removed internal modifier exports) |
| `src/ZodBuilder/versions.ts` | 104 | 10 | −94 (single alias re-exports, no duplication) |
| `src/jsonSchemaToZod.ts` | 10 | 0 | −10 (deleted) |

## Objective 1 — API Organization

| Goal | Status |
|------|--------|
| Deduplicate v3.ts/v4.ts exports | ✅ Eliminated ~30 duplicated lines each |
| Name collisions → 0 | ✅ `ProjectPostProcessorConfig`, `ProjectSchemaMetadata` |
| Dead code removed | ✅ `jsonSchemaToZod.ts` deleted |
| Internal modifier exports removed | ✅ ~10 `apply*` functions no longer exported |
| BuildV4/V4BuildAPI unified | ✅ Single alias in `versions.ts` |

## Objective 2 — Processor/Override Alignment

| Goal | Status |
|------|--------|
| Legacy `preprocessors` (lowercase) removed | ✅ |
| `PreProcessor` → `SchemaTransformer` | ✅ Clearer terminology |
| `preProcessors` → `transformers` | ✅ |
| `parserOverride` removed | ✅ Replaced by `registerParser()` + `postProcessors` |
| Return types normalized to `\| undefined` | ✅ |
| Null-checks normalized to `!== undefined` | ✅ |

## Test Suite

- **Test Files**: 78 passed
- **Tests**: 870 passed, 3 skipped (873 total)
- **Net test change**: −2 (removed 2 parserOverride-specific tests, replaced 1)

## Performance

- **Build Time**: ~3.3s (no regression from baseline 3s)

## Dependencies

- **Direct Dependencies**: 1 (unchanged)
- **Dev Dependencies**: 20 (unchanged)
- **Total Installed**: 115 (unchanged)

## Export Surface

- **ZodBuilder/index.ts exports**: 59 → 58 (−1, internal modifiers removed)

---
*Metrics captured manually during Phase 3 validation.*
