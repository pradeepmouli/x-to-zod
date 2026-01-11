# API Contracts (Phase 1)

## Programmatic API (SchemaProject)

### Constructor
- `new SchemaProject(options: SchemaProjectOptions)`
  - `outDir: string` (required)
  - `moduleFormat?: 'esm' | 'cjs' | 'both'` (default: 'esm') — MUST support emitting both ESM and CJS builds
  - `zodVersion?: 'v3' | 'v4'`
  - `generateIndex?: boolean`
  - `generateDeclarations?: boolean`
  - `tsconfig?: string | CompilerOptions`
  - `nameResolver?: NameResolver`
  - `refResolver?: RefResolver`
  - `globalPostProcessors?: PostProcessorConfig[]`
  - `prettier?: boolean | PrettierOptions`
  - `importPathTransformer?: (from: string, to: string) => string`

### Methods
- `addSchema(id: string, schema: JsonSchema, options?: SchemaOptions): SchemaEntry`
- `addSchemaFromFile(filePath: string, options?: SchemaFileOptions): Promise<SchemaEntry>`
- `addSchemas(schemas: Record<string, JsonSchema>): SchemaEntry[]`
- `build(): Promise<BuildResult>` — runs validation, dependency graph, parsing, ts-morph generation, emits per-format outputs
- `getSourceFile(schemaId: string): SourceFile | undefined`
- `getProject(): Project`
- `resolveRef(ref: string, fromSchema: string): RefResolution`
- `getDependencyGraph(): DependencyGraph`
- `applyPostProcessors(processors: PostProcessorConfig[]): void`
- `validate(): ValidationResult` — detects missing refs, cycles, export conflicts; warns on missing refs, errors on conflicts
- `clear(): void`
- `dispose(): void`

### BuildResult
- `success: boolean`
- `errors: BuildError[]` (include conflicts, ts-morph failures)
- `warnings: BuildWarning[]` (missing refs placeholders, cycles)
- `generatedFiles: string[]` (per format)

### ValidationResult
- `valid: boolean`
- `errors: ValidationError[]` (export conflicts, invalid schemas, unresolved critical issues)
- `warnings: ValidationWarning[]` (missing refs placeholders, cycles)

## CLI Contracts (project mode additions)

- Flag: `--project` (enables multi-schema mode)
- Input: `--schemas "glob"` or multiple `--schema path` arguments
- Output dir: `--out <path>` (required)
- Module format: `--module-format <esm|cjs|both>` (default: esm; both triggers dual outputs)
- Zod version: `--zod-version <v3|v4>`
- Index generation: `--generate-index`
- Declarations: `--declarations`
- Post-processors: `--post-processors <config>` (future)
- Watch: explicitly **not** in MVP; document deferral
- Exit codes: non-zero on validation/build errors (including export conflicts); zero with warnings on missing refs/cycles when build succeeds

## Error & Warning Semantics

- Errors (fail build): export name conflicts, invalid schema parse, ts-morph emit failure, IO errors
- Warnings (build continues): missing $refs (placeholders), circular refs (lazy builders), optional post-processor issues marked non-fatal
