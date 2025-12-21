# Feature Specification: Implement Missing Zod v4 Builders

**Feature Branch**: `001-zod-v4-builders`  
**Created**: 2025-12-20  
**Status**: Draft  
**Input**: User description: "Implement missing builders for zod v4 z.* types - e.g. z.function z.json z.codec, etc...."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Generate Zod Function Schema Code (Priority: P1)

Developers need to generate Zod function validation schemas from JSON schema specifications to validate function signatures, parameters, and return types in their TypeScript applications.

**Why this priority**: Function validation is a core Zod v4 feature used in API contracts, RPC systems, and function composition. Without this, developers cannot convert JSON schemas that define function signatures into Zod code, forcing manual implementation.

**Independent Test**: Can be fully tested by providing a JSON schema that describes a function signature and verifying that the generated output is valid Zod v4 function code (e.g., `z.function().args(z.string()).returns(z.number())`).

**Acceptance Scenarios**:

1. **Given** a JSON schema describing a function with typed parameters, **When** the schema is converted, **Then** the output includes `z.function()` with proper `.args()` specification
2. **Given** a JSON schema describing a function with a return type, **When** the schema is converted, **Then** the output includes `.returns()` with the correct type
3. **Given** a JSON schema describing a function with no parameters, **When** the schema is converted, **Then** the output generates `z.function().returns(...)` without args

---

### User Story 2 - Generate Zod Promise Schema Code (Priority: P1)

Developers need to generate Zod promise validation schemas to validate asynchronous operation return types, ensuring type safety for async functions and API responses.

**Why this priority**: Promises are fundamental to async JavaScript/TypeScript. Many JSON schemas describe async operations, and developers need to convert these to Zod promise schemas for runtime validation of resolved values.

**Independent Test**: Can be fully tested by providing a JSON schema describing an async operation and verifying the generated output uses `z.promise()` with the correct wrapped type.

**Acceptance Scenarios**:

1. **Given** a JSON schema describing an async operation returning a string, **When** the schema is converted, **Then** the output is `z.promise(z.string())`
2. **Given** a JSON schema describing an async operation with complex object return, **When** the schema is converted, **Then** the output wraps the object schema in `z.promise(...)`

---

### User Story 3 - Generate Zod Lazy Schema Code (Priority: P2)

Developers need to generate Zod lazy schemas for recursive or circular data structures where the schema references itself, enabling validation of tree structures, linked lists, and other recursive patterns.

**Why this priority**: While less common than functions and promises, lazy schemas are essential for recursive data structures. Without this, developers cannot convert self-referential JSON schemas to Zod code.

**Independent Test**: Can be fully tested by providing a JSON schema with $ref pointing to itself and verifying the output uses `z.lazy(() => ...)` to handle the recursion.

**Acceptance Scenarios**:

1. **Given** a JSON schema with self-reference via $ref, **When** the schema is converted, **Then** the output uses `z.lazy()` with a callback returning the schema
2. **Given** a JSON schema describing a tree node with children array, **When** the schema is converted, **Then** the output creates a lazy schema that references itself

---

### User Story 4 - Generate Zod Codec Schema Code (Priority: P2)

Developers need to generate Zod codec schemas that transform data between different representations (input vs output types), enabling bidirectional data transformations for encoding/decoding operations.

**Why this priority**: Codecs are specialized transformers used for data serialization/deserialization. While important for data pipelines, they're less commonly used than basic validation.

**Independent Test**: Can be fully tested by providing a JSON schema describing input/output transformation and verifying the output uses `z.codec()` with proper in/out type specifications.

**Acceptance Scenarios**:

1. **Given** a JSON schema describing input and output types, **When** the schema is converted, **Then** the output uses `z.codec()` with both type parameters
2. **Given** a codec schema with transformation logic, **When** the schema is converted, **Then** the output includes the encode/decode functions

---

### User Story 5 - Generate Zod Preprocess and Pipe Schema Code (Priority: P3)

Developers need to generate preprocessing and piping schemas to transform input data before validation or chain multiple validations together, enabling data normalization and multi-step validation flows.

**Why this priority**: These are advanced composition features. While useful for complex validation flows, most use cases can work with basic types and transforms. Lower priority as they're less frequently used.

**Independent Test**: Can be fully tested by providing a JSON schema with preprocessing requirements and verifying the output uses `z.preprocess()` or `.pipe()` appropriately.

**Acceptance Scenarios**:

