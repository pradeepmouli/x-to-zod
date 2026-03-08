# Research: Reorganize Parser/Builder/Project APIs

## Decision 1: parserOverride — Pluralize or Remove?

**Decision**: Remove entirely.

**Rationale**: `registerParser()` already provides the structured extension point for custom type-based parsers. `parserOverride` was an ad-hoc escape hatch with:
- No path filtering (users had to check `refs.path` manually)
- No composition (single function, not an array)
- Inconsistent API pattern (bare function vs config object for pre/post processors)
- Overlapping purpose with `registerParser()` + `postProcessors`

**Alternatives considered**:
1. **Pluralize to `parserOverrides[]`** (original spec plan) — Rejected because it would maintain a parallel extension mechanism alongside `registerParser()`, increasing API surface without adding capability.
2. **Keep singular but normalize** — Rejected for same reason; the singular vs plural distinction was a symptom of the deeper redundancy.

**Migration path for consumers**:
- Type-based overrides → `registerParser()` (global, reusable)
- Path-specific overrides → `postProcessors` with `pathPattern`
- Schema mutation → `transformers`
- Runtime guards throw with actionable error messages for removed options

## Decision 2: PreProcessor Naming

**Decision**: Rename `PreProcessor` → `SchemaTransformer`, `preProcessors` → `transformers`.

**Rationale**: "PreProcessor" implies ordering relative to other processors but doesn't describe what it does. "SchemaTransformer" accurately describes the operation: it transforms a schema node before parsing. This aligns with the pipeline terminology:
```
Schema → transformers → Parser → postProcessors → Builder
```

**Alternatives considered**:
1. **Keep `preProcessors`** — Rejected; the name was a legacy holdover from when `preprocessors` (lowercase) was the only option.
2. **Use `schemaProcessors`** — Rejected; "processor" is too generic and conflicts with `postProcessors`.

## Decision 3: Name Collision Resolution Strategy

**Decision**: Prefix project-layer types with `Project`.

**Rationale**: Two name collisions existed:
- `PostProcessorConfig` in both `Types.ts` and `SchemaProject/types.ts`
- `SchemaMetadata` in both `SchemaInput/index.ts` and `SchemaProject/types.ts`

The core-layer types (`PostProcessorConfig`, `SchemaMetadata`) are the more commonly used ones and should keep the shorter names. Project-layer types get the `Project` prefix since they're used in a narrower context.

**Alternatives considered**:
1. **Merge into single types** — Rejected; they have genuinely different shapes and serve different layers.
2. **Namespace via modules** — Already the case (different files), but the name collision still leaks through barrel exports and import auto-complete.

## Decision 4: v3/v4 Deduplication Strategy

**Decision**: `export * from './index.js'` + local `build` override.

**Rationale**: `v3.ts` and `v4.ts` each duplicated ~30 lines of exports from `index.ts`. The `export *` pattern eliminates this duplication while allowing each file to override only the `build` constant with the version-specific factory.

**Alternatives considered**:
1. **Single entry point with runtime version selection** — Rejected; breaks tree-shaking and loses the type safety of version-specific imports.
2. **Code generation** — Rejected; unnecessary complexity for a simple re-export pattern.

## Decision 5: Defensive Checks in EnumParser/ConstParser

**Decision**: Add explicit validation with actionable error messages.

**Rationale**: Both parsers used non-null assertions (`!`) or implicit property access after removing explicit type casts. While the registry guards prevent invalid schemas from reaching these parsers under normal dispatch, direct construction by extension authors could hit confusing errors.

**Alternatives considered**:
1. **Keep non-null assertions** — Rejected; hides the failure mode and produces unhelpful stack traces.
2. **Restore explicit type casts** — Rejected; casts hide the problem at compile time without runtime protection.

## Decision 6: Runtime Guards for Removed Options

**Decision**: Throw with migration instructions when removed options are passed.

**Rationale**: TypeScript prevents compile-time usage of removed options, but JavaScript consumers, `as any` casts, and pre-compiled `.d.ts` files from previous versions can still pass them at runtime. Without guards, removed options are silently ignored — the system appears to work but produces incorrect output.

**Alternatives considered**:
1. **console.warn** — Rejected; too easy to miss, especially in CI/build pipelines.
2. **No guard (rely on TypeScript)** — Rejected; JavaScript consumers and type assertions bypass TypeScript checks.
