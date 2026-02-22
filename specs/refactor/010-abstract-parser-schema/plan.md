# Implementation Plan: Abstract Parser/Schema Project Surface for Non-JSONSchema Inputs

**Branch**: `refactor/010-abstract-parser-schema` | **Date**: 2026-02-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/refactor/010-abstract-parser-schema/spec.md`

## Summary

Extract a `Builder` interface from `ZodBuilder`, a `Parser` interface from `BaseParser`, rename
`BaseParser` to `AbstractParser`, and introduce a `SchemaInputAdapter` protocol that decouples
`parseSchema` and the parser registry from the JSON Schema object shape — enabling third-party
input formats (TypeScript types, GraphQL SDL, Protobuf IDL, etc.) without modifying core files.

**Approach**: Pure interface extraction + adapter pattern (no logic moves until the protocol is
stable). Every incremental step must compile and pass all tests before the next begins.

## Technical Context

**Language/Version**: TypeScript 5.9.3 (strict mode)
**Primary Dependencies**: zod (runtime, 1 direct dep); vitest 4.0.18 (test); tsgo (build)
**Storage**: N/A (library, no persistence layer)
**Testing**: vitest 4.0.18 — `pnpm test` (`vitest run --test-timeout=60000`); ~70 test files under `test/`
**Target Platform**: Node.js + browser (ESM/CJS dual output via tsgo + postesm.js/postcjs.js)
**Project Type**: Single library project
**Performance Goals**: No regression in build time (~2 s) or runtime parse throughput (< 5% delta)
**Constraints**: Public API surface must remain backwards-compatible for one release cycle (deprecation, not removal); no new runtime dependencies
**Scale/Scope**: 18 parser classes, ~281-line `BaseParser`, ~149-line `registry.ts`, ~160-line `parseSchema.ts`; ~70 test files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| I | **Parser Architecture** — discrete parser modules, independently testable, no side effects, integrate via function composition | ✅ PASS | New `Parser` interface and `AbstractParser` base class preserve the template-method pattern. `SchemaInputAdapter` is a new leaf module with no imports from parsers — import graph stays acyclic. New `src/Builder/` and `src/Parser/` are leaf modules. |
| II | **Dual-Module Export** — ESM + CJS both produced; post-build scripts handle syntax | ✅ PASS | New source files (`src/Builder/index.ts`, `src/Parser/index.ts`, `src/SchemaInput/*.ts`) follow the same `src/**/*.ts` pattern compiled by `tsconfig.esm.json` + `tsconfig.cjs.json`. No build script changes needed. |
| III | **CLI-First Contract** — every programmatic API must have CLI equivalent | ⚠️ JUSTIFIED EXCEPTION | `registerAdapter()` is a programmatic-only API with no CLI flag in this PR. Justification: CLI flag (`--adapter`) is a follow-on enhancement (`speckit.enhance`). Core refactoring must not be blocked by the CLI surface. The adapter hook is the extension point *for* the future CLI flag. |
| IV | **Test-First Development (NON-NEGOTIABLE)** — tests before implementation, Red-Green-Refactor | ✅ PASS (with action required) | Existing behavior is covered by the current test suite. New interface contracts (`Builder`, `Parser`, `SchemaInputAdapter`) require type-level tests and runtime tests BEFORE the implementation step that introduces them. See testing-gaps.md for the 14 required tests, including the 5 new critical gaps added for this requirement. |
| V | **Type Safety & Zod Correctness** — all generated Zod schemas compile and run | ✅ PASS | Interface extraction is purely additive. All parser return types are narrowed (`ZodBuilder` → `Builder`), not widened. The `parserOverride` string escape hatch is deprecated (not removed) with an auto-wrap shim. No generated schema output changes. |

**Constitution Gate Result**: ✅ PASS — one justified exception (III) documented above. No violations that block Phase 1.

## Project Structure

### Documentation (this feature)

```text
specs/refactor/010-abstract-parser-schema/
├── plan.md              ← This file
├── research.md          ← Phase 0 output (technical unknowns resolved)
├── data-model.md        ← Phase 1 output (interface/type entity map)
├── quickstart.md        ← Phase 1 output (custom adapter authoring guide)
├── contracts/           ← Phase 1 output (TypeScript interface definitions)
│   ├── builder.interface.ts
│   ├── parser.interface.ts
│   └── schema-input.interface.ts
├── spec.md
├── refactor-spec.md
├── testing-gaps.md
└── behavioral-snapshot.md
```

### Source Code (repository root)

```text
src/
├── Builder/
│   └── index.ts               ← NEW: Builder interface (extracted from ZodBuilder)
├── Parser/
│   └── index.ts               ← NEW: Parser interface (minimal contract)
├── SchemaInput/
│   ├── index.ts               ← NEW: SchemaInput type, SchemaInputAdapter interface, registerAdapter()
│   └── JsonSchemaAdapter.ts   ← NEW: Default adapter (wraps existing JSON Schema pipeline)
├── JsonSchema/
│   └── parsers/
│       ├── AbstractParser.ts  ← MOVED/RENAMED from BaseParser.ts; implements Parser
│       ├── BaseParser.ts      ← SHIM: re-exports AbstractParser as @deprecated BaseParser
│       ├── parseSchema.ts     ← MODIFIED: adapter hook, Builder return type
│       ├── registry.ts        ← MODIFIED: ParserClass widened to ParserConstructor
│       └── [18 parser classes] ← MODIFIED: extend AbstractParser (mechanical rename)
├── ZodBuilder/
│   └── BaseBuilder.ts         ← MODIFIED: implements Builder
├── Types.ts                   ← MODIFIED: ParserOverride → Builder|void; ParserSelector → Builder; Context += adapter?
└── index.ts                   ← MODIFIED: export Builder, Parser, SchemaInput, SchemaInputAdapter, registerAdapter

