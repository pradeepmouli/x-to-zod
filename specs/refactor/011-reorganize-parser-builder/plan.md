# Implementation Plan: Reorganize Parser/Builder/Project APIs

**Branch**: `refactor/011-reorganize-parser-builder` | **Date**: 2026-03-04 | **Spec**: [refactor-spec.md](./refactor-spec.md)
**Input**: Refactor specification from `/specs/refactor/011-reorganize-parser-builder/refactor-spec.md`

## Summary

Reorganize the parser/builder/project API surface to eliminate duplication, resolve name collisions, remove dead code, and align the schema transformation pipeline (`transformers` → `Parser` → `postProcessors`) with consistent ergonomics. Replaces `parserOverride` with `registerParser()` + `postProcessors`. Renames `PreProcessor`/`preProcessors` to `SchemaTransformer`/`transformers`.

## Technical Context

**Language/Version**: TypeScript 5.9.3 (strict mode)
**Primary Dependencies**: zod (1 runtime dep)
**Storage**: N/A (library, no persistence)
**Testing**: vitest 4.0.18
**Target Platform**: Node.js (ESM + CJS dual output)
**Project Type**: Single library package
**Performance Goals**: No regression from ~3s build time
**Constraints**: Behavior preservation — all existing schema→code output must be identical
**Scale/Scope**: ~50 builder files, 870+ tests, 26 files modified

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Parser Architecture | ✅ Pass | Parsers remain discrete modules; `registerParser()` replaces ad-hoc `parserOverride` |
| II. Dual-Module Export | ✅ Pass | ESM/CJS exports verified post-refactor; all package.json exports resolve |
| III. CLI-First Contract | ✅ Pass | CLI unchanged; `--input`/`--output` flags work identically |
| IV. Test-First Development | ✅ Pass | Testing gaps assessed before baseline; 870 tests pass |
| V. Type Safety & Zod Correctness | ✅ Pass | `tsc --noEmit` clean; return types normalized to `| undefined` |

No constitution violations.

## Project Structure

### Documentation (this feature)

```text
specs/refactor/011-reorganize-parser-builder/
├── refactor-spec.md     # Refactoring specification (primary spec)
├── plan.md              # This file
├── research.md          # Phase 0: API analysis and design decisions
├── data-model.md        # Phase 1: Type surface changes
├── quickstart.md        # Phase 1: Migration guide for consumers
├── contracts/           # Phase 1: New API contracts
│   └── pipeline.ts      # SchemaTransformer, PostProcessor, registerParser
├── testing-gaps.md      # Pre-baseline testing gap assessment
├── behavioral-snapshot.md # Behavioral preservation reference
├── metrics-before.md    # Baseline metrics
└── metrics-after.md     # Post-refactoring metrics
```

### Source Code (repository root)

```text
src/
├── Types.ts                    # SchemaTransformer, PostProcessor, ProcessorConfig (modified)
├── Parser/AbstractParser.ts    # Template method: transformers → parseImpl → postProcessors (modified)
├── JsonSchema/
│   ├── parsers/parseSchema.ts  # Dispatch (parserOverride removed) (modified)
│   ├── parsers/EnumParser.ts   # Defensive checks added (modified)
│   ├── parsers/ConstParser.ts  # Defensive checks added (modified)
│   └── toZod.ts                # Runtime guards for removed options (modified)
├── ZodBuilder/
│   ├── index.ts                # Internal apply* exports removed (modified)
│   └── versions.ts             # Single alias re-exports (modified)
├── SchemaProject/
│   └── types.ts                # ProjectPostProcessorConfig, ProjectSchemaMetadata (modified)
├── v3.ts                       # Deduplicated: export * from index + build override (modified)
├── v4.ts                       # Deduplicated: export * from index + build override (modified)
└── jsonSchemaToZod.ts          # DELETED (dead wrapper)

test/
├── JsonSchema/parsers/
│   ├── parseSchema.test.ts     # Rewritten: registerParser instead of parserOverride (modified)
│   └── BaseParser.test.ts      # SchemaTransformer rename (modified)
├── Types.test.ts               # SchemaTransformer rename (modified)
├── jsonSchemaToZod.test.ts     # postProcessors instead of parserOverride (modified)
└── postProcessors.test.ts      # transformers rename (modified)
```

**Structure Decision**: Single library package. No structural changes — only API surface reorganization within existing layout.
