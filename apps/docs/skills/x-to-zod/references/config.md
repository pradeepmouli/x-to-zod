# Configuration

## SchemaProjectOptions

Multi-Schema Project Configuration Options

### Properties

#### outDir



**Type:** `string`

**Required:** yes

#### moduleFormat



**Type:** `"esm" | "cjs" | "both"`

#### zodVersion



**Type:** `"v3" | "v4"`

#### generateIndex



**Type:** `boolean`

#### generateDeclarations



**Type:** `boolean`

#### tsconfig



**Type:** `string | CompilerOptions`

#### nameResolver



**Type:** `NameResolver`

#### refResolver



**Type:** `RefResolver`

#### globalPostProcessors



**Type:** `ProjectPostProcessorConfig[]`

#### prettier



**Type:** `boolean | PrettierOptions`

#### importPathTransformer



**Type:** `(from: string, to: string) => string`

#### extractDefinitions



**Type:** `boolean | ExtractDefinitionsOptions`

## ExtractDefinitionsOptions

Options for extracting definitions into separate files

### Properties

#### enabled



**Type:** `boolean`

**Required:** yes

#### subdir



**Type:** `string`

#### namePattern



**Type:** `(schemaId: string, defName: string) => string`

## SchemaOptions

Options for individual schema when added to project

### Properties

#### postProcessors



**Type:** `ProjectPostProcessorConfig[]`

#### moduleFormatOverride



**Type:** `"esm" | "cjs" | "both"`

#### extractDefinitions



**Type:** `boolean`

## SchemaFileOptions

Options for adding schema from file

### Properties

#### id



**Type:** `string`

#### encoding



**Type:** `BufferEncoding`

#### postProcessors



**Type:** `ProjectPostProcessorConfig[]`

#### moduleFormatOverride



**Type:** `"esm" | "cjs" | "both"`

#### extractDefinitions



**Type:** `boolean`

## ProjectPostProcessorConfig

Configuration for post-processor application

### Properties

#### name



**Type:** `string`

**Required:** yes

#### options



**Type:** `Record<string, any>`

## PrettierOptions

Prettier configuration options

### Properties

#### semi



**Type:** `boolean`

#### singleQuote



**Type:** `boolean`

#### trailingComma



**Type:** `"es5" | "none" | "all"`

#### printWidth



**Type:** `number`

#### tabWidth



**Type:** `number`

#### useTabs



**Type:** `boolean`