# Implementation Plan: Fluent Zod-like Builders for ZodBuilder

**Branch**: `refactor/003-apply-fluent-paradigms` | **Date**: 2025-12-13 | **Spec**: specs/refactor-003-apply-fluent-paradigms/refactor-spec.md
**Input**: Refactor specification to make ZodBuilder fluent and Zod-like

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Refactor internal builder surfaces to be fluent and match Zod chaining semantics. Example: `build.number()` returns a `NumberBuilder` wrapper exposing `.int()`, `.optional()`, `.max(n)`, etc., delegating to existing modifier logic to guarantee identical outputs. Parsers will use fluent builders instead of calling `apply*` helpers directly, improving maintainability and discoverability while preserving behavior.

Decision: Implement per-type wrappers only (no shared `fluent.ts` in Phase 1). This reduces ambiguity and keeps logic colocated with type modules. A base wrapper can be introduced later if duplication emerges.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript (strict mode)
**Primary Dependencies**: None at runtime; dev: vitest, oxlint; outputs target Zod API strings
**Storage**: N/A
**Testing**: vitest
**Target Platform**: Node.js library (ESM + CJS builds)
**Project Type**: Single library project
**Performance Goals**: Maintain current build and runtime performance (no regressions)
**Constraints**: Dual-module exports; CLI-first contract; behavior preservation
**Scale/Scope**: Internal refactor of builders and parser integration; broad parser coverage

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Parser Architecture: Preserve stateless parsers; builders used within parsers MUST NOT introduce side effects
- Dual-Module Export: No change to build outputs; ensure ESM/CJS remain identical
- CLI-First Contract: No CLI changes; outputs MUST remain identical
- Test-First Development: Baseline tests confirmed; add wrapper-specific tests if needed without changing assertions
- Type Safety & Zod Correctness: Generated code MUST remain valid and match JSON Schema semantics

**Status**: PASSED (Phase 0). Re-evaluate after Phase 1 design outputs.

Gates to enforce during implementation:
- Per-phase TDD: Before any code change in a phase, run tests and confirm green; after changes, rerun tests and compare outputs against snapshot
- ESM/CJS parity: Build both targets and verify `postesm.js`/`postcjs.js` outputs remain unchanged
- CLI parity: Run CLI with baseline sample schemas and verify outputs identical

## Project Structure

### Documentation (this feature)

```text
specs/refactor/003-apply-fluent-paradigms/
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
├── ZodBuilder/
│   ├── index.ts
│   ├── number.ts        # will host NumberBuilder
│   ├── string.ts        # will host StringBuilder
│   ├── array.ts         # will host ArrayBuilder
│   ├── object.ts        # will host ObjectBuilder
│   ├── boolean.ts
│   ├── null.ts
│   ├── enum.ts
│   ├── const.ts
│   └── fluent.ts        # optional: shared base wrapper
├── parsers/
│   ├── parseNumber.ts   # integrate fluent builders
│   ├── parseString.ts
│   ├── parseArray.ts
│   ├── parseObject.ts
│   └── ...
├── JsonSchema/
│   └── jsonSchemaToZod.ts
├── utils/
│   └── modifiers & helpers (unchanged)
└── index.ts

test/
├── parsers/
│   └── existing tests (unchanged; may add wrapper parity tests)
└── integration/
  └── existing tests
```

**Structure Decision**: Single project; extend `src/ZodBuilder/*` to include fluent wrapper classes and update parsers to consume them while preserving outputs.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | — | — |
