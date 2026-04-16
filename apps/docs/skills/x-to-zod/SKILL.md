---
name: x-to-zod
description: Documentation site for x-to-zod
---

# x-to-zod

Documentation site for x-to-zod

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

- API surface: 6 functions, 53 classes, 21 types, 5 constants

## Configuration

### SchemaProjectOptions

Multi-Schema Project Configuration Options

| Key | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `outDir` | `string` | yes | — |  |
| `moduleFormat` | `"esm" | "cjs" | "both"` | no | — |  |
| `zodVersion` | `"v3" | "v4"` | no | — |  |
| `generateIndex` | `boolean` | no | — |  |
| `generateDeclarations` | `boolean` | no | — |  |
| `tsconfig` | `string | CompilerOptions` | no | — |  |
| `nameResolver` | `NameResolver` | no | — |  |
| `refResolver` | `RefResolver` | no | — |  |
| `globalPostProcessors` | `ProjectPostProcessorConfig[]` | no | — |  |
| `prettier` | `boolean | PrettierOptions` | no | — |  |
| `importPathTransformer` | `(from: string, to: string) => string` | no | — |  |
| `extractDefinitions` | `boolean | ExtractDefinitionsOptions` | no | — |  |

### ExtractDefinitionsOptions

Options for extracting definitions into separate files

| Key | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `enabled` | `boolean` | yes | — |  |
| `subdir` | `string` | no | — |  |
| `namePattern` | `(schemaId: string, defName: string) => string` | no | — |  |

### SchemaOptions

Options for individual schema when added to project

| Key | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `postProcessors` | `ProjectPostProcessorConfig[]` | no | — |  |
| `moduleFormatOverride` | `"esm" | "cjs" | "both"` | no | — |  |
| `extractDefinitions` | `boolean` | no | — |  |

### SchemaFileOptions

Options for adding schema from file

| Key | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `id` | `string` | no | — |  |
| `encoding` | `BufferEncoding` | no | — |  |
| `postProcessors` | `ProjectPostProcessorConfig[]` | no | — |  |
| `moduleFormatOverride` | `"esm" | "cjs" | "both"` | no | — |  |
| `extractDefinitions` | `boolean` | no | — |  |

### ProjectPostProcessorConfig

Configuration for post-processor application

| Key | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `name` | `string` | yes | — |  |
| `options` | `Record<string, any>` | no | — |  |

### PrettierOptions

Prettier configuration options

| Key | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `semi` | `boolean` | no | — |  |
| `singleQuote` | `boolean` | no | — |  |
| `trailingComma` | `"es5" | "none" | "all"` | no | — |  |
| `printWidth` | `number` | no | — |  |
| `tabWidth` | `number` | no | — |  |
| `useTabs` | `boolean` | no | — |  |

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
**types:** `SchemaEntry`, `ProjectSchemaMetadata`, `RefResolution`, `ImportInfo`, `DependencyGraph`, `BuildResult`, `BuildError`, `BuildWarning`, `ValidationResult`, `ValidationError`, `ValidationWarning`, `NameResolver`, `RefResolver`
**v3:** `V3BuildAPI`, `buildV3`
**v4:** `V4BuildAPI`, `buildV4`
**presets:** `postProcessors`

## Links

- Author: Pradeep Mouli <pmouli@mac.com> (https://github.com/pradeepmouli)