# Implementation Tasks: Multi-Schema Projects

**Feature**: `004-multi-schema-projects` | **Branch**: `004-multi-schema-projects`
**Created**: 2026-01-07 | **Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

## Overview

Task-driven implementation of multi-schema project support using ts-morph. Organized into phases: Setup (infrastructure), Foundational (core registry/graph), User Story 1 (P1—OpenAPI support), User Story 2 (P2—DDD), User Story 3 (P3—monorepo), Polish.

**MVP Scope**: User Stories 1–2 (P1/P2); Story 3–4 deferred to v0.6 post-release.

---

## Phase 1: Setup & Infrastructure

**Goal**: Prepare project structure and add ts-morph dependency.

### Module & Dependency Setup

- [ ] T001 [P] Install ts-morph (^21.0.0) and update package.json/pnpm-lock.yaml
- [ ] T002 [P] Create src/MultiSchema/ directory structure (project, registry, refs, imports, graph, types)
- [ ] T003 [P] Create test/MultiSchema/ directory for unit tests
- [ ] T004 Verify dual-module output (dist/esm, dist/cjs) via existing postcjs.js/postesm.js for generated code samples
- [ ] T005 Update AGENTS.md with ts-morph addition and MultiSchema module notes

### Type Definitions

- [ ] T006 Create src/MultiSchema/types.ts: SchemaProjectOptions, SchemaEntry, SchemaMetadata, RefResolution, ImportInfo, BuildResult, ValidationResult, NameResolver, RefResolver, DependencyNode, NameConflict
- [ ] T007 [P] Add ZodBuilder/ReferenceBuilder type to src/ZodBuilder/ (for external $ref builders; placeholder/lazy-builder support)

---

## Phase 2: Foundational - Core Registry & Dependency Graph

**Goal**: Build foundation components (schema registry, dependency graph, name resolution) without parsing yet.

### Schema Registry & Name Resolution

- [ ] T008 Create src/MultiSchema/SchemaRegistry.ts: class managing schemaId → SchemaEntry mapping, conflict detection on name resolution, getEntry/addEntry/getAllEntries methods
- [ ] T009 [P] Create src/MultiSchema/NameResolver.ts: interface + default implementations (schemaId-based, filename-based, custom), validateExportName() to ensure JS identifier validity, detectConflicts()
- [ ] T010 [P] Unit test NameResolver: valid names, conflict detection (user/user from different files), reserved keywords
  - File: test/MultiSchema/NameResolver.test.ts

### Dependency Graph

- [ ] T011 Create src/MultiSchema/DependencyGraph.ts: graph construction from $ref edges, topological sort, cycle detection (Tarjan), toDot() for visualization
- [ ] T012 [P] Unit test DependencyGraph: acyclic graphs (correct topo order), cyclic graphs (identifies SCC), single-node, empty graph, complex multi-level refs
  - File: test/MultiSchema/DependencyGraph.test.ts

### Reference Resolution