test/
├── Builder/
│   └── builder-interface.test.ts   ← NEW (Gap 4): Builder interface type-level + chain test
├── Parser/
│   └── parser-interface.test.ts    ← NEW (Gap 5): Parser interface type-level test
├── SchemaInput/
│   ├── third-party-parser.test.ts  ← NEW (Gap 5): registerParser runtime test
│   └── schema-input-adapter.test.ts ← NEW (Gap 5): SchemaInputAdapter runtime test
└── JsonSchema/
    └── parsers/
        ├── smoke-all-types.test.ts ← NEW (Gap 6): 15-type smoke test after rename
        └── BaseParser-alias.test.ts ← NEW (Gap 6): @deprecated re-export compiles
```

**Structure Decision**: Single project layout. New modules are leaf directories under `src/`. No monorepo restructuring needed.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| CLI-First (Principle III): `registerAdapter()` has no CLI flag | CLI flag is a follow-on enhancement; gating the entire refactoring on it would block all other adapters indefinitely | Could add `--adapter` flag now, but it requires a module resolution strategy that is out of scope for a refactoring step |
| New top-level directories (`src/Builder/`, `src/Parser/`, `src/SchemaInput/`) | Separation of concerns — interface from implementation; avoids circular deps by making these leaf modules | Could colocate in `src/Types.ts`, but that file is already large and every file imports it — adding interfaces there increases coupling |

---

## Phase 0 Output

→ See [research.md](./research.md) — all technical unknowns resolved.

## Phase 1 Output

→ See [data-model.md](./data-model.md) — interface entity map.
→ See [contracts/builder.interface.ts](./contracts/builder.interface.ts) — Builder interface.
→ See [contracts/parser.interface.ts](./contracts/parser.interface.ts) — Parser interface + ParserConstructor.
→ See [contracts/schema-input.interface.ts](./contracts/schema-input.interface.ts) — SchemaInput + SchemaInputAdapter.
→ See [quickstart.md](./quickstart.md) — custom adapter authoring guide.
