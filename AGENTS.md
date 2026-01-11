# Agent Guide

This repository is TypeScript-only and outputs Zod builder strings. Follow these guardrails when working as an automated coding agent.

## Ground rules
- Obey repository and user instructions from the root, including ts instructions in vscode-userdata and .github/copilot-instructions.
- Prefer pnpm; if unavailable, npm scripts are: `npm test` and `npm run lint`.
- Use GitFlow: branch from master, keep feature branches small, avoid force pushes.
- Use Conventional Commits.
- Keep changes ASCII unless the file already uses other characters.

## Coding standards
- Language: TypeScript (strict). Avoid adding runtime deps unless necessary.
- Style: 2-space indent, single quotes, semicolons, no trailing commas. CamelCase for functions/vars, PascalCase for types/classes; private members use `#`. No `any`; favor generics and type aliases.
- Patterns: prefer async/await; use destructuring and spread; strict equality; arrow functions for callbacks.
- Public APIs only: add JSDoc when helpful; avoid documenting internal-only pieces.
- Testing: write/adjust vitest tests for public APIs; keep coverage high.
- Error handling: use custom errors with structured logging via pino when logging is needed.

## Tooling
- Lint: oxlint. Format: oxfmt aligned with style rules above.
- CI expectation: tests + lint must pass. Run `npm test && npm run lint` (or pnpm equivalents) before PRs.
- Codegen: ts-morph (dev-only) drives SchemaProject outputs; keep dual ESM/CJS targets and index generation intact.

## PR/Review etiquette
- Do not revert user changes. If unexpected local edits appear, pause and ask.
- Include concise rationale and file references in PR descriptions; link to specs if applicable.
- Keep documentation in sync (README, changelog, specs) when behavior changes.

## Collaboration notes
- Support multiple agents (Copilot, Claude, Gemini, Codex). Avoid tool- or vendor-specific steps.
- Avoid introducing unrelated stacks (e.g., databases, ORMs, cloud infra) unless explicitly requested.
- Prefer environment variables for sensitive data; none should be hardcoded.
- SchemaProject module owns multi-schema support (registry, dependency graph, ref resolver, ts-morph emit, CLI project mode); align new work with its APIs and tests.
