# Feature Specification: Multi-Schema Projects

**Feature Branch**: `004-multi-schema-projects`
**Created**: 2026-01-07
**Status**: Draft
**Input**: Add support for multi-schema projects that can convert multiple JSON Schema files into a coordinated TypeScript/JavaScript project with proper imports, exports, and cross-schema references

## User Scenarios & Testing

### User Story 1 - Convert OpenAPI Components to Coordinated Schemas (Priority: P1)

An API developer has an OpenAPI specification with components (User, Post, Comment, etc.) and wants to generate individual Zod validators that properly reference each other without manual import management.

**Why this priority**: This is the core use case that solves the immediate user pain point—managing multiple related JSON Schemas. OpenAPI with component schemas is a common, high-value pattern.

**Independent Test**: Can fully test by converting an OpenAPI spec with 3+ component schemas and verifying that:
- Each schema generates its own file
- Cross-schema references (e.g., Post referencing User) create automatic imports
- Index file exports all schemas
- Generated code compiles without manual editing

**Acceptance Scenarios**:

1. **Given** an OpenAPI spec with User, Post, and Comment components, **When** user adds all three schemas to a SchemaProject and calls `build()`, **Then** three separate .ts files are created with proper imports (Post imports User, Comment imports both)
2. **Given** a SchemaProject with multiple schemas, **When** user runs `project.validate()`, **Then** system detects missing references or circular dependencies
3. **Given** generated files, **When** user imports from the generated index file, **Then** all schemas are available without knowing internal structure

---

### User Story 2 - Domain-Driven Design with Shared Types (Priority: P2)

A developer organizing code by domain wants to have a shared "common" schema (IDs, timestamps) and separate domain schemas (users, posts) that all reference the common types.

**Why this priority**: Enables clean architectural separation and promotes reusability across multiple domains—high value for larger projects.

**Independent Test**: Can fully test by:
- Creating a common/types schema with ID and Timestamp types
- Creating domain schemas that reference the common types
- Verifying dependency graph shows correct order
- Confirming generated files have correct import paths

**Acceptance Scenarios**:

1. **Given** common/types with basic types and user/schema referencing them, **When** project builds, **Then** user/schema.ts imports from ../common/types
2. **Given** circular references (A → B → A), **When** user calls `validate()`, **Then** system identifies and reports the cycle
3. **Given** post-processing rules, **When** project applies transformations, **Then** all files are transformed consistently

---

### User Story 3 - Multi-Package Monorepo Support (Priority: P3)

A monorepo developer needs to generate separate Zod schema projects for different packages (auth-schemas, api-schemas, shared-schemas) with independent outputs.

**Why this priority**: Important for larger organizations but less critical than core multi-schema functionality.

**Independent Test**: Can fully test by:
- Creating multiple SchemaProject instances for different directories
- Generating output for each independently
- Verifying no file conflicts or cross-contamination

**Acceptance Scenarios**:

1. **Given** configuration with multiple projects defined, **When** CLI runs with project selection, **Then** correct package's schemas are generated to correct output directory
2. **Given** each project in its own SchemaProject, **When** all are built, **Then** output files are isolated per project

---

### User Story 4 - Watch Mode for Development (Priority: P3)

A developer wants automatic rebuilding when schema files change during local development without manual rerun.

**Why this priority**: Nice-to-have for ergonomics but not essential to MVP functionality.

**Independent Test**: Can fully test by:
- Enabling watch mode
- Modifying a schema file
- Verifying build completes automatically and files update

**Acceptance Scenarios**:

1. **Given** watch mode enabled, **When** developer modifies a schema file, **Then** project rebuilds automatically within 1 second
2. **Given** rebuild completes, **When** output files are checked, **Then** changes are reflected

---

### Edge Cases

- **What happens when two schemas have the same export name?** → System detects during validation phase and fails with clear error message identifying the conflicting schemas; user must rename one or more schemas to resolve
- **How does the system handle circular $ref dependencies across files?** → System detects cycles, reports them with warning, but generates lazy builders/type-only imports to allow build to succeed and unblock users
- **What occurs if a $ref points to a non-existent schema?** → Build succeeds with placeholder type (`z.unknown()`) for missing reference; warning is logged listing all unresolved $refs so user can address them
- How are nested schemas (definitions within a schema) organized in the output?
- What happens when post-processors conflict or produce invalid output?
- How does the system handle remote schema URLs in $refs?

## Requirements

### Functional Requirements

