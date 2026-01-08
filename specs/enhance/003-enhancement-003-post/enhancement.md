# Enhancement: Post-Processing API

**Enhancement ID**: enhance-003
**Branch**: `enhance/003-enhancement-003-post`
**Created**: 2026-01-07
**Priority**: [ ] High | [x] Medium | [ ] Low
**Component**: Parser classes, ZodBuilder, Post-Processing utilities
**Status**: [x] Planned | [ ] In Progress | [ ] Complete

## Input
User description: "Enhancement 003: Post-Processing API integrated into parser classes to allow path-based builder transformations, presets, and type-guarded modifications during parsing (additive, no breaking changes)."

## Overview
Introduce a post-processing API integrated into the parser architecture to transform or inspect ZodBuilders during parsing. Processors can conditionally modify builders based on schema path and type, enabling global tweaks, targeted changes, and validations without replacing parsers.

## Motivation
Current parsing produces builders with no hook to adjust or validate them afterwards. `parserOverride` is coarse and replaces logic entirely, and there is no path-aware conditional control. A dedicated post-processing step enables common needs like strict objects by default, branding ID fields, optionalizing specific paths, and pre-generation validation/metrics—while remaining additive and configurable.

## Proposed Changes
- Add core types: `PostProcessor`, `PostProcessorContext`, and optional `PostProcessorConfig` with early filters.
- Integrate `postProcessors` option into parsing pipeline and context; apply during builder creation in parser classes.
- Implement path pattern matching utilities (wildcards `*`, recursive `**`, JSONPath-like segments) with caching.
- Provide preset helpers (e.g., strict objects, brand IDs, make optional/required, matchPath wrapper).
- Add builder type-guard utilities for safe, instance-agnostic checks.

**Files to Modify**:
- src/index.ts – plumb `postProcessors` through public API.
- src/jsonSchemaToZod.ts – pass `postProcessors` via context to parser classes and final builder.
- src/JsonSchema/parsers/* – call `applyPostProcessors()` within base parser flow (as available with parser classes).
- src/utils/is.ts – add builder type guards used by post-processors.

**New Files**:
- src/PostProcessing/pathMatcher.ts – compile/match JSONPath-like patterns with cache.
- src/PostProcessing/pathParser.ts – parse patterns to internal form.
- src/PostProcessing/presets.ts – pre-built post-processor helpers.

**Breaking Changes**: [ ] Yes | [x] No

## Implementation Plan

**Phase 1: Implementation**

**Tasks**:
1. [ ] Implement pattern parsing and matching with support for `*`, `**`, and exact segments; add simple LRU cache.
2. [ ] Define `PostProcessor`, `PostProcessorContext`, and optional `PostProcessorConfig`; expose `matchPath()` in context.
3. [ ] Wire `postProcessors` through `index/jsonSchemaToZod` into parser context; invoke in base parser after builder creation.
4. [ ] Add preset helpers in `src/PostProcessing/presets.ts` (e.g., `strictObjects`, `nonemptyArrays`, `brandIds`, `makeOptional`, `makeRequired`, `matchPath`).
5. [ ] Extend `src/utils/is.ts` with builder type guards used by presets (object/string/array/number/union...).
6. [ ] Add tests: path matcher unit tests; presets unit tests; integration tests proving transformations occur during parsing.

**Acceptance Criteria**:
- [ ] Path matching covers common patterns (`$`, `$.properties.*`, `$.properties.**`, `$..field`).
- [ ] Processors apply deterministically during parsing without separate tree traversal.
- [ ] Preset helpers function as documented (strict objects, optionalization, branding IDs).
- [ ] Type guards accurately narrow builder variants and are used in examples/tests.
- [ ] No breaking changes; non-processor runs show no performance regressions.

## Testing
- [ ] Unit tests added/updated (path matcher, presets, type guards)
- [ ] Integration tests pass (parser + post-processors on representative schemas)
- [ ] Manual testing complete (quick examples mirroring docs)
- [ ] Edge cases verified (deep nesting, many processors, no-op paths)

## Verification Checklist
- [ ] Changes implemented as described
- [ ] Tests written and passing
- [ ] No regressions in existing functionality
- [ ] Documentation updated (docs/post-processing.md with examples)
- [ ] Code reviewed (if appropriate)

## Notes
- This enhancement aligns with the parser class architecture (Refactor 008) and hooks into its base flow (`applyPostProcessors`).
- Performance: rely on early filtering (path/type) and compiled pattern caching; processors run during parsing to avoid double traversal.
- Additive only; existing consumers can ignore `postProcessors` and see unchanged behavior.

---
*Enhancement created using `/enhance` workflow - See .specify/extensions/workflows/enhance/*
