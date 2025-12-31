# Refactor Spec: Parser Class Architecture with Integrated Post-Processing

**Refactor ID**: refactor-008
**Branch**: `refactor/008-refactor-008-parser`
**Created**: 2025-12-30
**Type**: [x] Architecture | [x] Maintainability
**Impact**: [x] Medium Risk
**Status**: [x] Planning | [ ] Baseline Captured | [ ] In Progress | [ ] Validation | [ ] Complete

## Input
User description: "Refactor 008: Parser Class Architecture with Integrated Post-Processing"

## Motivation

### Current State Problems

**Code Smell(s)**:
- [x] Duplication (DRY violation) - Parser functions have duplicated logic for metadata application, circular refs, and processor handling
- [x] Long Method - Parser functions are complex with multiple concerns (parsing, processing, metadata)
- [x] Primitive Obsession - Functions used instead of classes for parsing logic
- [x] Tight Coupling - All processors passed to all parsers; no separation of concerns
- [x] Asymmetric API - `build.object()` creates builders, but no matching `parse.object()`

**Concrete Examples**:
- [src/JsonSchema/parsers/index.ts]: parseObject, parseArray, parseString, etc. each reimplement metadata application and processor handling
- [src/JsonSchema/parsers/index.ts]: No type guards for builders - uses `instanceof` checks scattered throughout
- [src/JsonSchema/toZod.ts]: Post-processors passed to all parsers with no filtering by type or path
- [src/JsonSchema/parsers/index.ts]: Asymmetric API - no `parse.object()` equivalent to `build.object()`
- Current parser functions: ~50-100 lines each with duplicated pattern for handling refs, metadata, and processors

### Business/Technical Justification

**Why this refactoring is needed NOW**:
- [x] Blocking new features - Post-processing integration is difficult with functional parser architecture
- [x] Causing frequent bugs - Duplicated metadata logic leads to inconsistencies
- [x] Developer velocity impact - Hard to add new parser types or modify existing ones without understanding all interdependencies
- [x] Technical debt accumulation - Asymmetric API confuses users; lack of inheritance prevents code reuse

**Impact on Development**:
- Refactoring 006 (post-processing API) created demand for integrated processor support
- Current functional design cannot elegantly support processor filtering and early application
- New parser types (enum variants, custom formats) would require duplicating metadata/processor logic again
- Planned features (async processors, parser composition) require class-based architecture

## Proposed Improvement

### Refactoring Pattern/Technique

**Primary Technique**: Extract Class + Template Method Pattern

**High-Level Approach**:
Transform parser functions into a class hierarchy with a base parser class that implements the template method pattern. The `BaseParser` class will handle common concerns (metadata application, processor filtering, pre/post-processing hooks) while subclasses implement specific parsing logic (`parseImpl()`). This eliminates duplication, enables processor filtering, and supports future extensions.

**Files Affected**:
- **Created**: 
  - `src/JsonSchema/parsers/BaseParser.ts` - Abstract base class with template method
  - `src/JsonSchema/parsers/ObjectParser.ts`, `ArrayParser.ts`, `StringParser.ts`, `NumberParser.ts`, `BooleanParser.ts`, `NullParser.ts`, `AnyOfParser.ts`, `AllOfParser.ts`, `OneOfParser.ts`
  - `src/JsonSchema/parsers/registry.ts` - Parser class registry and selection
  
- **Modified**: 
  - `src/JsonSchema/parsers/index.ts` - Replace parser functions with class-based approach
  - `src/JsonSchema/toZod.ts` - Accept post-processors in options
  - `src/Types.ts` - Add PostProcessor and related types
  - `src/utils/is.ts` - Add builder type guards

### Design Improvements
**Before** (Functional Architecture):
```
JSON Schema → parseSchema(schema, refs)
  ├── parseObject(), parseArray(), parseString()
  └── [each parser independently:
      - applies metadata (duplicated)
      - handles refs (duplicated)
      - no processor support
  ↓
ZodBuilder
```

