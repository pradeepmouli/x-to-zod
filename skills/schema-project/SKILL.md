---
name: schema-project
description: "Multi-schema project support.

Use `SchemaProject` to manage multiple JSON Schemas with cross-schema references.
See [quickstart guide](../specs/004-multi-schema-projects/quickstart.md) for usage examples. Use when working with parseRef, extractRefs, SchemaProject. Keywords: zod, json, schema, converter, cli."
license: ISC
---

# SchemaProject

Multi-schema project support.

Use `SchemaProject` to manage multiple JSON Schemas with cross-schema references.
See [quickstart guide](../specs/004-multi-schema-projects/quickstart.md) for usage examples.

## When to Use

- Calling `parseRef()`, `extractRefs()`
- Instantiating or extending `SchemaProject`
- Typing with `SchemaProjectOptions`, `ExtractDefinitionsOptions`, `SchemaOptions`, `SchemaFileOptions`, `SchemaEntry`

## Quick Reference

**2 functions** — `parseRef`, `extractRefs`
**1 classes** — `SchemaProject`
**19 types** — `SchemaProjectOptions`, `ExtractDefinitionsOptions`, `SchemaOptions`, `SchemaFileOptions`, `SchemaEntry`, `ProjectSchemaMetadata`, `RefResolution`, `ImportInfo`, `DependencyGraph`, `ProjectPostProcessorConfig`, `PrettierOptions`, `BuildResult`, `BuildError`, `BuildWarning`, `ValidationResult`, `ValidationError`, `ValidationWarning`, `NameResolver`, `RefResolver`

## Links

- [Repository](https://github.com/pradeepmouli/x-to-zod)
- Author: Pradeep Mouli (https://github.com/pradeepmouli)