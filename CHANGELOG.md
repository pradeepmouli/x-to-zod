# Changelog

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