**After** (Class-Based with Template Method):
```
JSON Schema → parseSchema()
  ↓
selectParserClass() → new ParserClass(schema, refs)
  ↓
BaseParser.parse(): // Template method
  ├── applyPreProcessors()
  ├── parseImpl() // Subclass implementation
  ├── applyPostProcessors()
  └── applyMetadata()
  ↓
ZodBuilder

Symmetric API: parse.object() mirrors build.object()
```

## Phase 0: Testing Gap Assessment

### Pre-Baseline Testing Requirement
- [ ] **Testing gaps assessment completed** (see `testing-gaps.md`)
- [ ] **Critical gaps identified and addressed**
- [ ] **All affected functionality has adequate test coverage**
- [ ] **Ready to capture baseline metrics**

### Affected Code Areas Assessment

**Parser Functions** (to be refactored):
- `parseObject()` - Likely has tests in parser test files
- `parseArray()` - Likely has tests  
- `parseString()` - Likely has tests
- `parseNumber()` / `parseInt()` - Likely has tests
- `parseBoolean()` - Likely has tests
- `parseNull()` - Likely has tests
- `parseAnyOf()` / `parseOneOf()` / `parseAllOf()` - Likely has tests

**Key Test Files to Verify**:
- `test/jsonSchemaToZod.test.ts` - Integration tests for main function
- `test/parsers/` directory - Individual parser tests
- `test/eval.test.ts` - Evaluation and output tests

---

## Baseline Metrics
*Captured AFTER testing gaps are addressed - see metrics-before.md*

### Code Complexity (to be measured)

From metrics captured at workflow init:
- **Build Time**: 6 seconds
- **Test Files**: Run `npm test` to verify pass rate
- **Direct Dependencies**: 1
- **Dev Dependencies**: 16
- **Total Installed**: 118

**Key Files to Measure**:
- `src/JsonSchema/parsers/index.ts` - Main parser module
- `src/JsonSchema/toZod.ts` - Entry point
- Combined parser functions: Estimated ~500-700 lines of code across all parsers

### Test Coverage
- **Overall Coverage**: [Requires `npm run test:coverage`]
- **Parser-specific Coverage**: [To be established]

### Performance
- **Build Time**: ~6 seconds (baseline)

## Target Metrics

### Code Quality Goals

1. **Reduce Duplication**
   - **Goal**: Eliminate ~100-150 lines of duplicated metadata/processor logic
   - **Success**: No duplicated metadata/processor application code; all in BaseParser

2. **Improve Maintainability**
   - **Goal**: Single source of truth for metadata application and processor handling
   - **Success**: All parser types inherit behavior from BaseParser

3. **Add Type Safety**
   - **Goal**: Replace all `instanceof` checks with type guards
   - **Success**: Zero `instanceof` in processor/filtering logic; use `is.*` guards

4. **Symmetric API Completion**
   - **Goal**: Create `parse` object with complete API mirroring `build`
   - **Success**: `parse.schema()` works identically to `parseSchema()`

5. **Maintain Test Coverage**
   - **Goal**: Zero regression in test coverage
   - **Success**: Overall coverage maintained or improved

### Success Threshold

**Minimum acceptable improvement**:
- All parser functions converted to class-based approach
- Zero duplication of metadata application code
- All `instanceof` checks replaced with type guards
- Symmetric `parse` API implemented and functional
- All existing tests pass without modification
- No performance regression (build time ±5%)
- Test coverage maintained (>80% for parser code)

## Behavior Preservation Guarantee

### External Contracts Unchanged
- [x] API endpoint `jsonSchemaToZod(schema, options)` signature unchanged
- [x] Function return type still `ZodBuilder`
- [x] Output code generation unchanged (no behavior change)
- [x] Post-processor option support (new feature, backward compatible)
- [x] Error handling behavior unchanged
- [x] Circular reference handling unchanged

### Observable Behaviors to Preserve

1. **Basic Type Parsing**
   - Input: `{ type: "string" }` → Output: `z.string()`
   - Input: `{ type: "number" }` → Output: `z.number()`

2. **Object Schema Parsing**
   - Required properties remain required
   - Optional properties remain optional

3. **Array Schema Parsing**
   - Tuple arrays remain tuples
   - Item validation unchanged

4. **Circular References**
   - Circular references detected and handled with `.lazy()`
   - Same behavior as before

