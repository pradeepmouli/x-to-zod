# Testing Gap Assessment: Refactor 009 - Parser/Builder API Symmetry

**Status**: 🔴 CRITICAL FIRST STEP - Must complete before baseline
**Refactor ID**: refactor-009
**Created**: 2026-02-15

## Overview

This document identifies testing gaps that MUST be addressed before capturing baseline metrics. The refactoring will add new parser methods and classes to the public API, requiring comprehensive test coverage to validate behavior preservation.

## Code Areas to be Modified

### 1. Parser API Entry Point
**File**: `src/JsonSchema/parsers/index.ts` (Lines 28-177)
**Modification**: ADD new parser methods

**Current Coverage**: TBD | **Target**: > 95%

**Current Tests**:
- [ ] Assess: Do tests exist for existing 9 parser methods?
- [ ] Assess: Do tests cover instantiation and .parse() behavior?
- [ ] Assess: Do tests cover integration with parseSchema?

**Gaps to Fill**:
- [ ] Add tests for existing methods if missing (object, array, string, number, boolean, null, anyOf, allOf, oneOf)
- [ ] Add tests for new parse.enum() method
- [ ] Add tests for new parse.const() method
- [ ] Add tests for new parse.tuple() method
- [ ] Add tests for new parse.union(), parse.intersection(), parse.discriminatedUnion() methods
- [ ] Add tests for new parse.any(), parse.unknown(), parse.never() methods

### 2. New Parser Classes (CRITICAL - P0)
**Files** (NEW):
- `src/JsonSchema/parsers/EnumParser.ts`
- `src/JsonSchema/parsers/ConstParser.ts`
- `src/JsonSchema/parsers/TupleParser.ts`

**Current Coverage**: 0% | **Target**: > 90%

**Gaps to Fill - EnumParser**:
- [ ] Test enum with string values
- [ ] Test enum with number values
- [ ] Test enum with mixed values
- [ ] Test generated Zod code correctness

**Gaps to Fill - ConstParser**:
- [ ] Test const with string, number, boolean, null values
- [ ] Test generated Zod code correctness

**Gaps to Fill - TupleParser**:
- [ ] Test tuple with prefixItems (JSON Schema 2020-12)
- [ ] Test tuple with items array (draft-07)
- [ ] Test tuple with different item types
- [ ] Test generated Zod code correctness

### 3. Main JsonSchema Export
**File**: `src/JsonSchema/index.ts` (Lines 41-60)
**Modification**: RENAME methods (parse.Schema → parse.schema)

**Gaps to Fill**:
- [ ] Test parse.schema (lowercase) works
- [ ] Test parse.Schema (deprecated alias) still works
- [ ] Test parse.ref (lowercase) works

### 4. Parser Registry
**File**: `src/JsonSchema/parsers/registry.ts`
**Modification**: ADD new parser class registrations

**Gaps to Fill**:
- [ ] Test selectParserClass returns EnumParser for enum schemas
- [ ] Test selectParserClass returns ConstParser for const schemas
- [ ] Test selectParserClass returns TupleParser for tuple schemas

## Critical Gaps Summary

### 🔴 Must Address Before Baseline (P0)

1. **New Parser Classes** (2 days)
   - Create comprehensive test suites for EnumParser, ConstParser, TupleParser
   - Target: > 90% coverage each
   - **Blocking**: Cannot proceed without these

2. **Parser API Methods** (1 day)
   - Assess coverage for existing 9 methods
   - Add tests if < 90%
   - **Blocking**: Must verify behavior preservation

3. **Registry Integration** (1 day)
   - Add tests for new parser registration
   - Verify selectParserClass works correctly
   - **Blocking**: Critical for runtime behavior

### 🟡 Important (P1)

4. **Naming Aliases** (0.5 days)
   - Test deprecated aliases (parse.Schema, parse.Ref)
   - Test new names (parse.schema, parse.ref)
   - **Important**: Backward compatibility

### 🟢 Nice to Have (P2)

5. **Edge Cases**
   - Review during new test creation
   - Not blocking baseline

## Test Files to Create

### New Test Files Required
- [ ] `test/JsonSchema/parsers/EnumParser.test.ts`
- [ ] `test/JsonSchema/parsers/ConstParser.test.ts`
- [ ] `test/JsonSchema/parsers/TupleParser.test.ts`
- [ ] `test/parsers/api-symmetry.test.ts`

### Files to Review
- [ ] `test/parsers/*.test.ts` - Review coverage of existing parser methods
- [ ] `test/JsonSchema/parseSchema.test.ts` - Add integration tests

## Acceptance Criteria

Before proceeding to baseline capture:

- [ ] All existing parser methods have > 90% test coverage
- [ ] All new parser classes have > 90% test coverage
- [ ] All new parser API methods have tests
- [ ] Integration tests verify parseSchema works with new parsers
- [ ] Naming alias tests verify backward compatibility
- [ ] All new tests pass (100% pass rate)
- [ ] Coverage report shows no critical gaps in affected code