1. **Given** a JSON schema requiring data preprocessing, **When** the schema is converted, **Then** the output uses `z.preprocess()` with the transformation function
2. **Given** a JSON schema requiring chained validations, **When** the schema is converted, **Then** the output uses `.pipe()` to chain schemas

---

### User Story 6 - Generate Zod JSON and File Schema Code (Priority: P3)

Developers need to generate schemas for JSON string validation and file upload validation, enabling type-safe handling of JSON-encoded strings and file inputs in forms and APIs.

**Why this priority**: While JSON string validation and file handling are useful, they're specialized use cases. Most applications work with parsed objects directly, making these lower priority.

**Independent Test**: Can be fully tested by providing a JSON schema for JSON strings or file uploads and verifying the output uses `z.json()` or appropriate file validation.

**Acceptance Scenarios**:

1. **Given** a JSON schema describing a JSON-encoded string, **When** the schema is converted, **Then** the output uses appropriate JSON string validation
2. **Given** a JSON schema describing file upload requirements, **When** the schema is converted, **Then** the output includes file validation constraints

---

### Edge Cases

- What happens when a function schema has variable-length arguments?
- How does the system handle promise schemas with error types?
- What happens when a lazy schema has deep recursion that could cause stack overflow?
- How does the system handle codec schemas with complex transformation logic that can't be represented in JSON schema?
- What happens when preprocessing requires async operations?
- How does the system handle JSON schemas where the structure type is ambiguous between regular schemas and these special Zod v4 types?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a FunctionBuilder class that generates `z.function()` code with support for args and returns specifications
- **FR-002**: System MUST provide a PromiseBuilder class that generates `z.promise(...)` code wrapping inner type schemas
- **FR-003**: System MUST provide a LazyBuilder class that generates `z.lazy(() => ...)` code for recursive schema definitions
- **FR-004**: System MUST provide a CodecBuilder class that generates `z.codec(...)` code with input and output type parameters
- **FR-005**: System MUST provide a PreprocessBuilder class that generates `z.preprocess(...)` code for data transformation before validation
- **FR-006**: System MUST provide a PipeBuilder class that generates schema chaining using `.pipe()` method
- **FR-007**: System MUST export all new builders from the ZodBuilder index file for use in JSON schema conversion
- **FR-008**: System MUST add factory methods to the `build` object following the existing pattern (e.g., `build.function()`, `build.promise()`, etc.)
- **FR-009**: Each builder MUST extend the BaseBuilder class to inherit common modifiers like optional, nullable, describe, etc.
- **FR-010**: System MUST provide test coverage for all new builders following the existing test pattern in newBuilders.test.ts
- **FR-011**: Generated code MUST be syntactically valid Zod v4 code that can be evaluated in a TypeScript environment
- **FR-012**: Builders MUST follow the fluent API pattern allowing method chaining (e.g., `build.function().args(...).returns(...).optional()`)

### Key Entities

- **FunctionBuilder**: Represents z.function() schemas with args array and returns type, supporting function signature validation
- **PromiseBuilder**: Represents z.promise() schemas that wrap an inner type schema for async value validation
- **LazyBuilder**: Represents z.lazy() schemas that accept a getter function returning a schema, enabling recursive structures
- **CodecBuilder**: Represents z.codec() schemas with input and output types for bidirectional transformations
- **PreprocessBuilder**: Represents z.preprocess() schemas that transform data before validation
- **PipeBuilder**: Represents schema chaining using .pipe() for multi-step validation flows

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Developers can convert JSON schemas containing function definitions to valid Zod v4 function validation code
- **SC-002**: Developers can convert JSON schemas for async operations to valid Zod v4 promise schemas
- **SC-003**: All new builders pass automated tests that verify correct Zod code generation
- **SC-004**: Generated code from new builders can be evaluated without syntax errors in a Zod v4 environment
- **SC-005**: The library supports 100% of the commonly-used Zod v4 type constructors mentioned in the issue (function, json, codec, promise, lazy, preprocess, pipe)
- **SC-006**: New builders integrate seamlessly with existing builders, allowing composition (e.g., `build.array(build.promise(build.string()))`)
- **SC-007**: Documentation exists showing how to use each new builder type (via test examples)

## Assumptions

- The JSON schema input format for these new types will follow standard patterns or require custom extensions, as JSON Schema doesn't natively represent function signatures or promises
- Zod v4 is the target version (currently 4.2.1 based on package.json)
- The conversion logic will primarily be used programmatically rather than through complex JSON schema files
- File and JSON string validation may require custom JSON schema extensions or patterns to be detected
- Function argument types and return types will be specified in JSON schema extensions or inferred from schema structure