- **FR-001**: System MUST accept multiple JSON Schema objects or files through `addSchema()` and `addSchemaFromFile()` methods
- **FR-002**: System MUST resolve $ref references both within a schema (internal) and across schemas (external)
- **FR-002a**: System MUST handle unresolved $refs by generating placeholder validators (`z.unknown()`) and logging warnings with lists of unresolved references
- **FR-003**: System MUST generate individual TypeScript source files for each schema with proper exports
- **FR-004**: System MUST automatically generate import statements for cross-schema references using correct relative paths
- **FR-005**: System MUST generate an index file that re-exports all schema validators for convenient importing
- **FR-006**: System MUST build schemas in dependency order (schemas with no dependencies first)
- **FR-007**: System MUST detect and report circular dependencies before attempting to build
- **FR-007a**: System MUST generate lazy builders for circular $ref patterns and use type-only imports where appropriate to allow build completion even with cycles
- **FR-008**: System MUST provide a dependency graph API that shows which schemas depend on which others
- **FR-009**: System MUST validate all schemas before building and report validation errors clearly
- **FR-009a**: System MUST detect export name conflicts and fail validation with specific error identifying conflicting schema IDs and their derived export names
- **FR-010**: System MUST support both CommonJS and ESM module formats in output
- **FR-010a**: System MUST emit dual-format outputs to dist/esm and dist/cjs directories using separate TypeScript configurations and post-build scripts (consistent with existing postcjs.js/postesm.js pattern)
- **FR-011**: System MUST support post-processing at the individual schema level
- **FR-012**: System MUST provide a programmatic API (SchemaProject class) and a CLI interface
- **FR-013**: System MUST use ts-morph for managing source files to ensure proper TypeScript integration
- **FR-014**: System MUST handle name resolution (converting schema IDs to valid JavaScript export names)
- **FR-015**: System MUST support custom reference resolvers for non-standard $ref patterns

### Key Entities

- **Schema**: A JSON Schema object identified by a unique ID, possibly from a file
- **SchemaEntry**: Represents a loaded schema in the project including its ID, content, parsed builder, and source file
- **RefResolution**: Result of resolving a $ref, including the target schema, extracted path, and whether it's internal or external
- **DependencyGraph**: Graph showing which schemas depend on which others, used for topological sorting and cycle detection
- **ImportInfo**: Metadata about what needs to be imported from another file (export name, import kind, module path)
- **NameResolver**: Strategy for converting schema IDs/paths to valid TypeScript export names

## Success Criteria

### Measurable Outcomes

- **SC-001**: Can convert OpenAPI spec with 10+ component schemas in under 5 seconds
- **SC-002**: Generated code for any multi-schema project compiles without errors (using TypeScript compiler)
- **SC-003**: 95%+ of common JSON Schema patterns (properties, definitions, $ref, etc.) are correctly converted with proper cross-references
- **SC-004**: Dependency graph correctly identifies all dependencies and detects 100% of circular dependency cases
- **SC-005**: Generated import statements use correct relative paths for 100% of cross-schema references
- **SC-006**: Users can complete basic multi-schema project setup and build in under 5 minutes (measured by task completion time)
- **SC-007**: CLI and programmatic APIs both produce identical output
- **SC-008**: All unit, integration, and E2E tests pass with 90%+ code coverage
- **SC-009**: Documentation includes at least 5 runnable examples with real-world scenarios
- **SC-010**: Zero breaking changes to existing single-schema API

## Assumptions

- Users have basic knowledge of JSON Schema and Zod validators
- TypeScript is available in the user's environment for type checking
- ts-morph API is stable and compatible with project's TypeScript version
- $ref values follow standard JSON Schema format (relative paths, file:// URLs, or # internal references)
- Output directory is writable and users can manage file permissions
- Remote schema URLs will not be fetched automatically (security-first approach)
- Circular dependencies are detected and reported but generation continues with lazy builders to unblock users
- Export name conflicts detected during validation result in failure (user must resolve manually by renaming schemas)

## Out of Scope

- Remote schema URL fetching or validation
- Runtime schema validation (validation happens at generation time only)
- Automatic conflict resolution when two schemas export the same name (user must resolve manually)
- Direct support for non-JSON-Schema formats (OpenAPI, GraphQL, etc.) beyond what matches JSON Schema
- Incremental builds (all-or-nothing rebuild required)
- Plugin system for extensibility
- Watch mode (file watching / rebuild on change) deferred to post-MVP; users can rely on external watchers (e.g., nodemon/chokidar)

## Clarifications

### Session 2026-01-07

- Q: When two schemas have the same export name, what should the system do? → A: Fail fast during validation with clear error message requiring user to rename one schema
- Q: How should circular $ref dependencies be handled? → A: Build succeeds with lazy builders and type-only imports; cycles are detected and reported with warning but do not block generation
- Q: When a $ref points to a non-existent schema, what should happen? → A: Build succeeds but generates type placeholder (`z.unknown()`) for missing refs with warnings logged
- Q: When `moduleFormat` includes CommonJS, how should output be generated? → A: System generates both dist/esm and dist/cjs using dual TypeScript configurations + post-build scripts (aligns with constitution Principle II)
- Q: Should watch mode be part of MVP? → A: Defer watch mode post-MVP; treat as optional enhancement and recommend external watchers (e.g., nodemon/chokidar)

- **$ref**: JSON Schema reference to another schema or definition
- **Zod Builder**: Intermediate representation of a Zod validator before code generation
- **Barrel Export**: Index file that re-exports all public APIs for convenience
- **ts-morph**: TypeScript API for programmatic manipulation of source files
- **Topological Sort**: Ordering of dependencies such that dependencies come before dependents
