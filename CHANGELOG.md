# Changelog

## 0.10.1

### Patch Changes

- [#75](https://github.com/pradeepmouli/x-to-zod/pull/75) [`1a0f010`](https://github.com/pradeepmouli/x-to-zod/commit/1a0f010d54aefde502b29ae61d0505fa99ffa2fe) Thanks [@pradeepmouli](https://github.com/pradeepmouli)! - - test: trigger CI pipeline

## 0.10.0

### Minor Changes

- [#69](https://github.com/pradeepmouli/x-to-zod/pull/69) [`00b88ac`](https://github.com/pradeepmouli/x-to-zod/commit/00b88ac189e77d2ec43cfc978933b6ae91bc1cbf) Thanks [@github-actions](https://github.com/apps/github-actions)! - - Update README.md
  - fix: address review comments - remove readonly mutation, fix import types, inline Serializable, update README
  - Initial plan
  - refactor: eliminate Types.ts god file, add named schema aliases, rename JSONSchemaObject → SchemaNode
  - Update EnumParser.ts

## 0.9.0

### Minor Changes

- [`4d28559`](https://github.com/pradeepmouli/x-to-zod/commit/4d285593cca16e60c646f9da3fdc5341a9db5601) Thanks [@pradeepmouli](https://github.com/pradeepmouli)! - feat: type-safe builder params and array nonempty/length methods

  All Zod v4 builder factory functions now accept properly typed parameters via `Parameters<typeof z.X>[0]` instead of `unknown`, providing full TypeScript IntelliSense and compile-time safety.

  **String format builders** (`hex`, `hostname`, `jwt`, `mac`, `xid`, `ksuid`, `e164`, `base64url`, `httpUrl`), **number format builders** (`int`, `float32`, `float64`, `int32`, `uint32`), **BigInt format builders** (`int64`, `uint64`), and the **`json` builder** all accept their respective Zod param types.

  `ArrayBuilder` gains working `nonempty()` and `length()` methods mirroring Zod's API. `nonempty()` delegates to `.min(1)` with the same typed params; `length(n)` sets an exact size that supersedes any `min`/`max` on serialization. `applyExactLength` is now exported from `x-to-zod/builders`.

  Added a 90-test symmetry suite (`zod-build-symmetry.test.ts`) covering the full `buildV4` factory.

## 0.9.0

### Minor Changes

#### Type-Safe Builder Params

All Zod v4 builder factory functions now accept properly typed parameters instead of `unknown`, providing TypeScript IntelliSense and compile-time safety for all builder options.

**String format builders** — `hex`, `hostname`, `jwt`, `mac`, `xid`, `ksuid`, `e164`, `base64url`, `httpUrl` — all accept `Parameters<typeof z.X>[0]`:

```typescript
import { build } from "x-to-zod/v4";

// Full type safety — error object matches Zod's own API
build.hex({ error: "must be hex" });
build.jwt({ error: "invalid JWT" });
build.e164({ error: "invalid phone number" });
```

**Number format builders** — `int`, `float32`, `float64`, `int32`, `uint32`:

```typescript
build.int({ error: "must be integer" });
build.float32({ error: "out of float32 range" });
```

**BigInt format builders** — `int64`, `uint64`:

```typescript
build.int64({ error: "out of int64 range" });
```

**JSON builder**:

```typescript
build.json({ error: "must be valid JSON" });
```

#### ArrayBuilder: `nonempty()` and `length()` Methods

`ArrayBuilder` now exposes fully typed and functional `nonempty()` and `length()` methods, mirroring Zod's own array API:

```typescript
build.array(build.string()).nonempty();
// => z.array(z.string()).min(1)

build.array(build.string()).nonempty({ error: "required" });
// => z.array(z.string()).min(1, {"error":"required"})

build.array(build.string()).length(3);
// => z.array(z.string()).length(3)

build.array(build.string()).length(3, { error: "bad length" });
// => z.array(z.string()).length(3, {"error":"bad length"})

// length() supersedes min/max:
build.array(build.string()).min(1).max(10).length(3);
// => z.array(z.string()).length(3)
```

A new `applyExactLength` helper is exported from `x-to-zod/builders` for custom post-processors.

#### New Test Coverage

Added 90-test symmetry suite (`zod-build-symmetry.test.ts`) covering the full `buildV4` factory, validating that every builder serializes to the expected Zod expression.

## 0.8.0

### Minor Changes

- [#61](https://github.com/pradeepmouli/x-to-zod/pull/61) [`98a26c5`](https://github.com/pradeepmouli/x-to-zod/commit/98a26c5b533d6ed5f95cec41bf149377e5cc5efc) Thanks [@github-actions](https://github.com/apps/github-actions)! - - fix: include build output in npm package
  - Initial plan
  - chore(deps)(deps-dev): bump the code-quality group with 2 updates

## 0.7.1

### Patch Changes

- [#56](https://github.com/pradeepmouli/x-to-zod/pull/56) [`cd66af0`](https://github.com/pradeepmouli/x-to-zod/commit/cd66af03f135424090cc7abdb3f51ea34d76e477) Thanks [@github-actions](https://github.com/apps/github-actions)! - -

## 0.7.0

### Minor Changes

- project support

## 0.6.0

### Major Features

#### Multi-Schema Project Support

- **NEW**: Support for multi-schema projects with cross-schema references
  - Programmatic API via `SchemaProject` class for managing multiple related schemas
  - CLI `--project` mode for batch processing schema files with glob patterns
  - Automatic cross-schema `$ref` resolution and dependency analysis
  - Intelligent build ordering via topological sort of schema dependencies
  - Export name conflict detection and validation
  - Circular dependency detection with lazy builder support
  - Missing reference handling with warnings and `z.unknown()` placeholders
  - Generates organized output with one `.ts` file per schema plus barrel export `index.ts`
  - Dual-module support (ESM/CJS) for generated code
  - **NEW**: `extractDefinitions` option to extract internal definitions into separate files
    - Handles OpenAPI `components/schemas` with hundreds of schemas
    - Supports JSON Schema 2020-12 `$defs` and JSON Schema Draft-07 `definitions`
    - Configurable subdirectory structure and naming patterns
    - CLI flags: `--extract-definitions` and `--definitions-dir`
    - Critical for large OpenAPI/Swagger documents

**Example:**

```typescript
import { SchemaProject } from "x-to-zod";

const project = new SchemaProject.SchemaProject({
  outDir: "./generated",
  moduleFormat: "both",
  zodVersion: "v4",
  generateIndex: true,
});

project.addSchema("user", userSchema);
project.addSchema("post", postSchema); // Can reference 'user'

// Extract OpenAPI components into separate files
project.addSchema("api", openApiSchema, {
  extractDefinitions: {
    enabled: true,
    subdir: "components",
    namePattern: "{name}Schema",
  },
});

await project.build();
```

**CLI:**

```bash
# Basic project mode
x-to-zod --project --schemas "./schemas/*.json" --out ./generated

# With definition extraction for OpenAPI
x-to-zod --project \
  --schemas "openapi.yaml:api" \
  --out ./generated \
  --extract-definitions \
  --definitions-dir components
```

See [Multi-Schema Projects Guide](./docs/multi-schema-projects.md) for complete documentation.

#### Post-Processor Support

- Transform Zod builders after parsing with custom post-processors
- Type-based filtering to target specific builder types
- Path-based filtering for granular control
- Use cases: add organization-wide validation rules, security constraints, custom transformations

See [Post-Processing Guide](./docs/post-processing.md) for details.

### Dependencies

- Added `ts-morph@^27.0.2` for multi-schema code generation and project management

### Internal Changes

- New `SchemaProject/` module with core components:
  - `SchemaProject`: Main orchestrator class
  - `SchemaRegistry`: Schema storage and management
  - `DependencyGraph`: Dependency analysis and topological sorting
  - `RefResolver`: Cross-schema reference resolution
  - `NameResolver`: Export name generation and conflict detection
  - `ImportManager`: Import statement management
  - `SourceFileGenerator`: Code generation via ts-morph
  - `Validator`: Validation and error reporting
- CLI extended with project mode flags: `--project`, `--schemas`, `--out`, `--module-format`, `--zod-version`, `--generate-index`
- Comprehensive test suite: 160+ new tests for multi-schema functionality

## 0.5.0

### Minor Changes

- Added explicit support for generating schemas targeting **Zod v3** and **Zod v4**.
- Introduced `buildV3` and `buildV4` factory methods for selecting the target Zod major version:
  - `buildV4(...)` generates Zod v4-compatible schema definitions.
  - `buildV3(...)` generates Zod v3-compatible schema definitions.
- The default builder now targets **Zod v4** output when no explicit version-specific builder is used.

### Migration Notes

- **Existing users targeting Zod v3:**
  - If your project still uses Zod v3, switch to the `buildV3` factory to continue generating v3-compatible schemas.
  - Review any downstream code that assumes v3-specific APIs and ensure it uses the v3-targeting builder.
- **Users upgrading to or already on Zod v4:**
  - No changes are required; the default behavior now generates v4-compatible output via the default builder / `buildV4`.
- If you maintain libraries or tools built on top of this package, consider exposing a configuration option that allows consumers to choose between `buildV3` and `buildV4`, with v4 as the recommended default.

## 0.4.0

### Minor Changes

- Migrated to json-schema-typed library for TypeScript type definitions

### Breaking Changes

- **TypeScript type definitions now use json-schema-typed library (draft-2020-12)**
  - Replaced custom `JsonSchema` type definitions with types from `json-schema-typed@^8.0.2`
  - Uses JSON Schema draft-2020-12 specification (latest stable)
  - Type aliases maintain backward compatibility for consumers
  - Custom extensions preserved: `errorMessage` (OpenAPI Validator), `nullable` (OpenAPI 3.0)

### Migration Notes

**JSON Schema Draft-2020-12 Changes:**

- `exclusiveMinimum` / `exclusiveMaximum`: Now standalone numeric values (was: boolean flag with `minimum`/`maximum` in draft-04)
- `required`: Array-only (no longer accepts boolean)
- `enum`: Must be non-empty array

**If you're using custom JSON Schema types:**

- Update imports from `json-schema-typed/draft-2020-12` for better TypeScript IntelliSense
- Old draft-04 style schemas may need updates (see examples above)

**For package consumers:**

- No breaking changes to public API
- Type aliases ensure full backward compatibility
- All existing code continues to work

### Internal Changes

- Updated TypeScript configuration for json-schema-typed compatibility
  - `tsconfig.types.json`: Added `moduleResolution: "bundler"`
  - `tsconfig.cjs.json`: Updated to `module: "nodenext"` with `moduleResolution: "nodenext"`
- Added explicit type annotations throughout parser files for improved type safety
- Updated type guards to match draft-2020-12 spec (e.g., enum must be array)

## 0.3.0

### Minor Changes

- added preprocessor support

## 0.2.2

### Patch Changes

- oneOf now uses z.xor

## 0.2.1

### Patch Changes

- cleanup, updated function builders

## 0.2.0

### Minor Changes

- a3a450b: Add support for new JSON Schema feature

  ```

  ```

- 30ee77d: Migrate to pnpm and add CI/CD for automated version bumping and publishing

  - Migrated from npm to pnpm for package management
  - Updated CI workflow to use pnpm
  - Added automated version bumping using Changesets
  - Added automated publishing to npm via GitHub Actions
  - Updated documentation to reflect pnpm usage

- bcb2b10: enhancements

### Patch Changes

- bcb2b10: updated dependencies

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project adheres to Semantic Versioning.

## Unreleased

### Changed

- Refactor: JSON Schema parsing and CLI boundaries now use fluent builder objects internally and call `.text()` at the top-level output boundary.
- CLI output is normalized with a trailing newline for stable file/stdout diffs.

### Fixed

- Test reliability: CLI tests no longer assume a globally available `tsx` binary.

### Added

- New fluent builder types for schema composition and primitives (e.g., union/intersection/tuple/record/any/never/unknown/literal).
