# Refactor 008: Parser Class Architecture - Task Breakdown

**Refactor ID**: refactor-008
**Branch**: `refactor/008-refactor-008-parser`
**Created**: 2025-12-30
**Status**: Ready for Execution

---

## Overview

This document provides a complete task breakdown for refactoring the x-to-zod parser architecture from functional to class-based implementation using the Template Method pattern. Each task follows the strict checklist format and is organized by phase for incremental delivery.

**Implementation Strategy**:
- **MVP First**: Complete Phase 0-1 to establish foundation
- **Incremental Delivery**: Each phase is independently testable
- **Parallel Opportunities**: Tasks marked [P] can run in parallel within each phase

**Total Phases**: 7 (Setup + 6 Implementation Phases)
**Estimated Timeline**: 5-6 weeks
**Task Format**: `- [ ] [TaskID] [P?] [Phase?] Description with file path`

---

## Phase 1: Setup & Initialization

**Goal**: Initialize refactor workflow, capture baseline metrics, verify branch setup

**Independent Test Criteria**:
- ✅ Branch exists and is checked out
- ✅ Baseline metrics captured
- ✅ All tests pass before starting refactor

### Tasks

- [X] T001 Verify refactor branch created at refactor/008-refactor-008-parser
- [X] T002 Verify baseline metrics captured in specs/refactor/008-refactor-008-parser/metrics-before.md
- [X] T003 Run full test suite to establish baseline (npm test)
- [X] T004 Verify all tests pass (100% pass rate required)
- [X] T005 Document current build time and dependency count

**Exit Criteria**: Branch ready, baseline captured, all tests passing

---

## Phase 2: Testing Gap Assessment (Phase 0)

**Goal**: Establish comprehensive test coverage before refactoring to ensure behavior preservation

**Independent Test Criteria**:
- ✅ Coverage report generated showing >80% parser coverage
- ✅ All critical gaps (<70% coverage) have new tests added
- ✅ testing-gaps.md document completed
- ✅ 100% test pass rate maintained

### Tasks

- [X] T006 [Phase0] Run coverage analysis: npm test -- --coverage
- [X] T007 [Phase0] Generate coverage report in specs/refactor/008-refactor-008-parser/coverage-baseline.txt
- [X] T008 [Phase0] Analyze src/JsonSchema/parsers/index.ts coverage by function
- [X] T009 [Phase0] Identify parseObject coverage percentage and gaps
- [X] T010 [Phase0] Identify parseArray coverage percentage and gaps
- [X] T011 [Phase0] Identify parseString coverage percentage and gaps
- [X] T012 [Phase0] Identify parseNumber/parseInt coverage percentage and gaps
- [X] T013 [Phase0] Identify parseBoolean coverage percentage and gaps
- [X] T014 [Phase0] Identify parseNull coverage percentage and gaps
- [X] T015 [Phase0] Identify parseAnyOf/parseOneOf/parseAllOf coverage percentage and gaps
- [X] T016 [Phase0] Categorize gaps: Critical (<70%), Important (70-85%), Nice-to-Have (>85%)
- [X] T017 [P] [Phase0] Add test for parseObject circular self-references in test/parsers/objectParser.test.ts
- [X] T018 [P] [Phase0] Add test for parseObject with additionalProperties: false in test/parsers/objectParser.test.ts
- [X] T019 [P] [Phase0] Add test for parseObject with patternProperties in test/parsers/objectParser.test.ts
- [X] T020 [P] [Phase0] Add test for parseArray tuple handling in test/parsers/arrayParser.test.ts
- [X] T021 [P] [Phase0] Add test for parseArray with minItems/maxItems in test/parsers/arrayParser.test.ts
- [X] T022 [P] [Phase0] Add test for parseString with all formats (email, uuid, datetime) in test/parsers/stringParser.test.ts
- [X] T023 [P] [Phase0] Add test for parseString with pattern/regex in test/parsers/stringParser.test.ts
- [X] T024 [P] [Phase0] Add test for parseNumber with multipleOf in test/parsers/numberParser.test.ts
- [X] T025 [P] [Phase0] Add test for parseNumber min/max constraints in test/parsers/numberParser.test.ts
- [X] T026 [Phase0] Run full test suite after adding new tests (npm test)
- [X] T027 [Phase0] Verify all new tests pass (100% pass rate)
- [X] T029 [Phase0] Create specs/refactor/008-refactor-008-parser/testing-gaps.md
- [X] T030 [Phase0] Document all identified gaps in testing-gaps.md
- [X] T031 [Phase0] Document all tests added with coverage improvement metrics
- [X] T032 [Phase0] Sign-off checklist: All critical gaps addressed, all tests passing, ready for Phase 1

**Exit Criteria**:
- ✅ All parser code >80% coverage
- ✅ All critical paths >90% coverage
- ✅ testing-gaps.md completed with sign-off
- ✅ 100% test pass rate

---

## Phase 3: Base Parser Infrastructure (Phase 1)

**Goal**: Create foundational BaseParser abstract class and supporting infrastructure (Test-First Development)

**Execution Timeline**: ~2-3 weeks

**Independent Test Criteria**:
- ✅ All BaseParser tests written FIRST (RED phase)
- ✅ BaseParser.ts compiles and passes all tests
- ✅ All type guards functional and testable
- ✅ Processor types defined and exported
- ✅ Can instantiate a mock subclass for testing
- ✅ Template method pattern verifiable

### Tasks

#### Subtask: Write BaseParser Tests FIRST (TDD - RED phase)

- [X] T033 [Phase1] Create test/JsonSchema/parsers/BaseParser.test.ts with test stubs for all BaseParser methods
- [X] T034 [Phase1] Add test for BaseParser instantiation with mock subclass in test/JsonSchema/parsers/BaseParser.test.ts
- [X] T035 [Phase1] Add test for parse() template method execution order in test/JsonSchema/parsers/BaseParser.test.ts
- [X] T036 [Phase1] Add test for applyMetadata() applying description in test/JsonSchema/parsers/BaseParser.test.ts
- [X] T037 [Phase1] Add test for applyMetadata() applying default in test/JsonSchema/parsers/BaseParser.test.ts
- [X] T038 [Phase1] Add test for filterPostProcessors() type filtering in test/JsonSchema/parsers/BaseParser.test.ts
- [X] T039 [Phase1] Verify all test stubs compile (tests will fail - RED phase)

#### Subtask: Create BaseParser Class (TDD - GREEN phase)