5. **Metadata Application**
   - Descriptions applied: `z.string().describe("...")`
   - Defaults applied: `z.string().default("...")`
   - Same order and application as before

### Test Suite Validation
- [ ] **All existing tests MUST pass WITHOUT modification**
- [ ] If test needs changing, verify it was testing implementation detail, not behavior
- [ ] Do NOT weaken assertions to make tests pass

## Risk Assessment

### Risk Level Justification

**Medium Risk** because:
- **Scope**: Large refactoring affecting core parser architecture
- **Blast Radius**: All schema parsing affected
- **Test Coverage**: Good existing test coverage reduces risk
- **Complexity**: Template method pattern is well-understood
- **User Impact**: Internal architecture change; external API unchanged
- **Rollback Difficulty**: Medium - can revert to functional approach if needed

**Mitigating Factors**:
- Existing comprehensive test suite validates behavior
- Incremental, phased approach reduces risk per phase
- Template method pattern is proven and well-known
- No runtime changes to generated code

**Escalating Factors**:
- Core functionality affected (parsing)
- Large number of files modified
- Class-based approach is different from current functional style

### Potential Issues

**Issue 1: Performance Regression from Class Instantiation**
- **What could go wrong**: Class instantiation overhead could slow parsing
- **Likelihood**: Low (instantiation overhead minimal)
- **Mitigation**: Measure build time and runtime performance
- **Rollback**: Revert to functional parser approach if regression exceeds 5%

**Issue 2: Processor Filtering Logic Incorrect**
- **What could go wrong**: Processors filtered incorrectly
- **Likelihood**: Medium (complex filtering logic)
- **Mitigation**: Comprehensive tests for processor filtering
- **Rollback**: Revert processor integration in Phase 4; keep class architecture

**Issue 3: Type Guard Implementation Missing Cases**
- **What could go wrong**: Some builder types not recognized by type guards
- **Likelihood**: Low (builders have consistent interface)
- **Mitigation**: Test `is.*` type guards with all builder types
- **Rollback**: Fall back to `instanceof` checks temporarily

**Issue 4: Circular Reference Detection Broken**
- **What could go wrong**: Circular references not detected; causes infinite recursion
- **Likelihood**: Low (logic unchanged, just moved to BaseParser)
- **Mitigation**: Preserve existing circular reference tests
- **Rollback**: Revert circular reference handling code

### Safety Measures
- [x] Feature flag available if needed (post-processor opt-in)
- [x] Incremental commits (each phase tested independently)
- [x] Comprehensive existing test suite available
- [x] Peer review required before merge
- [x] Staging environment test possible
- [x] Clear rollback plan documented

## Rollback Plan

### How to Undo

**Option 1: Revert Entire Branch**
```bash
git revert -m 1 <merge-commit-of-refactor-008>
git reset --hard pre-refactor-008  # Uses git tag created at baseline
```

**Option 2: Selective Revert**
1. Revert phase-specific commits
2. Keep working phases
3. Remove broken feature from exports
4. Run full test suite

**Option 3: Feature Flag** (for post-processor integration)
If post-processor phase breaks, disable feature in exports.

### Rollback Triggers

Revert if any of these occur within 24-48 hours:
- [x] Any test suite failure (100% pass rate required)
- [x] Performance regression > 10% on build time
- [x] Circular reference detection failure
- [x] Type guard implementation missing major builder type
- [x] Post-processor filtering causes unexpected behavior

### Recovery Time Objective
**RTO**: < 30 minutes
- Revert commit: ~2 minutes
- CI/CD run: ~6 minutes  
- Verification: ~22 minutes

## Implementation Plan

### Phase 0: Testing Gap Assessment (Pre-Baseline) ⏳ CURRENT

**Objectives**:
1. Identify test coverage for all parser functions
2. Ensure critical paths have adequate coverage
3. Add tests for any gaps

**Tasks**:
1. [ ] Run `npm test -- --coverage` to establish baseline coverage
2. [ ] Identify parser functions with <80% coverage
3. [ ] Add targeted tests for low-coverage paths
4. [ ] Verify all new tests pass
5. [ ] Document results in testing-gaps.md

