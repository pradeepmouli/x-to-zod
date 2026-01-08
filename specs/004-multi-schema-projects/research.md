# Research (Phase 0)

## Decisions

### 1) Dual-module output strategy
- **Decision**: Emit both ESM and CJS builds using separate tsconfigs and post-build scripts (consistent with existing postcjs.js/postesm.js flow). CLI entry must resolve correctly in both.
- **Rationale**: Constitution Principle II mandates simultaneous ESM/CJS support; avoids runtime ambiguity and matches existing repo pattern.
- **Alternatives considered**: (a) ESM-only with user transpile (rejected: violates constitution; inconsistent DX); (b) dual-exports in single file (rejected: bundler confusion, tree-shaking issues).

### 2) Circular $ref handling
- **Decision**: Detect cycles, warn, and generate lazy builders/type-only imports to allow build completion.
- **Rationale**: Cyclic domain models are common; fail-open with warnings preserves usability while surfacing risk.
- **Alternatives considered**: Fail-fast (blocks users), silent resolution (dangerous, hides issues).

### 3) Missing $ref handling
- **Decision**: Build proceeds with `z.unknown()` placeholders; log all unresolved refs as warnings.
- **Rationale**: Keeps build unblocked while signaling incomplete coverage; aligns with spec clarifications.
- **Alternatives considered**: Fail-fast (too strict for incremental adoption); auto-fetch remote refs (out of scope, security risk).

### 4) Import path generation
- **Decision**: Use ts-morph ImportManager to compute relative paths; allow optional importPathTransformer hook post-computation.
- **Rationale**: Ensures deterministic, correct relative imports across schema graph; hook supports monorepo/custom layouts.
- **Alternatives considered**: Manual string concat (error-prone), path alias resolution (overkill for MVP).

### 5) Dependency graph & build order
- **Decision**: Build dependency graph from $ref edges; topologically sort; when cycles detected, mark nodes and fall back to lazy builders.
- **Rationale**: Guarantees referenced schemas are emitted before dependents when acyclic; clearly flags cyclic cases.
- **Alternatives considered**: Single-pass unordered generation (risks missing imports), parallel naive build (non-deterministic ordering).

### 6) Performance target
- **Decision**: Optimize for 10–100 schemas, target <5s build for 10+ component set; linear-time graph/import generation.
- **Rationale**: Matches success criteria and typical OpenAPI component scale; keeps MVP measurable.
- **Alternatives considered**: No perf target (unmeasurable), aggressive parallelization (premature; added complexity).