- [X] T040 [Phase1] Create src/JsonSchema/parsers/BaseParser.ts file with minimal implementation to pass tests
- [X] T041 [Phase1] Implement BaseParser constructor accepting schema and refs in src/JsonSchema/parsers/BaseParser.ts
- [X] T042 [Phase1] Add preProcessors and postProcessors properties to BaseParser in src/JsonSchema/parsers/BaseParser.ts
- [X] T043 [Phase1] Implement parse() template method in BaseParser in src/JsonSchema/parsers/BaseParser.ts
- [X] T044 [Phase1] Implement applyPreProcessors() method in BaseParser in src/JsonSchema/parsers/BaseParser.ts
- [X] T045 [Phase1] Define abstract parseImpl() method signature in BaseParser in src/JsonSchema/parsers/BaseParser.ts
- [X] T046 [Phase1] Implement applyPostProcessors() method in BaseParser in src/JsonSchema/parsers/BaseParser.ts
- [X] T047 [Phase1] Implement applyMetadata() method handling description and default in BaseParser in src/JsonSchema/parsers/BaseParser.ts
- [X] T048 [Phase1] Implement filterPreProcessors() method in BaseParser in src/JsonSchema/parsers/BaseParser.ts
- [X] T049 [Phase1] Implement filterPostProcessors() with type filtering in BaseParser in src/JsonSchema/parsers/BaseParser.ts
- [X] T050 [Phase1] Add isProcessorApplicable() helper method in BaseParser in src/JsonSchema/parsers/BaseParser.ts
- [X] T051 [Phase1] Add abstract canProduceType() method signature in BaseParser in src/JsonSchema/parsers/BaseParser.ts
- [X] T052 [Phase1] Implement matchesPath() for path pattern matching in BaseParser in src/JsonSchema/parsers/BaseParser.ts
- [X] T053 [Phase1] Implement createChildContext() for nested parsing in BaseParser in src/JsonSchema/parsers/BaseParser.ts
- [X] T054 [Phase1] Implement parseChild() helper for recursive parsing in BaseParser in src/JsonSchema/parsers/BaseParser.ts
- [X] T055 [Phase1] Run BaseParser tests: npm test -- test/JsonSchema/parsers/BaseParser.test.ts (all tests should pass - GREEN phase)

#### Subtask: Add Type Guards (TDD)

- [X] T056 [P] [Phase1] Write tests for all type guards in test/utils/is.test.ts (RED phase)
- [X] T057 [P] [Phase1] Add is.objectBuilder() type guard in src/utils/is.ts
- [X] T058 [P] [Phase1] Add is.arrayBuilder() type guard in src/utils/is.ts
- [X] T059 [P] [Phase1] Add is.stringBuilder() type guard in src/utils/is.ts
- [X] T060 [P] [Phase1] Add is.numberBuilder() type guard in src/utils/is.ts
- [X] T061 [P] [Phase1] Add is.booleanBuilder() type guard in src/utils/is.ts
- [X] T062 [P] [Phase1] Add is.nullBuilder() type guard in src/utils/is.ts
- [X] T063 [P] [Phase1] Add is.unionBuilder() type guard in src/utils/is.ts
- [X] T064 [P] [Phase1] Add is.intersectionBuilder() type guard in src/utils/is.ts
- [X] T065 [P] [Phase1] Add is.lazyBuilder() type guard in src/utils/is.ts
- [X] T066 [Phase1] Export all type guards from src/utils/is.ts
- [X] T067 [Phase1] Run type guard tests: npm test -- test/utils/is.test.ts (GREEN phase)
- [X] T068 [Phase1] Verify type guards compile: npm run build

#### Subtask: Add Processor Types (TDD)

- [X] T069 [P] [Phase1] Write tests for all processor types in test/Types.test.ts (RED phase)
- [X] T070 [P] [Phase1] Add PreProcessor type definition in src/Types.ts
- [X] T071 [P] [Phase1] Add PostProcessor type definition in src/Types.ts
- [X] T072 [P] [Phase1] Add PostProcessorConfig interface in src/Types.ts
- [X] T073 [P] [Phase1] Add PostProcessorContext interface in src/Types.ts
- [X] T074 [P] [Phase1] Add ProcessorConfig interface in src/Types.ts
- [X] T075 [Phase1] Extend Context interface with preProcessors field in src/Types.ts
- [X] T076 [Phase1] Extend Context interface with postProcessors field in src/Types.ts
- [X] T077 [Phase1] Export all new processor types from src/Types.ts
- [X] T078 [Phase1] Run processor type tests: npm test -- test/Types.test.ts (GREEN phase)
- [X] T079 [Phase1] Verify Types.ts compiles: npm run build

#### Subtask: Refactor & Document (TDD - REFACTOR phase)

- [X] T080 [Phase1] Add JSDoc comments to all BaseParser methods in src/JsonSchema/parsers/BaseParser.ts
- [X] T081 [Phase1] Review BaseParser for improvements and refactor if needed
- [X] T082 [Phase1] Run full test suite: npm test (verify no regressions)

**Exit Criteria**:
- ✅ All test files created with stubs (RED phase)
- ✅ BaseParser created and compiles (GREEN phase)
- ✅ All type guards implemented and tests pass
- ✅ Processor types added and tests pass
- ✅ BaseParser tests passing (100% pass rate)
- ✅ No breaking changes to existing code
- ✅ TDD cycle completed: RED → GREEN → REFACTOR

---

## Phase 4: Convert Parsers to Classes (Phase 2)

**Goal**: Convert all parser functions to class-based implementations extending BaseParser (Test-First Development)

**Execution Timeline**: ~3-4 weeks

**Execution Order**:
1. **Simple Parsers** (write tests, then implement): Boolean, Null, String, Number
2. **Complex Parsers** (after simple): Object, Array
3. **Combinator Parsers** (after complex): AnyOf, AllOf, OneOf

**Critical Note**: AnyParser is not created as a standalone parser; it serves as a fallback in selectParserClass() when no other parser matches.

**Independent Test Criteria**:
- ✅ Each parser class extends BaseParser correctly
- ✅ parseImpl() produces identical output to original function
- ✅ All existing tests still pass (100% pass rate)
- ✅ Behavioral snapshot unchanged

### Tasks

#### Subtask: String Parser

- [X] T083 [Phase2] Write test cases for StringParser in test/JsonSchema/parsers/StringParser.test.ts (RED phase)
- [X] T084 [Phase2] Create src/JsonSchema/parsers/StringParser.ts extending BaseParser
- [X] T085 [Phase2] Implement parseImpl() for string parsing in src/JsonSchema/parsers/StringParser.ts (GREEN phase)
- [X] T086 [Phase2] Implement minLength/maxLength constraints in src/JsonSchema/parsers/StringParser.ts
- [X] T087 [Phase2] Implement pattern/regex constraint in src/JsonSchema/parsers/StringParser.ts
- [X] T088 [Phase2] Implement applyFormat() for email, uuid, datetime, uri in src/JsonSchema/parsers/StringParser.ts
- [X] T089 [Phase2] Implement canProduceType() returning true for 'string'|'StringBuilder' in src/JsonSchema/parsers/StringParser.ts
- [X] T090 [Phase2] Run StringParser tests: npm test -- test/JsonSchema/parsers/StringParser.test.ts (GREEN phase)
- [X] T091 [Phase2] Verify StringParser output matches original behavior exactly
- [X] T092 [Phase2] Refactor StringParser implementation for clarity (REFACTOR phase)