- [ ] T013 Create src/MultiSchema/RefResolver.ts: interface + built-in resolvers (schemaId-prefixed #, file path-based), customResolver registration, resolve(ref, fromSchemaId) returning RefResolution (targetSchemaId, definitionPath, isExternal, importInfo)
- [ ] T014 [P] Unit test RefResolver: local refs (#/properties/id), external refs with various formats, missing refs (returns undefined), custom resolver fallback
  - File: test/MultiSchema/RefResolver.test.ts

### Builder Registry

- [ ] T015 Create src/MultiSchema/BuilderRegistry.ts: cache of (schemaId, exportName) → ZodBuilder, register/get/getKeysForSchema, avoid duplication across files
- [ ] T016 [P] Unit test BuilderRegistry: registration, retrieval, keyset query, cache behavior
  - File: test/MultiSchema/BuilderRegistry.test.ts

---

## Phase 3: Core Parsing & Reference Integration

**Goal**: Integrate RefResolver into existing parser; create ReferenceBuilder for external refs.

### Parser Integration

- [ ] T017 Create src/JsonSchema/parsers/parseRef.ts: new parser for $ref, dispatches to RefResolver, returns ReferenceBuilder for external, normal builder for internal, handles missing refs (z.unknown placeholder)
- [ ] T018 [P] Update src/JsonSchema/parsers/parseSchema.ts: detect $ref at root/in properties, call parseRef instead of inline handling, pass refResolver context
- [ ] T019 [P] Update src/JsonSchema/Types.ts Context: add refResolver?, currentSchemaId?, importManager?, builderRegistry?
- [ ] T020 [P] Unit test parseRef: internal refs (same schema), external refs (different schema), missing refs, circular indicators
  - File: test/JsonSchema/parsers/parseRef.test.ts

### ReferenceBuilder

- [ ] T021 Create src/ZodBuilder/reference.ts: ReferenceBuilder class extending ZodBuilder, holds ImportInfo, lazy flag for cycles, type-only import support, toBuilder() renders type-only import statements
- [ ] T022 [P] Unit test ReferenceBuilder: named import, type-only import, lazy builder flag, code generation for ES modules
  - File: test/ZodBuilder/ReferenceBuilder.test.ts

---

## Phase 4: Source File Generation & ts-morph Integration

**Goal**: Use ts-morph to manage output files and imports.

### Import Manager

- [ ] T023 Create src/MultiSchema/ImportManager.ts: class using ts-morph SourceFile, addImport(ImportInfo) deduplicates and tracks, getImports() returns array, optimizeImports() removes unused, emitImports() generates statements
- [ ] T024 [P] Unit test ImportManager: add single/multiple imports, deduplication, relative path computation, ESM/CJS syntax output
  - File: test/MultiSchema/ImportManager.test.ts

### Source File Generator

- [ ] T025 Create src/MultiSchema/SourceFileGenerator.ts: generates .ts file for a schema using ts-morph Project, sets up imports via ImportManager, writes builder code, formats via prettier (if enabled)
- [ ] T026 [P] Unit test SourceFileGenerator: file creation, import statement ordering, export statement, code formatting with/without prettier
  - File: test/MultiSchema/SourceFileGenerator.test.ts

### Validation Engine

- [ ] T027 Create src/MultiSchema/Validator.ts: detect export name conflicts (via NameResolver), missing $refs (via RefResolver), circular refs (via DependencyGraph), unresolved schema IDs
- [ ] T028 [P] Unit test Validator: conflict detection (two schemas same export), missing refs (warns, doesn't error), cycles (detects, reports SCC), resolution success
  - File: test/MultiSchema/Validator.test.ts

---

## Phase 5: SchemaProject Core API

**Goal**: Implement main SchemaProject class and build orchestration.

### SchemaProject Class

- [ ] T029 Create src/MultiSchema/SchemaProject.ts: constructor (SchemaProjectOptions), addSchema/addSchemaFromFile/addSchemas, validate(), build(), getDependencyGraph(), resolveRef(), getSourceFile(), getProject(), dispose()
- [ ] T030 [P] Implement addSchema: register in registry, return SchemaEntry
- [ ] T031 [P] Implement addSchemaFromFile: read file, parse JSON, call addSchema, return promise
- [ ] T032 [P] Implement validate: instantiate Validator, run checks, populate ValidationResult
- [ ] T033 [P] Implement getDependencyGraph: build from registry refs, return DependencyGraph instance
- [ ] T034 Implement resolveRef: dispatch to RefResolver with currentSchemaId context
- [ ] T035 Unit test SchemaProject methods: addSchema, validate (conflicts/missing refs), build orchestration, error handling
  - File: test/MultiSchema/SchemaProject.test.ts

### Build Orchestration

- [ ] T036 Implement SchemaProject.build(): (1) validate(); (2) build dependency graph; (3) topologically sort; (4) parse each schema in order via parseSchema (injecting refs context); (5) generate source files via ts-morph; (6) generate index file; (7) emit to disk (both dist/esm and dist/cjs)
- [ ] T037 [P] Implement index file generation: barrel export of all schema exports from per-schema files
- [ ] T038 [P] Handle dual-module output: create dist/esm and dist/cjs separately via ts-morph, post-process via postcjs.js/postesm.js rules
- [ ] T039 [P] Integration test SchemaProject.build: 3-schema project (user, post, comment) with cross-refs, verify files generated, imports correct, index includes all, code type-checks
  - File: test/MultiSchema/SchemaProject.integration.test.ts

---

## Phase 6: CLI Integration (Project Mode)

**Goal**: Add CLI support for multi-schema projects.

### CLI Flags & Parsing

- [ ] T040 Update src/cli.ts: add --project flag to enable project mode
- [ ] T041 [P] Add --schemas <glob|path> flag (repeated) to specify input schemas
- [ ] T042 [P] Add --out <dir> flag (required in project mode) for output directory
- [ ] T043 [P] Add --module-format <esm|cjs|both> flag (default: esm→both for SchemaProject); validated enum
- [ ] T044 [P] Add --zod-version <v3|v4> flag, --generate-index, --declarations flags
- [ ] T045 [P] Parse glob patterns (--schemas), resolve to file list, pass to SchemaProject.addSchemaFromFile in loop

### CLI Execution & Error Handling

- [ ] T046 Implement project mode main: instantiate SchemaProject with CLI args, loop addSchemaFromFile, call build(), handle errors (export conflicts fail, missing refs warn), exit code non-zero on errors
- [ ] T047 [P] Format error output: list all conflicts (schema IDs + export names), missing refs (refs + context), cycles (SCCs), validation errors before attempting build
- [ ] T048 [P] Unit test CLI project mode: args parsing, glob expansion, error handling, exit codes
  - File: test/cli.test.ts (extend with project mode cases)

---

## Phase 7: Lazy Builders & Cycle Handling

**Goal**: Support circular $ref patterns gracefully.

### Lazy Builder Implementation

- [ ] T049 Extend ZodBuilder/ReferenceBuilder to support lazy flag: ReferenceBuilder(lazy=true) emits type-only import + lazy z.lazy(() => ...) or z.unknown() as fallback
- [ ] T050 [P] Update DependencyGraph cycle detection: mark nodes in SCCs, pass lazy flag to ReferenceBuilder during parseRef
- [ ] T051 [P] Update parseRef to check for cycles: if (graphHasCycle(fromSchemaId, targetSchemaId)) { return ReferenceBuilder({lazy: true}) }
- [ ] T052 [P] Unit test lazy builders: cycle A→B→A generates type-only imports, z.lazy() for one direction, warnings logged
  - File: test/MultiSchema/LazyBuilders.test.ts

### Missing Ref Placeholders

- [ ] T053 Update parseRef to handle missing target schema: return ReferenceBuilder with z.unknown() builder, warnings logged
- [ ] T054 [P] Unit test missing ref handling: logs warning, generates z.unknown() placeholder, build proceeds
  - File: test/MultiSchema/MissingRefs.test.ts (extend existing)

---

## Phase 8: Validation & Error Reporting

**Goal**: Ensure clear validation and error messages.

### Conflict Detection & Reporting

- [ ] T055 Validator.detectExportConflicts(): for each schemaId, derive export name; detect duplicates; populate ValidationResult.errors with NameConflict details (conflicting schemaIds, derived names)
- [ ] T056 [P] Test conflict reporting: two schemas (user.json, user/model.json) both export UserSchema, error identifies both IDs and names
  - File: test/MultiSchema/Validator.test.ts

### Missing & Cycle Warnings

- [ ] T057 Validator.detectMissingRefs(): walk all $refs, check against registry, populate warnings (not errors; build proceeds)
- [ ] T058 Validator.detectCycles(): delegate to DependencyGraph, populate warnings (not errors; lazy builders enabled)
- [ ] T059 [P] Test warnings: build succeeds, warnings returned, no errors
  - File: test/MultiSchema/Validator.test.ts

---

## Phase 9: Integration & E2E Tests

**Goal**: Validate full workflows match acceptance criteria.

### User Story 1: OpenAPI Components (P1)

- [ ] T060 Create test fixture: OpenAPI-like schema with User, Post, Comment components (cross-refs)
- [ ] T061 [P] E2E test US1: SchemaProject.addSchema (3 schemas), build(), verify 3 .ts files, index.ts, imports correct, code type-checks via tsc
  - File: test/MultiSchema/UserStory1.e2e.test.ts
- [ ] T062 [P] E2E test US1 CLI: x-to-zod --project --schemas test/fixtures/openapi/*.json --out /tmp/test-out --generate-index, verify same output
  - File: test/cli.test.ts

### User Story 2: Domain-Driven Design (P2)

- [ ] T063 Create test fixture: common/types.json (ID, Timestamp), user/schema.json (references common/ID), post/schema.json (references common/ID + user/User)
- [ ] T064 [P] E2E test US2: SchemaProject.addSchemaFromFile ×3, build(), verify imports (user imports from ../common/types), DependencyGraph order, code type-checks
  - File: test/MultiSchema/UserStory2.e2e.test.ts
- [ ] T065 [P] Test circular refs (user/schema → post/schema → user/schema): validate warns on cycle, build succeeds with lazy builders
  - File: test/MultiSchema/UserStory2.e2e.test.ts

### User Story 3: Monorepo (P3) — Deferred (Post-MVP)

- [ ] T066 [DEFER] Create multiple SchemaProject instances (pkg1, pkg2), verify isolated outputs

---

## Phase 10: Documentation & Export

**Goal**: Export API, document feature, finalize multi-schema support.

### API Exports

- [ ] T067 Update src/index.ts: export SchemaProject, SchemaProjectOptions, SchemaEntry, DependencyGraph, RefResolution, NameResolver, RefResolver, BuildResult, ValidationResult
- [ ] T068 [P] Update src/index.ts JSDoc: document multi-schema entry points, link to quickstart.md
- [ ] T069 [P] Ensure types are accessible: verify src/MultiSchema/index.ts re-exports public types

### Documentation

- [ ] T070 Create docs/multi-schema-projects.md: architecture overview, API reference, CLI reference, examples (OpenAPI, DDD, CLI), troubleshooting (conflicts, cycles, missing refs)
- [ ] T071 [P] Update README.md: mention multi-schema support, link to docs/multi-schema-projects.md
- [ ] T072 [P] Update MIGRATION-GUIDE.md or create new section: how to migrate from single-schema to SchemaProject

### Version & Release

- [ ] T073 Update package.json: bump to 0.6.0-alpha.1, add ts-morph to dependencies, regenerate pnpm-lock.yaml
- [ ] T074 [P] Update CHANGELOG.md: entry for feature 004 (multi-schema support, ts-morph integration, CLI project mode)
- [ ] T075 [P] Verify tests pass: npm test && npm run lint
- [ ] T076 Create PR: feature/004-multi-schema-projects → master with draft status pending review

---

## Phase 11: Polish & Cross-Cutting

**Goal**: Handle edge cases, optimize, finalize.

### Edge Case Handling

- [ ] T077 [P] Handle deeply nested $refs: validate parseRef chain doesn't exceed reasonable depth (prevent stack overflow)
- [ ] T078 [P] Handle very large schemas: test with 50+ component project, verify performance <5s
- [ ] T079 [P] Handle special characters in schema IDs: validate NameResolver escapes properly (e.g., user-profile → userProfile or user_profile)
- [ ] T080 [P] Test with invalid JSON Schema: parseSchema errors caught, validation reports, build fails gracefully

### Post-Processor Integration

- [ ] T081 Extend SchemaProject to accept globalPostProcessors config
- [ ] T082 [P] Apply post-processors after per-schema parsing, before source file generation
- [ ] T083 [P] Unit test: post-processor modifies builder, result reflects changes, errors caught

### Performance Optimization

- [ ] T084 Profile build time for 10+ schemas: baseline metric
- [ ] T085 [P] Optimize DependencyGraph topo-sort (if needed): ensure linear time
- [ ] T086 [P] Optimize ImportManager deduplication: avoid O(n²) duplicate checking
- [ ] T087 [P] Re-baseline after optimization: confirm <5s target for 10+ component project

### Type Safety & Strict Mode

- [ ] T088 [P] Verify all generated code type-checks under strict TS: no implicit any, exact typing for builders
- [ ] T089 [P] Test generated code with tsc --strict in integration tests

---

## Dependency Chains & Parallel Opportunities

### Parallelizable Groups (no internal dependencies)

1. **Infrastructure** (T001–T007): Dependency setup, type defs → independent
2. **Foundational Core** (T008–T016): Registry, graph, refs, resolver → can parallelize SchemaRegistry, NameResolver, DependencyGraph, RefResolver, BuilderRegistry independently
3. **Parser & Builder** (T017–T022): parseRef, ReferenceBuilder → depend on Phase 2 completion
4. **ts-morph Integration** (T023–T026): ImportManager, SourceFileGenerator → depend on Phase 3
5. **Validation** (T027–T028): Validator → depends on Phase 2 (graph, registry, resolver)
6. **SchemaProject Core** (T029–T039): Main orchestrator → depends on Phases 2–5
7. **CLI** (T040–T048): CLI flags and execution → depends on Phase 5 (SchemaProject)
8. **Lazy & Missing** (T049–T054): Lazy builders, missing refs → depends on Phase 3 (parseRef)
9. **Validation Details** (T055–T059): Conflict/missing/cycle reporting → depends on Phase 2 & 8
10. **E2E Tests** (T060–T065): Integration tests → depends on all previous phases; can run in parallel per user story
11. **Documentation & Export** (T067–T076): Exports, docs, release → depends on all phases
12. **Polish** (T077–T089): Edge cases, perf, type safety → final pass after Phase 11

### Build Sequence

**Suggested Execution Order** (respecting dependencies):

1. Phases 1–2 sequentially (setup prerequisites)
2. Phase 3 in parallel with Phase 4 setup (parseRef can develop while ImportManager started)
3. Phases 5–6 (SchemaProject orchestration, then CLI)
4. Phases 7–9 (lazy builders, validation details, E2E)
5. Phases 10–11 (docs, polish, release)

---

## Success Criteria for Phase Completion

- **Phase 1**: ts-morph installed, type defs complete, no build errors
- **Phase 2**: Registry, graph, resolver, NameResolver all unit-tested; no regressions
- **Phase 3**: parseRef integrated, ReferenceBuilder tested, existing parser tests still pass
- **Phase 4**: ts-morph files generated, index created, dual-module outputs in dist/esm and dist/cjs
- **Phase 5**: SchemaProject fully functional for 3-schema projects, validation accurate
- **Phase 6**: CLI --project mode works, all flags parsed, errors clear
- **Phase 7**: Cycles handled via lazy builders, missing refs placeholder, builds complete
- **Phase 8**: Validation reports all classes of issues (conflicts, missing, cycles) with clarity
- **Phase 9**: User Story 1 & 2 E2E tests pass, CLI matches programmatic API output
- **Phase 10**: API exported, docs complete, README updated, version bumped, CHANGELOG updated
- **Phase 11**: Edge cases handled, performance <5s for 10+ schemas, all tests green, strict TS

---

## Test Coverage Goals

- **Unit**: Registry, graph, refs, resolver, builders, validator, imports, SourceFileGenerator: **90%+ coverage**
- **Integration**: SchemaProject methods, build orchestration, dual outputs: **85%+ coverage**
- **E2E**: US1 & US2 workflows (programmatic + CLI): **100% of acceptance scenarios**
- **Type Safety**: All generated code type-checks strict TS: **100%**

---

## Notes

- **Constitution Compliance**: Plan ensures dual-module output (dist/esm + dist/cjs) per Principle II, CLI-first contract per III, TDD (tests first per IV), type safety per V
- **Spec Clarifications**: Tasks respect clarifications on export conflicts (fail), circles (lazy), missing refs (placeholder), dual-module (ESM/CJS both)
- **MVP Scope**: User Stories 1–2 (P1/P2); Stories 3–4 deferred post-release
- **Future Enhancements**: Incremental builds, watch mode, schema validation, remote $refs, plugin system
