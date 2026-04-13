---
name: x-to-zod
description: "Enhanced fork of json-schema-to-zod - Converts JSON Schema into Zod schemas with fluent builder pattern Use when working with zod, json, schema, converter, cli."
license: ISC
---

# x-to-zod

Enhanced fork of json-schema-to-zod - Converts JSON Schema into Zod schemas with fluent builder pattern

## Quick Start

```ts
import { SchemaProject } from 'x-to-zod';

const project = new SchemaProject.SchemaProject({
  outDir: './generated',
  moduleFormat: 'both',
  zodVersion: 'v4',
  generateIndex: true,
});

project.addSchema('user', userSchema);
project.addSchema('post', postSchema);
await project.build();
```

## When to Use

- Working with zod, json, schema, converter, cli
- API surface: 6 functions, 53 classes, 27 types, 5 constants

## Quick Reference

`select`, `JSONSchema`, `SchemaVersion`, `TypeValue`, `transformer`, `TypeKind`, `TypeKindOf`, `parse`, `build`
**parseRef:** `parseRef`, `extractRefs`
**pathParser:** `parsePathPattern`
**pathMatcher:** `matchPath`, `clearPathPatternCache`
**SchemaProject:** `SchemaProject`
**BaseBuilder:** `BaseBuilder`
**boolean:** `BooleanBuilder`
**null:** `NullBuilder`
**const:** `ConstBuilder`
**enum:** `EnumBuilder`
**number:** `NumberBuilder`
**string:** `StringBuilder`
**array:** `ArrayBuilder`
**object:** `ObjectBuilder`
**any:** `AnyBuilder`
**never:** `NeverBuilder`
**unknown:** `UnknownBuilder`
**literal:** `LiteralBuilder`
**union:** `UnionBuilder`
**intersection:** `IntersectionBuilder`
**discriminatedUnion:** `DiscriminatedUnionBuilder`
**tuple:** `TupleBuilder`
**record:** `RecordBuilder`
**reference:** `ReferenceBuilder`
**void:** `VoidBuilder`
**undefined:** `UndefinedBuilder`
**date:** `DateBuilder`
**bigint:** `BigIntBuilder`
**symbol:** `SymbolBuilder`
**nan:** `NaNBuilder`
**set:** `SetBuilder`
**map:** `MapBuilder`
**custom:** `CustomBuilder`
**promise:** `PromiseBuilder`
**lazy:** `LazyBuilder`
**function:** `FunctionBuilder`
**codec:** `CodecBuilder`
**preprocess:** `PreprocessBuilder`
**pipe:** `PipeBuilder`
**json:** `JsonBuilder`
**file:** `FileBuilder`
**nativeEnum:** `NativeEnumBuilder`
**templateLiteral:** `TemplateLiteralBuilder`
**xor:** `XorBuilder`
**keyof:** `KeyofBuilder`
**email:** `EmailBuilder`
**url:** `UrlBuilder`
**uuid:** `UuidBuilder`
**datetime:** `DatetimeBuilder`
**time:** `TimeBuilder`
**duration:** `DurationBuilder`
**ip:** `IpBuilder`
**base64:** `Base64Builder`
**emoji:** `EmojiBuilder`
**cuid:** `CuidBuilder`
**ulid:** `UlidBuilder`
**nanoid:** `NanoidBuilder`
**types:** `SchemaProjectOptions`, `ExtractDefinitionsOptions`, `SchemaOptions`, `SchemaFileOptions`, `SchemaEntry`, `ProjectSchemaMetadata`, `RefResolution`, `ImportInfo`, `DependencyGraph`, `ProjectPostProcessorConfig`, `PrettierOptions`, `BuildResult`, `BuildError`, `BuildWarning`, `ValidationResult`, `ValidationError`, `ValidationWarning`, `NameResolver`, `RefResolver`
**v3:** `V3BuildAPI`, `buildV3`
**v4:** `V4BuildAPI`, `buildV4`
**presets:** `postProcessors`

## Links

- [Repository](https://github.com/pradeepmouli/x-to-zod)
- Author: Pradeep Mouli (https://github.com/pradeepmouli)