#### Subtask: Number Parser

- [X] T093 [Phase2] Write test cases for NumberParser in test/JsonSchema/parsers/NumberParser.test.ts (RED phase)
- [X] T094 [Phase2] Create src/JsonSchema/parsers/NumberParser.ts extending BaseParser
- [X] T095 [Phase2] Implement parseImpl() handling both number and integer types in src/JsonSchema/parsers/NumberParser.ts (GREEN phase)
- [X] T096 [Phase2] Implement minimum/maximum constraints in src/JsonSchema/parsers/NumberParser.ts
- [X] T097 [Phase2] Implement multipleOf constraint in src/JsonSchema/parsers/NumberParser.ts
- [X] T098 [Phase2] Implement canProduceType() returning true for 'number'|'NumberBuilder' in src/JsonSchema/parsers/NumberParser.ts
- [X] T099 [Phase2] Run NumberParser tests: npm test -- test/JsonSchema/parsers/NumberParser.test.ts (GREEN phase)
- [X] T100 [Phase2] Verify NumberParser output matches original behavior exactly
- [X] T101 [Phase2] Refactor NumberParser implementation for clarity (REFACTOR phase)

#### Subtask: Boolean Parser

- [X] T102 [P] [Phase2] Write test cases for BooleanParser in test/JsonSchema/parsers/BooleanParser.test.ts (RED phase)
- [X] T103 [P] [Phase2] Create src/JsonSchema/parsers/BooleanParser.ts extending BaseParser
- [X] T104 [P] [Phase2] Implement parseImpl() returning build.boolean() in src/JsonSchema/parsers/BooleanParser.ts (GREEN phase)
- [X] T105 [P] [Phase2] Implement canProduceType() returning true for 'boolean'|'BooleanBuilder' in src/JsonSchema/parsers/BooleanParser.ts
- [X] T106 [P] [Phase2] Run BooleanParser tests: npm test -- test/JsonSchema/parsers/BooleanParser.test.ts (GREEN phase)

#### Subtask: Null Parser

- [X] T107 [P] [Phase2] Write test cases for NullParser in test/JsonSchema/parsers/NullParser.test.ts (RED phase)
- [X] T108 [P] [Phase2] Create src/JsonSchema/parsers/NullParser.ts extending BaseParser
- [X] T109 [P] [Phase2] Implement parseImpl() returning build.null() in src/JsonSchema/parsers/NullParser.ts
- [X] T110 [P] [Phase2] Implement canProduceType() returning true for 'null'|'NullBuilder' in src/JsonSchema/parsers/NullParser.ts
- [X] T111 [P] [Phase2] Run NullParser tests: npm test -- test/JsonSchema/parsers/NullParser.test.ts (GREEN phase)

#### Subtask: Object Parser

**Prerequisite**: Complete all simple parsers (Boolean, Null, String, Number) first

- [X] T112 [Phase2] Write comprehensive test cases for ObjectParser in test/JsonSchema/parsers/ObjectParser.test.ts (RED phase)
- [X] T113 [Phase2] Create src/JsonSchema/parsers/ObjectParser.ts extending BaseParser
- [X] T114 [Phase2] Implement parseImpl() iterating over properties in src/JsonSchema/parsers/ObjectParser.ts (GREEN phase)
- [X] T115 [Phase2] Implement required field handling using schema.required array in src/JsonSchema/parsers/ObjectParser.ts
- [X] T116 [Phase2] Implement optional field marking for non-required properties in src/JsonSchema/parsers/ObjectParser.ts
- [X] T117 [Phase2] Implement parseChild() calls for each property in src/JsonSchema/parsers/ObjectParser.ts
- [X] T118 [Phase2] Implement additionalProperties: false → .strict() in src/JsonSchema/parsers/ObjectParser.ts
- [X] T119 [Phase2] Implement applyPatternProperties() helper method in src/JsonSchema/parsers/ObjectParser.ts
- [X] T120 [Phase2] Implement canProduceType() returning true for 'object'|'ObjectBuilder' in src/JsonSchema/parsers/ObjectParser.ts
- [X] T121 [Phase2] Run ObjectParser tests: npm test -- test/JsonSchema/parsers/ObjectParser.test.ts (GREEN phase)
- [X] T122 [Phase2] Verify ObjectParser output matches original parseObject() exactly
- [X] T123 [Phase2] Refactor ObjectParser implementation (REFACTOR phase)

#### Subtask: Array Parser

**Prerequisite**: Complete all simple parsers first

- [X] T124 [Phase2] Write comprehensive test cases for ArrayParser in test/JsonSchema/parsers/ArrayParser.test.ts (RED phase)
- [X] T125 [Phase2] Create src/JsonSchema/parsers/ArrayParser.ts extending BaseParser
- [X] T126 [Phase2] Implement parseImpl() checking for tuple vs regular array in src/JsonSchema/parsers/ArrayParser.ts (GREEN phase)
- [X] T127 [Phase2] Implement tuple handling with build.tuple() in src/JsonSchema/parsers/ArrayParser.ts
- [X] T128 [Phase2] Implement regular array handling with build.array() in src/JsonSchema/parsers/ArrayParser.ts
- [X] T129 [Phase2] Implement minItems/maxItems constraints in src/JsonSchema/parsers/ArrayParser.ts
- [X] T130 [Phase2] Implement uniqueItems constraint handling in src/JsonSchema/parsers/ArrayParser.ts
- [X] T131 [Phase2] Implement canProduceType() returning true for 'array'|'ArrayBuilder' in src/JsonSchema/parsers/ArrayParser.ts
- [X] T132 [Phase2] Run ArrayParser tests: npm test -- test/JsonSchema/parsers/ArrayParser.test.ts (GREEN phase)
- [X] T133 [Phase2] Verify ArrayParser output matches original parseArray() exactly
- [X] T134 [Phase2] Refactor ArrayParser implementation (REFACTOR phase)

#### Subtask: AnyOf Parser (anyOf)

**Prerequisite**: Complete Object and Array parsers first (simple combinators depend on complex parsers)

