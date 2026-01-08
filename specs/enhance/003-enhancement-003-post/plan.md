# Implementation Plan: Post-Processing API

**Branch**: `enhance/003-enhancement-003-post` | **Date**: 2026-01-07 | **Spec**: specs/enhance/003-enhancement-003-post/spec.md
**Input**: Feature specification from /specs/enhance/003-enhancement-003-post/spec.md

## Summary
Add a post-processing API into the parser class architecture so ZodBuilders can be transformed or validated during parsing. Provide path-aware matching, preset processors, and builder type guards, keeping behavior additive and backward compatible.

## Technical Context

**Language/Version**: TypeScript (strict) targeting Node 18+ builds (ESM+CJS outputs)
**Primary Dependencies**: Zod builder utilities (internal), dev: vitest, oxlint; no new runtime deps planned
**Storage**: N/A (in-memory code generation only)
**Testing**: vitest with existing test layout under test/
**Target Platform**: Node library emitting code strings; CLI wrapper must remain compatible
**Project Type**: Single library project (src/, test/)
**Performance Goals**: Maintain no measurable regression vs current parsing; path matching should be cached
**Constraints**: Backward compatible API; dual ESM/CJS outputs unchanged; avoid new runtime dependencies
**Scale/Scope**: Handles single- and multi-file JSON Schemas across v3/v4 parsers; large schemas should not regress noticeably

## Constitution Check

- Parser architecture: Must keep discrete parser modules and side-effect-free behavior; new post-processor hooks must live in BaseParser flow. Status: planned compliance.
- Dual-module export: Changes must not break ESM/CJS build outputs. Status: planned compliance.
- CLI-first contract: New options must be available via CLI if exposed programmatically; plan to add a CLI flag that loads postProcessors from a user-specified module path.
- Test-first (TDD): Add unit + integration tests before or alongside implementation. Status: planned compliance.
- Type safety & Zod correctness: Builder transformations must preserve valid Zod output and typings. Status: planned compliance.

## Project Structure

### Documentation (this feature)

```text
specs/enhance/003-enhancement-003-post/
├── plan.md          # This file
├── spec.md          # Feature spec
├── research.md      # Phase 0 output
├── data-model.md    # Phase 1 output
├── quickstart.md    # Phase 1 output
├── contracts/       # Phase 1 output
└── tasks.md         # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── index.ts
├── jsonSchemaToZod.ts
├── JsonSchema/
│   ├── parsers/
│   └── ...
├── PostProcessing/      # new helpers (pathMatcher, pathParser, presets)
├── utils/
└── ZodBuilder/

test/
├── JsonSchema/
├── parsers/
└── PostProcessing/      # new tests (path matcher, presets, integration)
```

**Structure Decision**: Single TypeScript library; new PostProcessing utilities live under src/PostProcessing with corresponding tests under test/PostProcessing. Parsers remain under src/JsonSchema/parsers with class-based architecture.

## Complexity Tracking

None at this time (no constitution violations requiring justification).
