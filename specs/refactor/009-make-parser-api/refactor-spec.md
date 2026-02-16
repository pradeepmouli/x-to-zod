# Refactor Spec: Make Parser API and Builder API Symmetrical

**Refactor ID**: refactor-009
**Branch**: `refactor/009-make-parser-api`
**Created**: 2026-02-15
**Type**: [x] Architecture | [x] Maintainability
**Impact**: [x] Medium Risk
**Status**: [x] Planning

## Input
User description: "make parser api, and builder api symmetrical"

## Clarifications
### Session 2026-02-15
- Q: Parser method selection strategy → A: Mirror only JSON Schema-compatible types (~15 types), exclude Zod-specific types like promise, lazy, function, codec
- Q: Naming convention for JSON Schema vs Zod differences → A: Match JSON Schema naming (parse.const for literals, parse.enum for enums)
- Q: Handling compound type aliases → A: Add convenience aliases (parse.union → anyOf, parse.intersection → allOf, parse.discriminatedUnion → oneOf)
- Q: Implementation phasing strategy → A: Two phases - Phase 1: Core types (enum, const, tuple), Phase 2: Aliases and remaining types
- Q: RecordParser scope and timing → A: Defer to Phase 2 (focus Phase 1 on simpler parsers)

## Motivation

### Current State Problems
**Code Smell(s)**:
- [x] Inconsistent API surface (asymmetric design)
- [x] Primitive Obsession (missing parser methods for JSON Schema types)
- [x] Tight Coupling (parser selection logic mixed with API design)
- [x] Other: API discoverability issues, unclear what types are supported

**Concrete Examples**:
- [src/ZodBuilder/v4.ts](../../src/ZodBuilder/v4.ts): Builder API exports 40+ type methods
- [src/JsonSchema/parsers/index.ts](../../src/JsonSchema/parsers/index.ts) lines 28-177: Parser API only exports 9 methods
- [src/JsonSchema/index.ts](../../src/JsonSchema/index.ts) lines 41-60: Inconsistent naming (parse.Schema vs parse.array)
- Missing parser methods for JSON Schema types: enum, const (literal), tuple

### Business/Technical Justification
[Why is this refactoring needed NOW?]
- [x] Developer velocity impact - developers expect symmetric APIs
- [x] Technical debt accumulation - asymmetry makes future additions inconsistent
- [x] Other: User confusion about supported types, poor API discoverability

## Proposed Improvement

### Refactoring Pattern/Technique
**Primary Technique**: API Harmonization + Extract Class

**High-Level Approach**:
Add missing parser classes (EnumParser, ConstParser, TupleParser) following the existing BaseParser template method pattern. Expand parser API with new methods using JSON Schema naming conventions (parse.const, parse.enum, parse.tuple). Add convenience aliases for Zod terminology (parse.union, parse.intersection). Phase 1 focuses on core parsers, Phase 2 adds aliases and RecordParser. All changes are additive and maintain backward compatibility.

**Files Affected**:
- **Modified**: 
  - src/JsonSchema/parsers/index.ts (add new parser methods)
  - src/JsonSchema/index.ts (align naming: parse.Schema → parse.schema)
  - src/JsonSchema/parsers/registry.ts (register new parsers)
  - docs/parser-architecture.md (document API symmetry)
  - docs/API.md (update API docs)
- **Created**: 
  - src/JsonSchema/parsers/TupleParser.ts
  - docs/api-symmetry.md (new doc)
- **Discovered (already exist, need API exposure)**:
  - src/JsonSchema/parsers/EnumParser.ts (exists, registered, needs parse.enum() method)
  - src/JsonSchema/parsers/ConstParser.ts (exists, registered, needs parse.const() method)
- **Deleted**: None
- **Moved**: None

### Design Improvements
**Before**:
```
Builder API (40+ methods)       Parser API (9 methods)
├── number()                   ├── number()
├── string()                   ├── string()
├── boolean()                  ├── boolean()
├── null()                     ├── null()
├── array()                    ├── array()
├── object()                   ├── object()
├── enum()                     ├── anyOf()
├── literal()                  ├── allOf()
├── union()                    ├── oneOf()
├── intersection()             └── [missing 30+ methods]
├── tuple()
├── ... (30+ more)
└── [ASYMMETRIC]
```

**After**:
```
Builder API (40+ methods)       Parser API (15+ methods)
├── number()                   ├── number()
├── string()                   ├── string()
├── boolean()                  ├── boolean()
├── null()                     ├── null()
├── array()                    ├── array()
├── object()                   ├── object()
├── enum()                     ├── enum() [NEW]
├── literal()                  ├── const() [NEW - JSON Schema term]
├── union()                    ├── union() [NEW - alias for anyOf]
├── intersection()             ├── intersection() [NEW - alias for allOf]
├── tuple()                    ├── tuple() [NEW]
├── record()                   ├── record() [NEW - Phase 2]
├── discriminatedUnion()       ├── discriminatedUnion() [NEW - alias for oneOf]
├── any()                      ├── any() [NEW]
├── unknown()                  ├── unknown() [NEW]
├── never()                    ├── never() [NEW]
├── ... (Zod-only types)       ├── anyOf() [EXISTING]
└── [SYMMETRIC for JSON        ├── allOf() [EXISTING]
     Schema types]             ├── oneOf() [EXISTING]
                               └── schema() [EXISTING - renamed from Schema]
```

## Phase 0: Testing Gap Assessment
*CRITICAL: Complete BEFORE capturing baseline metrics - see testing-gaps.md*

### Pre-Baseline Testing Requirement
- [ ] **Testing gaps assessment completed** (see `testing-gaps.md`)
- [ ] **Critical gaps identified and addressed**
- [ ] **All affected functionality has adequate test coverage**
- [ ] **Ready to capture baseline metrics**

**Rationale**: Refactoring requires behavior preservation validation. If code lacks test coverage, we cannot verify behavior is preserved. All impacted functionality MUST be tested BEFORE establishing the baseline.

### Testing Coverage Status
**Affected Code Areas**:
- src/JsonSchema/parsers/index.ts: Coverage [TBD] - [ ] ✅ Adequate [ ] ❌ Needs Tests
- New parser classes (EnumParser, ConstParser, TupleParser): Coverage [0%] - [x] ❌ Needs Tests
- src/JsonSchema/index.ts: Coverage [TBD] - [ ] ✅ Adequate [ ] ❌ Needs Tests
- src/JsonSchema/parsers/registry.ts: Coverage [TBD] - [ ] ✅ Adequate [ ] ❌ Needs Tests

**Action Taken**:
- [ ] No gaps found - proceeded to baseline
- [ ] Gaps will be addressed - comprehensive tests required for new parsers
- [ ] Gaps documented in testing-gaps.md

---

## Baseline Metrics
*Captured AFTER testing gaps are addressed - see metrics-before.md*

### Code Complexity
- **Cyclomatic Complexity**: [number or "not measured"]
- **Cognitive Complexity**: [number or "not measured"]
- **Lines of Code**: [number]
- **Function Length (avg/max)**: [avg: X lines, max: Y lines]
- **Class Size (avg/max)**: [avg: X lines, max: Y lines]
- **Duplication**: [X% or "Y instances"]

### Test Coverage
- **Overall Coverage**: [X%]
- **Lines Covered**: [X/Y]
- **Branches Covered**: [X/Y]
- **Functions Covered**: [X/Y]

### Performance
- **Build Time**: [X seconds]
- **Bundle Size**: [X KB]
- **Runtime Performance**: [X ms for key operations]
- **Memory Usage**: [X MB]

### Dependencies
- **Direct Dependencies**: [count]
- **Total Dependencies**: [count including transitive]
- **Outdated Dependencies**: [count]

## Target Metrics
*Goals to achieve - measurable success criteria*

### Code Quality Goals
- **API Symmetry**: Parser API has methods for all JSON Schema-compatible Zod types (target: ~15 methods vs 9 currently)
- **Naming Consistency**: All method names follow consistent convention (target: 100% - all lowercase, JSON Schema terms)
- **Documentation Coverage**: All public parser methods have comprehensive JSDoc (target: 100%)
- **Test Coverage**: Maintain or increase current coverage (target: > 95%)
- **Duplication**: No duplicated parser logic (target: 0 instances)

### Performance Goals
- **Build Time**: Maintain or improve (no regression > 5%)
- **Bundle Size**: Minimal increase acceptable (< 5KB for new parser classes)
- **Runtime Performance**: Maintain or improve parseSchema performance (no regression > 5%)
- **Memory Usage**: Maintain or reduce

### Success Threshold
**Minimum acceptable improvement**:
1. Parser API has methods for all JSON Schema-compatible types (enum, const, tuple, union, intersection, discriminatedUnion, any, unknown, never)
2. All method names follow JSON Schema conventions (const not literal, enum not enum)
3. All existing tests pass without modification
4. New parser classes have > 90% test coverage
5. Documentation clearly maps JSON Schema keywords to parser methods
6. No performance regression > 5% in any metric

## Behavior Preservation Guarantee
*CRITICAL: Refactoring MUST NOT change external behavior*

### External Contracts Unchanged
- [ ] API endpoints return same responses
- [ ] Function signatures unchanged (or properly deprecated)
- [ ] Component props unchanged
- [ ] CLI arguments unchanged
- [ ] Database schema unchanged
- [ ] File formats unchanged

### Test Suite Validation
- [ ] **All existing tests MUST pass WITHOUT modification**
- [ ] If test needs changing, verify it was testing implementation detail, not behavior
- [ ] Do NOT weaken assertions to make tests pass

### Behavioral Snapshot
**Key behaviors to preserve**:
1. parseSchema continues to select correct parser class via registry
2. Existing parse.object(), parse.array(), etc. produce identical ZodBuilder output
3. Parser class instantiation and .parse() method behavior unchanged
4. Context (refs) threading through nested parsers unchanged
5. Post-processor and pre-processor application unchanged
6. Circular reference handling unchanged
7. Export structure and public API remain accessible

**Test**: Run existing test suite before and after - all tests must pass. See behavioral-snapshot.md for detailed verification.

## Risk Assessment

### Risk Level Justification
**Why Medium Risk**:
- Public API surface is expanding (additive changes)
- User-facing method naming is changing (requires aliases for backward compatibility)
- New parser classes could have edge cases
- Documentation needs to be comprehensive
- Limited blast radius: new methods are opt-in, existing methods unchanged
- No changes to core parsing logic, only adding new entry points

### Potential Issues
- **Risk 1**: New parser methods have bugs or edge cases
  - **Mitigation**: Comprehensive unit tests (> 90% coverage), integration tests with parseSchema
  - **Rollback**: Remove new methods, revert to previous API surface

- **Risk 2**: Performance regression due to additional parser classes
  - **Mitigation**: Benchmark parseSchema before/after, ensure registry lookup remains O(1)
  - **Rollback**: Optimize or revert changes

- **Risk 3**: Naming confusion between const (JSON Schema) and literal (Zod)
  - **Mitigation**: Clear documentation, comprehensive JSDoc explaining mapping
  - **Rollback**: Not applicable (documentation-only risk)

### Safety Measures
- [ ] Feature flag available for gradual rollout
- [ ] Monitoring in place for key metrics
- [ ] Rollback plan tested
- [ ] Incremental commits (can revert partially)
- [ ] Peer review required
- [ ] Staging environment test required

## Rollback Plan

### How to Undo
1. Revert commits in refactor/009-make-parser-api branch
2. Delete new parser class files (EnumParser.ts, ConstParser.ts, TupleParser.ts)
3. Restore previous src/JsonSchema/parsers/index.ts
4. Restore previous src/JsonSchema/index.ts
5. Verify all tests pass: `pnpm test`
6. Rebuild documentation: `pnpm run docs`

### Rollback Triggers
Revert if any of these occur:
- [ ] More than 2 critical bugs in new parser methods within 2 weeks
- [ ] Performance regression > 10% in parseSchema
- [ ] Test coverage drops below 90%
- [ ] User feedback indicates API confusion
- [ ] Breaking changes discovered in public API

### Recovery Time Objective
**RTO**: < 2 hours (git revert + rebuild + redeploy docs)

## Implementation Plan

### Phase 0: Testing Gap Assessment (Pre-Baseline)
**CRITICAL FIRST STEP**: Assess and address testing gaps BEFORE baseline

1. Review `testing-gaps.md` template
2. Identify all code that will be modified during refactoring
3. Assess test coverage for each affected area
4. Document gaps (critical, important, nice-to-have)
5. **Add tests for critical gaps** - DO NOT proceed without these
6. Verify all new tests pass
7. Mark testing gaps assessment as complete

**Checkpoint**: Only proceed to Phase 1 when adequate test coverage exists

### Phase 1: Baseline (Before Refactoring)
1. Capture all baseline metrics (run `.specify/extensions/workflows/refactor/measure-metrics.sh --before`)
2. Create behavioral snapshot (document current outputs)
3. Ensure 100% test pass rate (including newly added tests)
4. Tag current state in git: `git tag pre-refactor-### -m "Baseline before refactor-###"`

### Phase 2: Refactoring - Part 1 (Core Parsers)
**Goal**: Implement EnumParser, ConstParser, TupleParser

1. Create EnumParser.ts extending BaseParser
   - Implement parseImpl() for enum keyword
   - Return EnumBuilder via refs.build.enum()
   - Write comprehensive unit tests (> 90% coverage)

2. Create ConstParser.ts extending BaseParser
   - Implement parseImpl() for const keyword  
   - Return ConstBuilder via refs.build.literal()
   - Write comprehensive unit tests (> 90% coverage)

3. Create TupleParser.ts extending BaseParser
   - Implement parseImpl() for prefixItems (2020-12) and items array (draft-07)
   - Return TupleBuilder via refs.build.tuple()
   - Write comprehensive unit tests (> 90% coverage)

4. Register new parsers in registry.ts
   - Add to parserRegistry Map
   - Update selectParserClass logic
   - Add integration tests

5. Add new methods to parsers/index.ts
   - parse.enum(schema, refs)
   - parse.const(schema, refs)
   - parse.tuple(schema, refs)
   - Add JSDoc for each method

6. Align naming in JsonSchema/index.ts
   - Rename parse.Schema → parse.schema (lowercase follows JavaScript/TypeScript convention for methods, matches existing parse.array, parse.object pattern)
   - Rename parse.Ref → parse.ref (parseRef handles $ref resolution for multi-schema projects from feature-004; lowercase aligns with convention)
   - Keep parse.Schema and parse.Ref as deprecated aliases
   - Update internal usages to lowercase

**Checkpoint**: All Phase 2.1 tests pass, coverage > 90%

### Phase 3: Refactoring - Part 2 (Aliases & Remaining)
**Goal**: Add convenience aliases and RecordParser

1. Add compound type aliases to parsers/index.ts
   - parse.union() → parse.anyOf()
   - parse.intersection() → parse.allOf()
   - parse.discriminatedUnion() → parse.oneOf()
   - Add JSDoc explaining alias relationship

2. Add special type methods
   - parse.any() - returns refs.build.any()
   - parse.unknown() - returns refs.build.unknown()
   - parse.never() - returns refs.build.never()

3. Create RecordParser.ts (deferred from Phase 2.1)
   - Implement parseImpl() for additionalProperties patterns
   - Return RecordBuilder via refs.build.record()
   - Write comprehensive unit tests

4. Add parse.record() method to parsers/index.ts

**Principle**: Each step should compile and pass tests

### Phase 4: Documentation
**Goal**: Update all documentation to reflect API symmetry

1. Update docs/API.md
   - Add "Parser API vs Builder API" section
   - Document all new parser methods
   - Show examples of using parser API directly

2. Update docs/parser-architecture.md
   - Document API design principles
   - Explain symmetry goal and JSON Schema-only scope
   - Add section on convenience aliases

3. Create docs/api-symmetry.md
   - Side-by-side comparison table
   - JSON Schema keyword to Zod type mapping
   - Guidance on when to use parser API vs parseSchema
   - List of Zod-only types with explanation

### Phase 5: Validation
1. Run full test suite (MUST pass 100%)
2. Capture metrics-after.md
3. Compare against target metrics
4. Compare behavioral snapshot (MUST be identical)
5. Performance regression test (no regression > 5%)
6. Verify API symmetry goals met
7. Request peer review

### Phase 6: Merge & Monitor
1. Code review focused on behavior preservation
2. Merge to master
3. Monitor for issues over 2 weeks
4. Address any reported bugs
5. Update changelog

## Verification Checklist

### Phase 0: Testing Gap Assessment
- [ ] Testing gaps assessment completed (testing-gaps.md)
- [ ] All affected code areas identified
- [ ] Test coverage assessed for each area
- [ ] Critical gaps identified and documented
- [ ] Tests added for all critical gaps
- [ ] All new tests passing
- [ ] Ready to proceed to baseline capture

### Pre-Refactoring (Phase 1)
- [ ] Baseline metrics captured and documented
- [ ] All tests passing (100% pass rate)
- [ ] Behavioral snapshot created
- [ ] Git tag created
- [ ] Rollback plan prepared

### During Refactoring
- [ ] Incremental commits (each one compiles and tests pass)
- [ ] External behavior unchanged
- [ ] No new dependencies added (unless justified)
- [ ] Comments updated to match code
- [ ] Dead code removed

### Post-Refactoring
- [ ] All tests still passing (100% pass rate)
- [ ] Target metrics achieved or improvement demonstrated
- [ ] Behavioral snapshot matches (behavior unchanged)
- [ ] No performance regression
- [ ] Code review approved
- [ ] Documentation updated

### Post-Deployment
- [ ] Monitoring shows stable performance
- [ ] No error rate increase
- [ ] No user reports related to refactored area
- [ ] 48-72 hour stability period completed

## Related Work

### Blocks
- User requests for direct enum/const/tuple parsing via API
- Feature requests to add more parser methods
- Documentation efforts explaining asymmetric API
- Third-party tool integrations expecting symmetric APIs

### Enables
- Future parser additions follow consistent symmetric pattern
- Clearer mental model for new contributors
- Better API discoverability for users
- Simplified documentation maintenance
- Potential for auto-generating API docs from schema

### Dependencies
- Requires Refactor 008 (parser class architecture) - ✅ COMPLETE
- No blocking dependencies

---
*Refactor spec created using `/refactor` workflow - See .specify/extensions/workflows/refactor/*