- [ ] T135 [P] [Phase2] Write test cases for AnyOfParser in test/JsonSchema/parsers/AnyOfParser.test.ts (RED phase)
- [ ] T136 [P] [Phase2] Create src/JsonSchema/parsers/AnyOfParser.ts extending BaseParser
- [ ] T137 [P] [Phase2] Implement parseImpl() iterating schema.anyOf in src/JsonSchema/parsers/AnyOfParser.ts (GREEN phase)
- [ ] T138 [P] [Phase2] Implement parseChild() for each anyOf option in src/JsonSchema/parsers/AnyOfParser.ts
- [ ] T139 [P] [Phase2] Implement build.union() with all options in src/JsonSchema/parsers/AnyOfParser.ts
- [ ] T140 [P] [Phase2] Implement canProduceType() returning true for 'anyOf'|'UnionBuilder' in src/JsonSchema/parsers/AnyOfParser.ts
- [ ] T141 [P] [Phase2] Run AnyOfParser tests (GREEN phase)
- [X] T135 [P] [Phase2] Write test cases for AnyOfParser in test/JsonSchema/parsers/AnyOfParser.test.ts (RED phase)
- [X] T136 [P] [Phase2] Create src/JsonSchema/parsers/AnyOfParser.ts extending BaseParser
- [X] T137 [P] [Phase2] Implement parseImpl() iterating schema.anyOf in src/JsonSchema/parsers/AnyOfParser.ts (GREEN phase)
- [X] T138 [P] [Phase2] Implement parseChild() for each anyOf option in src/JsonSchema/parsers/AnyOfParser.ts
- [X] T139 [P] [Phase2] Implement build.union() with all options in src/JsonSchema/parsers/AnyOfParser.ts
- [X] T140 [P] [Phase2] Implement canProduceType() returning true for 'anyOf'|'UnionBuilder' in src/JsonSchema/parsers/AnyOfParser.ts
- [X] T141 [P] [Phase2] Run AnyOfParser tests (GREEN phase)

#### Subtask: AllOf Parser (allOf)

- [ ] T142 [P] [Phase2] Write test cases for AllOfParser in test/JsonSchema/parsers/AllOfParser.test.ts (RED phase)
- [ ] T143 [P] [Phase2] Create src/JsonSchema/parsers/AllOfParser.ts extending BaseParser
- [ ] T144 [P] [Phase2] Implement parseImpl() iterating schema.allOf in src/JsonSchema/parsers/AllOfParser.ts (GREEN phase)
- [ ] T145 [P] [Phase2] Implement parseChild() for each allOf option in src/JsonSchema/parsers/AllOfParser.ts
- [ ] T146 [P] [Phase2] Implement build.intersection() with all options in src/JsonSchema/parsers/AllOfParser.ts
- [ ] T147 [P] [Phase2] Implement canProduceType() returning true for 'allOf'|'IntersectionBuilder' in src/JsonSchema/parsers/AllOfParser.ts
- [ ] T148 [P] [Phase2] Run AllOfParser tests (GREEN phase)
- [X] T142 [P] [Phase2] Write test cases for AllOfParser in test/JsonSchema/parsers/AllOfParser.test.ts (RED phase)
- [X] T143 [P] [Phase2] Create src/JsonSchema/parsers/AllOfParser.ts extending BaseParser
- [X] T144 [P] [Phase2] Implement parseImpl() iterating schema.allOf in src/JsonSchema/parsers/AllOfParser.ts (GREEN phase)
- [X] T145 [P] [Phase2] Implement parseChild() for each allOf option in src/JsonSchema/parsers/AllOfParser.ts
- [X] T146 [P] [Phase2] Implement build.intersection() with all options in src/JsonSchema/parsers/AllOfParser.ts
- [X] T147 [P] [Phase2] Implement canProduceType() returning true for 'allOf'|'IntersectionBuilder' in src/JsonSchema/parsers/AllOfParser.ts
- [X] T148 [P] [Phase2] Run AllOfParser tests (GREEN phase)

#### Subtask: OneOf Parser (oneOf)

- [ ] T149 [P] [Phase2] Write test cases for OneOfParser in test/JsonSchema/parsers/OneOfParser.test.ts (RED phase)
- [ ] T150 [P] [Phase2] Create src/JsonSchema/parsers/OneOfParser.ts extending BaseParser
- [ ] T151 [P] [Phase2] Implement parseImpl() iterating schema.oneOf in src/JsonSchema/parsers/OneOfParser.ts (GREEN phase)
- [ ] T152 [P] [Phase2] Implement parseChild() for each oneOf option in src/JsonSchema/parsers/OneOfParser.ts
- [ ] T153 [P] [Phase2] Implement appropriate oneOf logic in src/JsonSchema/parsers/OneOfParser.ts
- [ ] T154 [P] [Phase2] Implement canProduceType() returning true for 'oneOf'|'OneOfBuilder' in src/JsonSchema/parsers/OneOfParser.ts
- [ ] T155 [P] [Phase2] Run OneOfParser tests (GREEN phase)
- [X] T149 [P] [Phase2] Write test cases for OneOfParser in test/JsonSchema/parsers/OneOfParser.test.ts (RED phase)
- [X] T150 [P] [Phase2] Create src/JsonSchema/parsers/OneOfParser.ts extending BaseParser
- [X] T151 [P] [Phase2] Implement parseImpl() iterating schema.oneOf in src/JsonSchema/parsers/OneOfParser.ts (GREEN phase)
- [X] T152 [P] [Phase2] Implement parseChild() for each oneOf option in src/JsonSchema/parsers/OneOfParser.ts
- [X] T153 [P] [Phase2] Implement appropriate oneOf logic in src/JsonSchema/parsers/OneOfParser.ts
- [X] T154 [P] [Phase2] Implement canProduceType() returning true for 'oneOf'|'OneOfBuilder' in src/JsonSchema/parsers/OneOfParser.ts
- [X] T155 [P] [Phase2] Run OneOfParser tests (GREEN phase)

#### Subtask: Integration Testing

- [X] T156 [Phase2] Run full test suite: npm test
- [X] T157 [Phase2] Verify 100% test pass rate (all existing tests still pass)
- [X] T158 [Phase2] Run coverage analysis: npm test -- --coverage
- [X] T159 [Phase2] Verify coverage maintained or improved from baseline
- [X] T160 [Phase2] Compare behavioral snapshot: outputs must match original functions exactly
- [X] T161 [Phase2] Document any behavioral differences (should be none) in specs/refactor/008-refactor-008-parser/phase2-validation.md

**Exit Criteria**:
- ✅ All 9 parser classes created and tested (TDD: RED → GREEN → REFACTOR)
- ✅ Each parser extends BaseParser
- ✅ Output matches original functions exactly
- ✅ 100% test pass rate
- ✅ Coverage maintained or improved
- ✅ TDD methodology followed: Tests written before implementation

---

## Phase 5: Parser Registry and Selection (Phase 3)

**Goal**: Create parser registry, implement selection logic, establish symmetric parse API

**Independent Test Criteria**:
- ✅ Registry maps all JSON Schema types to parser classes
- ✅ selectParserClass() works for all schema variations
- ✅ parseSchema() uses registry correctly
- ✅ Symmetric parse.* API available and functional
- ✅ No instanceof checks in parsing code

### Tasks

#### Subtask: Create Registry

- [ ] T155 [Phase3] Create src/JsonSchema/parsers/registry.ts file
- [ ] T156 [Phase3] Import all parser classes in src/JsonSchema/parsers/registry.ts
- [ ] T157 [Phase3] Create parserRegistry Map<string, typeof BaseParser> in src/JsonSchema/parsers/registry.ts
- [ ] T158 [Phase3] Register ObjectParser for 'object' type in src/JsonSchema/parsers/registry.ts
- [ ] T159 [Phase3] Register ArrayParser for 'array' type in src/JsonSchema/parsers/registry.ts
- [ ] T160 [Phase3] Register StringParser for 'string' type in src/JsonSchema/parsers/registry.ts
- [ ] T161 [Phase3] Register NumberParser for 'number' and 'integer' types in src/JsonSchema/parsers/registry.ts
- [ ] T162 [Phase3] Register BooleanParser for 'boolean' type in src/JsonSchema/parsers/registry.ts
- [ ] T163 [Phase3] Register NullParser for 'null' type in src/JsonSchema/parsers/registry.ts
- [ ] T164 [Phase3] Register AnyOfParser for 'anyOf' in src/JsonSchema/parsers/registry.ts
- [ ] T165 [Phase3] Register AllOfParser for 'allOf' in src/JsonSchema/parsers/registry.ts
- [ ] T166 [Phase3] Register OneOfParser for 'oneOf' in src/JsonSchema/parsers/registry.ts

#### Subtask: Selection Logic

- [ ] T167 [Phase3] Implement selectParserClass() function in src/JsonSchema/parsers/registry.ts
- [ ] T168 [Phase3] Add combinator check first (anyOf/allOf/oneOf) in selectParserClass() in src/JsonSchema/parsers/registry.ts
- [ ] T169 [Phase3] Add nullable check using its.nullable() in selectParserClass() in src/JsonSchema/parsers/registry.ts
- [ ] T170 [Phase3] Add explicit type lookup from parserRegistry in selectParserClass() in src/JsonSchema/parsers/registry.ts
- [ ] T171 [Phase3] Add type inference fallback using its.* utilities in selectParserClass() in src/JsonSchema/parsers/registry.ts
- [ ] T172 [Phase3] Add AnyParser as default fallback in selectParserClass() in src/JsonSchema/parsers/registry.ts
- [ ] T173 [Phase3] Export selectParserClass from src/JsonSchema/parsers/registry.ts

#### Subtask: Update parseSchema

- [ ] T174 [Phase3] Update parseSchema() in src/JsonSchema/parsers/index.ts
- [ ] T175 [Phase3] Import selectParserClass from registry in src/JsonSchema/parsers/index.ts
- [ ] T176 [Phase3] Replace function dispatch with selectParserClass() call in src/JsonSchema/parsers/index.ts
- [ ] T177 [Phase3] Instantiate selected parser: new ParserClass(schema, refs) in src/JsonSchema/parsers/index.ts
- [ ] T178 [Phase3] Call parser.parse() and return builder in src/JsonSchema/parsers/index.ts
- [ ] T179 [Phase3] Preserve $ref handling logic in src/JsonSchema/parsers/index.ts
- [ ] T180 [Phase3] Preserve circular reference caching with refs.seen in src/JsonSchema/parsers/index.ts
- [ ] T181 [Phase3] Preserve parserOverride handling in src/JsonSchema/parsers/index.ts

#### Subtask: Symmetric Parse API

- [ ] T182 [Phase3] Create parse object in src/JsonSchema/parsers/index.ts
- [ ] T183 [Phase3] Implement parse.schema() calling parseSchema() in src/JsonSchema/parsers/index.ts
- [ ] T184 [Phase3] Implement parse.object() instantiating ObjectParser in src/JsonSchema/parsers/index.ts
- [ ] T185 [Phase3] Implement parse.array() instantiating ArrayParser in src/JsonSchema/parsers/index.ts
- [ ] T186 [Phase3] Implement parse.string() instantiating StringParser in src/JsonSchema/parsers/index.ts
- [ ] T187 [Phase3] Implement parse.number() instantiating NumberParser in src/JsonSchema/parsers/index.ts
- [ ] T188 [Phase3] Implement parse.boolean() instantiating BooleanParser in src/JsonSchema/parsers/index.ts
- [ ] T189 [Phase3] Implement parse.null() instantiating NullParser in src/JsonSchema/parsers/index.ts
- [ ] T190 [Phase3] Implement parse.anyOf() instantiating AnyOfParser in src/JsonSchema/parsers/index.ts
- [ ] T191 [Phase3] Implement parse.allOf() instantiating AllOfParser in src/JsonSchema/parsers/index.ts
- [ ] T192 [Phase3] Export parse object from src/JsonSchema/parsers/index.ts
- [ ] T193 [Phase3] Add JSDoc comments to all parse.* methods in src/JsonSchema/parsers/index.ts

#### Subtask: Replace instanceof Checks

- [ ] T194 [Phase3] Search for all instanceof usage: grep -r "instanceof.*Builder" src/
- [ ] T195 [Phase3] Replace instanceof ObjectBuilder with is.objectBuilder() throughout src/
- [ ] T196 [Phase3] Replace instanceof ArrayBuilder with is.arrayBuilder() throughout src/
- [ ] T197 [Phase3] Replace instanceof StringBuilder with is.stringBuilder() throughout src/
- [ ] T198 [Phase3] Replace instanceof NumberBuilder with is.numberBuilder() throughout src/
- [ ] T199 [Phase3] Replace instanceof UnionBuilder with is.unionBuilder() throughout src/
- [ ] T200 [Phase3] Verify no instanceof checks remain: grep -r "instanceof.*Builder" src/ (should return nothing)

#### Subtask: Testing

- [ ] T201 [Phase3] Create test/JsonSchema/parsers/registry.test.ts
- [ ] T202 [Phase3] Add test for selectParserClass() with object schema in test/JsonSchema/parsers/registry.test.ts
- [ ] T203 [Phase3] Add test for selectParserClass() with array schema in test/JsonSchema/parsers/registry.test.ts
- [ ] T204 [Phase3] Add test for selectParserClass() with combinator schemas in test/JsonSchema/parsers/registry.test.ts
- [ ] T205 [Phase3] Add test for selectParserClass() with type inference in test/JsonSchema/parsers/registry.test.ts
- [ ] T206 [Phase3] Add test for parse.schema() usage in test/JsonSchema/parsers/index.test.ts
- [ ] T207 [Phase3] Add test for parse.object() producing ObjectBuilder in test/JsonSchema/parsers/index.test.ts
- [ ] T208 [Phase3] Add test for parse.array() producing ArrayBuilder in test/JsonSchema/parsers/index.test.ts
- [ ] T209 [Phase3] Add test verifying parse.* output matches parseSchema() output in test/JsonSchema/parsers/index.test.ts
- [ ] T210 [Phase3] Run registry tests: npm test -- test/JsonSchema/parsers/registry.test.ts
- [ ] T211 [Phase3] Run full test suite: npm test
- [ ] T212 [Phase3] Verify 100% test pass rate