## Action Plan

### Step 1: Assess Current Coverage (1 day)
Run coverage report and document findings:
```bash
pnpm test --coverage
```

### Step 2: Create New Parser Tests (2 days)
Write comprehensive tests for new parser classes

### Step 3: Add Integration Tests (1 day)
Create api-symmetry.test.ts and add integration tests

### Step 4: Validate (0.5 days)
Verify all acceptance criteria met

**Total Time**: 4.5 days

## Notes

**Why This Matters**: Adding new parser classes without tests means we cannot validate correctness or behavior preservation during refactoring.

**Test-First Approach**: Consider TDD - write tests before implementing parsers.

---

**Status Updates**:
- [ ] Initial assessment complete (date: _____)
- [ ] Critical gaps identified (date: _____)
- [ ] Tests added (date: _____)
- [ ] All tests passing (date: _____)
- [ ] Ready for baseline (date: _____)

These gaps prevent us from validating behavior preservation:

1. **Gap 1**: `[FunctionName]` has no tests for [critical behavior]
   - **Impact**: Cannot verify [behavior X] is preserved after refactoring
   - **Priority**: 🔴 Critical
   - **Estimated effort**: [X hours/days]

2. **Gap 2**: `[ClassName]` error handling not tested
   - **Impact**: Cannot verify errors are handled correctly post-refactor
   - **Priority**: 🔴 Critical
   - **Estimated effort**: [X hours/days]

### Important Gaps (SHOULD fix before baseline)
These gaps reduce confidence but don't block refactoring:

1. **Gap 3**: Edge case [scenario] not tested
   - **Impact**: Lower confidence in edge case handling
   - **Priority**: 🟡 Important
   - **Estimated effort**: [X hours/days]

### Nice-to-Have Gaps (CAN be deferred)
These can be addressed later:

1. **Gap 4**: Integration test for [scenario]
   - **Impact**: Minimal - covered by unit tests
   - **Priority**: 🟢 Nice-to-have
   - **Can be deferred**: Yes

---

## Test Addition Plan

### Tests to Add Before Baseline

**Total Estimated Effort**: [X hours/days]

#### Test Suite 1: `[test-file.spec.ts]`
**Purpose**: Cover critical functionality in `[target-file.ts]`

**New Test Cases**:
1. ✅ Test: `[test name]` - covers happy path for `functionName()`
   - Input: `[specific input]`
   - Expected: `[specific output/behavior]`
   - Status: [ ] Not Started [ ] In Progress [ ] Complete

2. ✅ Test: `[test name]` - covers error handling
   - Input: `[invalid input]`
   - Expected: `[error thrown/handled correctly]`
   - Status: [ ] Not Started [ ] In Progress [ ] Complete

3. ✅ Test: `[test name]` - covers edge case
   - Input: `[edge case input]`
   - Expected: `[expected behavior]`
   - Status: [ ] Not Started [ ] In Progress [ ] Complete

#### Test Suite 2: `[another-test-file.spec.ts]`
**Purpose**: Cover integration between components

**New Test Cases**:
1. ✅ Test: `[integration test name]`
   - Scenario: `[describe interaction]`
   - Expected: `[expected outcome]`
   - Status: [ ] Not Started [ ] In Progress [ ] Complete

---

## Test Implementation Checklist

### Pre-Work
- [ ] Review existing test infrastructure
- [ ] Identify test frameworks and patterns in use
- [ ] Set up test environment if needed

### Test Writing
- [ ] Write tests for Critical Gap 1
- [ ] Write tests for Critical Gap 2
- [ ] Write tests for Important Gaps (if time permits)
- [ ] Ensure all new tests pass
- [ ] Verify tests actually test behavior (not implementation)

### Validation
- [ ] Run full test suite - all tests pass
- [ ] Verify coverage increased in affected areas
- [ ] Review tests with team/peer
- [ ] Commit tests separately from refactoring

### Ready for Baseline
- [ ] All critical gaps addressed
- [ ] All new tests passing
- [ ] Coverage metrics show improvement
- [ ] Behavioral snapshot can now be validated

---

## Decision: Proceed or Delay Refactoring?

### If Critical Gaps Found
- [ ] **STOP**: Do NOT proceed with refactoring until tests are added
- [ ] Add tests first, THEN return to refactor workflow
- [ ] Update this document as tests are added

### If No Critical Gaps or All Gaps Addressed
- [ ] **PROCEED**: Ready to capture baseline metrics
- [ ] Mark status as "Ready for Baseline"
- [ ] Continue to Phase 1: Baseline Capture

---

## Notes

**Date Assessed**: [YYYY-MM-DD]
**Assessed By**: [Name or AI Agent]
**Test Framework**: [Jest/Mocha/Pytest/etc.]
**Coverage Tool**: [Istanbul/Coverage.py/etc.]

**Additional Context**:
[Any other relevant information about testing gaps or decisions made]

---

*This testing gaps assessment is part of the enhanced refactor workflow. Complete this BEFORE running `measure-metrics.sh --before`.*
