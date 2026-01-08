# json-schema-to-zod Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-01-07

## Active Technologies
- TypeScript (strict) on Node.js 18+ + s-morph (code gen/project), zod (targets), oxlint/oxfmt (lint/format) (004-multi-schema-projects)
- N/A (in-memory schema registry; file output to disk) (004-multi-schema-projects)

- TypeScript (strict) targeting Node 18+ builds (ESM+CJS outputs) + Zod builder utilities (internal), dev: vitest, oxlint; no new runtime deps planned (enhance/003-enhancement-003-post)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript (strict) targeting Node 18+ builds (ESM+CJS outputs): Follow standard conventions

## Recent Changes
- 004-multi-schema-projects: Added TypeScript (strict) on Node.js 18+ + s-morph (code gen/project), zod (targets), oxlint/oxfmt (lint/format)

- enhance/003-enhancement-003-post: Added TypeScript (strict) targeting Node 18+ builds (ESM+CJS outputs) + Zod builder utilities (internal), dev: vitest, oxlint; no new runtime deps planned

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