**Exit Criteria**:
- ✅ Registry created and functional
- ✅ Parser selection works for all types
- ✅ parseSchema() uses registry
- ✅ Symmetric parse.* API available
- ✅ No instanceof checks remain
- ✅ All tests passing

---

## Phase 6: Post-Processor Integration (Phase 4)

**Goal**: Enable post-processor support with type and path filtering

**Independent Test Criteria**:
- ✅ jsonSchemaToZod() accepts postProcessors option
- ✅ Processors filtered by type correctly
- ✅ Processors receive correct context
- ✅ Backward compatible (no breaking changes)
- ✅ All tests pass

### Tasks

#### Subtask: Update Entry Point

- [ ] T213 [Phase4] Update JsonSchemaToZodOptions interface in src/jsonSchemaToZod.ts
- [ ] T214 [Phase4] Add postProcessors field to JsonSchemaToZodOptions in src/jsonSchemaToZod.ts
- [ ] T215 [Phase4] Add preProcessors field to JsonSchemaToZodOptions in src/jsonSchemaToZod.ts
- [ ] T216 [Phase4] Update jsonSchemaToZod() function to accept processors in src/jsonSchemaToZod.ts
- [ ] T217 [Phase4] Pass preProcessors through Context in src/jsonSchemaToZod.ts
- [ ] T218 [Phase4] Pass postProcessors through Context in src/jsonSchemaToZod.ts
- [ ] T219 [Phase4] Normalize postProcessors (function to config) in src/jsonSchemaToZod.ts
- [ ] T220 [Phase4] Verify backward compatibility: processors optional in src/jsonSchemaToZod.ts

#### Subtask: Processor Context

- [ ] T221 [Phase4] Verify BaseParser.applyPostProcessors() creates correct context in src/JsonSchema/parsers/BaseParser.ts
- [ ] T222 [Phase4] Ensure context.path includes current path in src/JsonSchema/parsers/BaseParser.ts
- [ ] T223 [Phase4] Ensure context.schema includes schema being parsed in src/JsonSchema/parsers/BaseParser.ts
- [ ] T224 [Phase4] Ensure context.build includes build functions in src/JsonSchema/parsers/BaseParser.ts

#### Subtask: Type Filtering

- [ ] T225 [Phase4] Verify filterPostProcessors() handles function form in src/JsonSchema/parsers/BaseParser.ts
- [ ] T226 [Phase4] Verify filterPostProcessors() handles config form in src/JsonSchema/parsers/BaseParser.ts
- [ ] T227 [Phase4] Verify filterPostProcessors() filters by typeFilter in src/JsonSchema/parsers/BaseParser.ts
- [ ] T228 [Phase4] Verify filterPostProcessors() handles array of types in src/JsonSchema/parsers/BaseParser.ts
- [ ] T229 [Phase4] Verify canProduceType() implemented in all parser classes
- [ ] T230 [Phase4] Test type filtering: ObjectBuilder processors only apply to objects

#### Subtask: Testing

- [ ] T231 [Phase4] Create test/postProcessors.test.ts
- [ ] T232 [Phase4] Add test: basic processor application in test/postProcessors.test.ts
- [ ] T233 [Phase4] Add test: processor receives correct context in test/postProcessors.test.ts
- [ ] T234 [Phase4] Add test: type filtering with ObjectBuilder in test/postProcessors.test.ts
- [ ] T235 [Phase4] Add test: type filtering with ArrayBuilder in test/postProcessors.test.ts
- [ ] T236 [Phase4] Add test: multiple processors applied in order in test/postProcessors.test.ts
- [ ] T237 [Phase4] Add test: processor returning undefined preserves builder in test/postProcessors.test.ts
- [ ] T238 [Phase4] Add test: strictify all objects processor example in test/postProcessors.test.ts
- [ ] T239 [Phase4] Add test: nonempty arrays processor example in test/postProcessors.test.ts
- [ ] T240 [Phase4] Add test: path-based filtering (if implemented) in test/postProcessors.test.ts
- [ ] T241 [Phase4] Run processor tests: npm test -- test/postProcessors.test.ts
- [ ] T242 [Phase4] Verify all processor tests pass

#### Subtask: Backward Compatibility Verification

- [ ] T243 [Phase4] Run full test suite without processors: npm test
- [ ] T244 [Phase4] Verify 100% test pass rate (all existing tests pass)
- [ ] T245 [Phase4] Test jsonSchemaToZod() without postProcessors option (should work as before)
- [ ] T246 [Phase4] Compare output with/without processors (no processors = original behavior)
- [ ] T247 [Phase4] Run performance benchmark to check for regression
- [ ] T248 [Phase4] Document performance results in specs/refactor/008-refactor-008-parser/phase4-performance.md

**Exit Criteria**:
- ✅ jsonSchemaToZod() accepts processors
- ✅ Type filtering works correctly
- ✅ Processor context provided
- ✅ Backward compatible
- ✅ All tests pass
- ✅ No performance regression

---

## Phase 7: Testing and Validation (Phase 5)

**Goal**: Comprehensive validation of behavior preservation and test coverage

**Independent Test Criteria**:
- ✅ 100% test pass rate
- ✅ Coverage maintained or improved from baseline
- ✅ Behavioral snapshot matches exactly
- ✅ Circular references work correctly
- ✅ No observable differences

### Tasks

#### Subtask: Full Test Suite

- [ ] T249 [Phase5] Run complete test suite: npm test
- [ ] T250 [Phase5] Verify 100% pass rate (no failures, no skipped)
- [ ] T251 [Phase5] Document test results in specs/refactor/008-refactor-008-parser/test-results.md
- [ ] T252 [Phase5] Run tests multiple times to check for flakiness: npm test (run 3x)
- [ ] T253 [Phase5] Verify no test timeouts or instability

#### Subtask: Coverage Analysis

- [ ] T254 [Phase5] Run coverage analysis: npm test -- --coverage
- [ ] T255 [Phase5] Generate coverage report in specs/refactor/008-refactor-008-parser/coverage-after.txt
- [ ] T256 [Phase5] Compare coverage-after.txt to coverage-baseline.txt
- [ ] T257 [Phase5] Verify coverage >= baseline for all files
- [ ] T258 [Phase5] Verify parser code >80% coverage
- [ ] T259 [Phase5] Verify critical paths >90% coverage
- [ ] T260 [Phase5] Document coverage comparison in specs/refactor/008-refactor-008-parser/coverage-comparison.md

#### Subtask: Behavioral Snapshot Validation

- [ ] T261 [Phase5] Load specs/refactor/008-refactor-008-parser/behavioral-snapshot.md
- [ ] T262 [Phase5] Test Category 1: Basic type parsing (string, number, boolean, null)
- [ ] T263 [Phase5] Verify string schema output identical to original
- [ ] T264 [Phase5] Verify number schema output identical to original
- [ ] T265 [Phase5] Verify boolean schema output identical to original
- [ ] T266 [Phase5] Verify null schema output identical to original
- [ ] T267 [Phase5] Test Category 2: Object schema parsing
- [ ] T268 [Phase5] Verify object with required fields output identical
- [ ] T269 [Phase5] Verify object with optional fields output identical
- [ ] T270 [Phase5] Verify object with additionalProperties: false output identical
- [ ] T271 [Phase5] Test Category 3: Array schema parsing
- [ ] T272 [Phase5] Verify simple array output identical
- [ ] T273 [Phase5] Verify tuple array output identical
- [ ] T274 [Phase5] Verify array with minItems/maxItems output identical
- [ ] T275 [Phase5] Test Category 4: Circular references
- [ ] T276 [Phase5] Verify self-referencing schema uses z.lazy() correctly
- [ ] T277 [Phase5] Verify mutual references handled correctly
- [ ] T278 [Phase5] Verify no infinite recursion occurs
- [ ] T279 [Phase5] Test Category 5: Metadata application
- [ ] T280 [Phase5] Verify description metadata applied correctly
- [ ] T281 [Phase5] Verify default metadata applied correctly
- [ ] T282 [Phase5] Test Category 6: Combinators (anyOf, allOf, oneOf)
- [ ] T283 [Phase5] Verify anyOf produces correct union
- [ ] T284 [Phase5] Verify allOf produces correct intersection
- [ ] T285 [Phase5] Verify oneOf produces correct xor logic
- [ ] T286 [Phase5] Test Category 7-10: Formats, constraints, enums
- [ ] T287 [Phase5] Verify all format constraints (email, uuid, datetime) identical
- [ ] T288 [Phase5] Verify all string constraints (minLength, maxLength, pattern) identical
- [ ] T289 [Phase5] Verify all number constraints (min, max, multipleOf) identical
- [ ] T290 [Phase5] Verify enum/const handling identical
- [ ] T291 [Phase5] Document behavioral validation results in specs/refactor/008-refactor-008-parser/behavioral-validation.md

#### Subtask: Integration Testing

- [ ] T292 [Phase5] Create test/integration/complexSchemas.test.ts
- [ ] T293 [Phase5] Add test for deeply nested object/array schemas in test/integration/complexSchemas.test.ts
- [ ] T294 [Phase5] Add test for mixed combinators (anyOf + allOf) in test/integration/complexSchemas.test.ts
- [ ] T295 [Phase5] Add test for schema with all constraint types in test/integration/complexSchemas.test.ts
- [ ] T296 [Phase5] Add test for real-world OpenAPI schema example in test/integration/complexSchemas.test.ts
- [ ] T297 [Phase5] Run integration tests: npm test -- test/integration/complexSchemas.test.ts
- [ ] T298 [Phase5] Verify all integration tests pass

#### Subtask: Performance Validation

- [ ] T299 [Phase5] Capture current build time: time npm run build
- [ ] T300 [Phase5] Compare to baseline build time from metrics-before.md
- [ ] T301 [Phase5] Verify build time within ±5% of baseline
- [ ] T302 [Phase5] Run performance test on large schema (1000+ fields)
- [ ] T303 [Phase5] Compare parsing time to baseline (should be equivalent)
- [ ] T304 [Phase5] Document performance results in specs/refactor/008-refactor-008-parser/performance-validation.md

#### Subtask: Final Validation Checklist

- [ ] T305 [Phase5] Create specs/refactor/008-refactor-008-parser/final-validation.md
- [ ] T306 [Phase5] Complete validation checklist: Coverage maintained ✅
- [ ] T307 [Phase5] Complete validation checklist: All tests pass ✅
- [ ] T308 [Phase5] Complete validation checklist: Performance maintained ✅
- [ ] T309 [Phase5] Complete validation checklist: Behavior identical ✅
- [ ] T310 [Phase5] Complete validation checklist: No breaking changes ✅
- [ ] T311 [Phase5] Sign-off: Ready for Phase 6 (Documentation)

**Exit Criteria**:
- ✅ 100% test pass rate
- ✅ Coverage >= baseline
- ✅ Behavioral snapshot matches
- ✅ No performance regression
- ✅ Final validation signed off

---

## Phase 8: Documentation (Phase 6)

**Goal**: Comprehensive documentation for architecture, API, and migration

**Independent Test Criteria**:
- ✅ Architecture documentation complete and clear
- ✅ Post-processing guide with examples
- ✅ Migration guide for contributors
- ✅ API reference accurate
- ✅ README updated

### Tasks

#### Subtask: Architecture Documentation

- [ ] T312 [P] [Phase6] Create docs/parser-architecture.md
- [ ] T313 [P] [Phase6] Document class hierarchy diagram in docs/parser-architecture.md
- [ ] T314 [P] [Phase6] Document BaseParser template method pattern in docs/parser-architecture.md
- [ ] T315 [P] [Phase6] Document parser selection algorithm in docs/parser-architecture.md
- [ ] T316 [P] [Phase6] Document type guards usage in docs/parser-architecture.md
- [ ] T317 [P] [Phase6] Document symmetric parse API in docs/parser-architecture.md
- [ ] T318 [P] [Phase6] Add guide for adding new parser classes in docs/parser-architecture.md
- [ ] T319 [P] [Phase6] Add code examples for each concept in docs/parser-architecture.md

#### Subtask: Post-Processing Guide

- [ ] T320 [P] [Phase6] Create docs/post-processing.md
- [ ] T321 [P] [Phase6] Document post-processor concept and use cases in docs/post-processing.md
- [ ] T322 [P] [Phase6] Document PostProcessorContext interface in docs/post-processing.md
- [ ] T323 [P] [Phase6] Document type filtering with examples in docs/post-processing.md
- [ ] T324 [P] [Phase6] Document path filtering (if implemented) in docs/post-processing.md
- [ ] T325 [P] [Phase6] Add example: Make all objects strict in docs/post-processing.md
- [ ] T326 [P] [Phase6] Add example: Add lowercase to email fields in docs/post-processing.md
- [ ] T327 [P] [Phase6] Add example: Require non-empty arrays in docs/post-processing.md
- [ ] T328 [P] [Phase6] Add example: Custom validation messages in docs/post-processing.md