**Exit Criteria**:
- All parser code >80% coverage
- All critical paths >90% coverage
- testing-gaps.md completed

**Estimated Duration**: 2-3 days

---

### Phase 1: Base Parser Infrastructure

**Objectives**:
1. Create BaseParser abstract class with template method pattern
2. Implement type guards for builders
3. Add processor configuration types

**Exit Criteria**:
- BaseParser compiles without errors
- All type guards implemented and testable
- Type definitions align with processor pattern

**Estimated Duration**: 3-4 days

---

### Phase 2: Convert Existing Parsers

**Objectives**:
1. Convert each parser function to class extending BaseParser
2. Implement `parseImpl()` for each parser type
3. Ensure all parsers work independently

**Exit Criteria**:
- All parser classes compile
- Each parser tested independently
- Output matches original function behavior
- All existing tests still pass

**Estimated Duration**: 4-5 days

---

### Phase 3: Parser Registry and Selection

**Objectives**:
1. Create parser registry mapping types to classes
2. Implement parser selection logic
3. Update main parseSchema function
4. Create symmetric parse API

**Exit Criteria**:
- Registry correctly maps all schema types
- Symmetric parse API available and functional
- All tests pass
- No `instanceof` checks in parsing logic

**Estimated Duration**: 2-3 days

---

### Phase 4: Post-Processor Integration

**Objectives**:
1. Add post-processor support to parseSchema options
2. Implement processor filtering logic
3. Integrate processors in BaseParser

**Exit Criteria**:
- Post-processors accepted and filtered correctly
- All tests pass
- No performance regression

**Estimated Duration**: 2-3 days

---

### Phase 5: Testing and Migration

**Objectives**:
1. Verify all existing tests pass
2. Add comprehensive parser class tests
3. Add post-processor tests

**Exit Criteria**:
- 100% test pass rate (`npm test`)
- Coverage maintained or improved
- Circular references still work

**Estimated Duration**: 2-3 days

---

### Phase 6: Documentation

**Objectives**:
1. Document new architecture
2. Provide migration guide
3. Create usage examples

**Exit Criteria**:
- Architecture clearly documented
- Examples show practical usage
- API reference complete

**Estimated Duration**: 2-3 days

---

## Verification Checklist

### Phase 0: Testing Gap Assessment
- [ ] Coverage report generated
- [ ] Identified low-coverage code
- [ ] Added tests for critical gaps
- [ ] All new tests passing
- [ ] testing-gaps.md completed

### Phase 1: Base Parser Infrastructure
- [ ] BaseParser class compiles
- [ ] All type guards implemented
- [ ] Processor types added to Types.ts
- [ ] Template method pattern clear

### Phase 2: Convert Existing Parsers
- [ ] All parser classes created
- [ ] Each parser extends BaseParser
- [ ] Output matches original function
- [ ] All existing tests still pass

### Phase 3: Parser Registry and Selection  
- [ ] Registry maps all schema types
- [ ] Parser selection works for all variations
- [ ] Symmetric parse API available
- [ ] No `instanceof` checks in parsing logic

### Phase 4: Post-Processor Integration
- [ ] Post-processors accepted in options
- [ ] Processors passed through Context
- [ ] BaseParser filters applicable processors
- [ ] No performance regression

### Phase 5: Testing and Migration
- [ ] 100% test pass rate
- [ ] Coverage maintained or improved
- [ ] All tests pass

### Phase 6: Documentation
- [ ] Architecture documented
- [ ] Migration guide created
- [ ] Examples provided

---

## Related Work

### Blocks
- **Feature 006 Post-Processing Integration**: Refactor 008 enables clean integration of the post-processing API into core parsing
- **Planned Async Processors**: Class-based architecture prerequisite for async processor support

### Enables
- **Refactor 009**: Async processor support (requires class-based architecture)
- **Feature 007**: Custom parser plugins (requires parser registry and extensibility)
- **Refactor 010**: Parser caching and optimization (requires class-based approach)

### Dependencies
- **Refactor 006**: Post-processing API concept (already completed)
- **Refactor 007**: Build factory injection (should be completed before this)

---

*Refactor spec created using `/speckit.refactor` workflow - See .specify/extensions/workflows/refactor/*
