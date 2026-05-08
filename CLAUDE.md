# x-to-zod Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-02-21

## Active Technologies

- TypeScript 5.9.3 (strict mode) + zod (runtime, 1 direct dep); vitest 4.0.18 (test); tsgo (build) (refactor/010-abstract-parser-schema)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5.9.3 (strict mode): Follow standard conventions

## Recent Changes

- refactor/010-abstract-parser-schema: Added TypeScript 5.9.3 (strict mode) + zod (runtime, 1 direct dep); vitest 4.0.18 (test); tsgo (build)

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
<!-- SPECKIT END -->

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- ALWAYS read graphify-out/GRAPH_REPORT.md before reading any source files, running grep/glob searches, or answering codebase questions. The graph is your primary map of the codebase.
- IF graphify-out/wiki/index.md EXISTS, navigate it instead of reading raw files
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep — these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