#### Subtask: Migration Guide

- [ ] T329 [P] [Phase6] Create docs/migration-parser-classes.md
- [ ] T330 [P] [Phase6] Document user-facing changes (none) in docs/migration-parser-classes.md
- [ ] T331 [P] [Phase6] Document contributor changes (function → class) in docs/migration-parser-classes.md
- [ ] T332 [P] [Phase6] Add before/after comparison table in docs/migration-parser-classes.md
- [ ] T333 [P] [Phase6] Document backward compatibility guarantees in docs/migration-parser-classes.md
- [ ] T334 [P] [Phase6] Add examples of extending parsers in docs/migration-parser-classes.md

#### Subtask: API Reference

- [ ] T335 [P] [Phase6] Create or update docs/API.md
- [ ] T336 [P] [Phase6] Document BaseParser class and methods in docs/API.md
- [ ] T337 [P] [Phase6] Document all concrete parser classes in docs/API.md
- [ ] T338 [P] [Phase6] Document parseSchema() function in docs/API.md
- [ ] T339 [P] [Phase6] Document selectParserClass() function in docs/API.md
- [ ] T340 [P] [Phase6] Document parse object (parse.schema, parse.object, etc.) in docs/API.md
- [ ] T341 [P] [Phase6] Document PostProcessor and PreProcessor types in docs/API.md
- [ ] T342 [P] [Phase6] Document type guards (is.objectBuilder, etc.) in docs/API.md
- [ ] T343 [P] [Phase6] Add code examples for each API element in docs/API.md

#### Subtask: README Updates

- [ ] T344 [Phase6] Update README.md with post-processing section
- [ ] T345 [Phase6] Add link to docs/post-processing.md in README.md
- [ ] T346 [Phase6] Add basic post-processor example in README.md
- [ ] T347 [Phase6] Update feature list to include post-processing in README.md
- [ ] T348 [Phase6] Verify all README links work correctly

#### Subtask: JSDoc Updates

- [ ] T349 [Phase6] Add comprehensive JSDoc to BaseParser in src/JsonSchema/parsers/BaseParser.ts
- [ ] T350 [Phase6] Add JSDoc to all parser classes
- [ ] T351 [Phase6] Add JSDoc to registry.ts functions
- [ ] T352 [Phase6] Add JSDoc examples to parse object methods
- [ ] T353 [Phase6] Add JSDoc to type guard functions in src/utils/is.ts
- [ ] T354 [Phase6] Verify JSDoc renders correctly in IDE tooltips

#### Subtask: Documentation Review

- [ ] T355 [Phase6] Review all documentation for clarity and completeness
- [ ] T356 [Phase6] Test all code examples in documentation (copy-paste and run)
- [ ] T357 [Phase6] Verify all cross-references and links work
- [ ] T358 [Phase6] Spell-check all documentation files
- [ ] T359 [Phase6] Get peer review of documentation
- [ ] T360 [Phase6] Address review feedback and finalize

**Exit Criteria**:
- ✅ Architecture docs complete
- ✅ Post-processing guide complete
- ✅ Migration guide complete
- ✅ API reference complete
- ✅ README updated
- ✅ All documentation reviewed

---

## Dependencies and Parallel Execution

### Phase Dependencies (Sequential)

```
Phase 1 (Setup)
  → Phase 2 (Phase 0: Testing Gaps)
    → Phase 3 (Phase 1: Infrastructure)
      → Phase 4 (Phase 2: Convert Parsers)
        → Phase 5 (Phase 3: Registry)
          → Phase 6 (Phase 4: Post-processors)
            → Phase 7 (Phase 5: Validation)
              → Phase 8 (Phase 6: Documentation)
```

### Parallel Opportunities Within Phases

**Phase 2 (Testing Gaps)**: Tasks T017-T025 can run in parallel (adding tests for different parsers)

**Phase 3 (Infrastructure)**:
- Type guards (T050-T059) can run in parallel
- Processor types (T061-T068) can run in parallel
- Can work on BaseParser, type guards, and processor types simultaneously

**Phase 4 (Convert Parsers)**:
- Boolean/Null parsers (T097-T104) can run in parallel (simple parsers)
- Union/Intersection/Xor parsers (T131-T148) can run in parallel after object/array complete

**Phase 8 (Documentation)**: Tasks T312-T343 can run in parallel (different documentation files)

---

## Success Metrics Summary

| Metric | Target | Measurement Point |
|--------|--------|------------------|
| Code Duplication | 0 lines duplicated logic | Phase 7 (T260) |
| Test Pass Rate | 100% | Phase 7 (T249) |
| Test Coverage | Maintained or improved | Phase 7 (T254-T260) |
| Behavioral Changes | 0 differences | Phase 7 (T261-T291) |
| Build Time Regression | ±5% of baseline | Phase 7 (T299-T304) |
| instanceof Checks | 0 in parsing code | Phase 5 (T200) |
| Documentation Complete | All docs written + reviewed | Phase 8 (T355-T360) |

---

## Rollback Plan

If critical issues discovered at any phase:

1. **Immediate**: `git reset --hard HEAD~1` (rollback last commit)
2. **Tagged**: `git reset --hard pre-refactor-008` (full rollback)
3. **Selective**: Cherry-pick working commits, discard broken phase
4. **RTO**: <15 minutes for complete rollback

---

## Sign-Off Checklist

### Phase Completion Sign-Off

- [ ] **Phase 1**: Setup - Tasks T001-T005 complete
- [ ] **Phase 2**: Testing Gaps - Tasks T006-T032 complete
- [ ] **Phase 3**: Infrastructure - Tasks T033-T077 complete
- [ ] **Phase 4**: Convert Parsers - Tasks T078-T154 complete
- [ ] **Phase 5**: Registry & API - Tasks T155-T212 complete
- [ ] **Phase 6**: Post-processors - Tasks T213-T248 complete
- [ ] **Phase 7**: Validation - Tasks T249-T311 complete
- [ ] **Phase 8**: Documentation - Tasks T312-T360 complete

### Final Refactor Sign-Off

- [ ] All 360 tasks completed
- [ ] All tests passing (100% pass rate)
- [ ] Coverage maintained or improved
- [ ] Behavioral snapshot matches exactly
- [ ] Documentation complete and reviewed
- [ ] Ready to merge to master

**Approved by**: _____________________
**Date**: _____________________

---

*Task breakdown for Refactor 008: Parser Class Architecture with Integrated Post-Processing*
*Total Tasks: 360*
*Created: 2025-12-30*
*Version: 1.0*
