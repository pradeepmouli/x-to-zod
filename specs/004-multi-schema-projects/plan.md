# Implementation Plan: Multi-Schema Projects

**Branch**: `004-multi-schema-projects` | **Date**: 2026-01-07 | **Spec**: specs/004-multi-schema-projects/spec.md
**Input**: Feature specification from `/specs/004-multi-schema-projects/spec.md`

**Note**: Filled via `/speckit.plan`. See `.specify/templates/commands/plan.md` for workflow.

## Summary

Enable multi-schema project generation: ingest multiple JSON Schemas, resolve cross-schema $refs, and emit per-schema TypeScript outputs plus an index, using ts-morph for project/code generation and supporting lazy builders for cycles, placeholder handling for missing refs, and validation for conflicts.

## Technical Context

**Language/Version**: TypeScript (strict) on Node.js 18+
**Primary Dependencies**: ts-morph (code gen/project), zod (targets), oxlint/oxfmt (lint/format)
**Storage**: N/A (in-memory schema registry; file output to disk)
**Testing**: vitest (unit/integration), future E2E for CLI; TDD required by constitution
**Target Platform**: Node.js library + CLI (ESM/CJS outputs)
**Project Type**: Single library/CLI project
**Performance Goals**: Build 10+ component schemas <5s; dependency graph/toposort linear to node count; import generation O(edges)
**Constraints**: Dual-module export required by constitution; avoid runtime deps; keep memory reasonable for 100+ schemas; watch mode deferred
**Scale/Scope**: Handle 10–100 schemas with cross-refs; index generation; no remote fetch

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Dual-Module Export (Principle II): Constitution requires ESM + CJS outputs; current spec says ESM default and user-transpiled CJS → **Violation**. Must plan to emit both dist/esm and dist/cjs (tsconfigs + post scripts) to comply.
- CLI-First Contract (III): Feature must expose CLI options matching API → ensure project mode CLI flags planned.
- Parser Architecture (I) & TDD (IV): Plan must keep parsers modular, side-effect free, and add tests first.
- Type Safety (V): Generated code must type-check under strict TS.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
src/
├── SchemaProject/      # Multi-schema project support (IMPLEMENTED)
│   ├── SchemaProject.ts      # Main API class
│   ├── SchemaRegistry.ts     # Schema storage and management
│   ├── NameResolver.ts       # Export name resolution
│   ├── RefResolver.ts        # Cross-schema $ref resolution
│   ├── BuilderRegistry.ts    # Builder cache management
│   ├── DependencyGraph.ts    # Graph analysis and topological sort
│   ├── ImportManager.ts      # Import statement management
│   ├── SourceFileGenerator.ts # Code generation via ts-morph
│   ├── Validator.ts          # Validation and conflict detection
│   ├── parseRef.ts           # $ref parsing integration
│   ├── types.ts              # Type definitions
│   └── index.ts              # Public API exports
├── JsonSchema/         # existing parsers; parseRef integration
├── ZodBuilder/         # add reference.ts for external refs
├── cli.ts              # CLI entry (project mode implemented)
└── index.ts            # export SchemaProject and multi-schema APIs

test/
├── SchemaProject/      # unit + integration tests (IMPLEMENTED)
│   ├── SchemaRegistry.test.ts      # 24 tests
│   ├── NameResolver.test.ts        # 20 tests
│   ├── RefResolver.test.ts         # 28 tests
│   ├── BuilderRegistry.test.ts     # 27 tests
│   ├── DependencyGraph.test.ts     # 41 tests
│   ├── SchemaProject.test.ts       # 13 tests
│   └── SchemaProject.integration.test.ts # 7 tests
└── cli.test.ts         # extended for project mode scenarios (4 tests)

docs/
└── multi-schema-projects.md (to be created)
```

**Structure Decision**: Single library/CLI project; extended existing `src` and `test` roots with SchemaProject modules and CLI coverage. Name changed from MultiSchema to SchemaProject for clarity.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
