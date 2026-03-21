# PR Draft: 004-multi-schema-projects

## Summary
- Add multi-schema SchemaProject integration (registry, graph, refs, ts-morph generation, CLI project mode).
- E2E coverage for OpenAPI components and DDD shared types; cycle handling via lazy builders and missing-ref fallbacks.
- Docs updated: multi-schema guide, migration steps added to MIGRATION-GUIDE.
- Dual-module outputs verified (dist/esm, dist/cjs); AGENTS guide notes ts-morph + SchemaProject ownership.

## Tests
- npm test
- npm run lint
- npm run build:cjs && npm run build:esm

## Notes
- Story 3 (T066) deferred per tasks.md.
- T038 (dual-output via ts-morph pipeline) intentionally excluded per request.
- Pending polish items: T077–T089 (depth guard, perf baselines, post-processors, strict tsgo checks).
