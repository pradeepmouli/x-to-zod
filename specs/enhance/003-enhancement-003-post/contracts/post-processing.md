# Contracts: Post-Processing API

## Programmatic API (jsonSchemaToZod)
- Input: { postProcessors?: Array<PostProcessor | PostProcessorConfig> }
- Behavior: Each processor runs during parsing after a builder is created; may return a replacement builder or undefined to keep original.
- Guarantees: Builders remain valid Zod builders; processors run in provided order; path/type filters applied before invocation.
- Errors: Invalid processor shapes throw early; processor exceptions surface to caller with path context.

## CLI
- Flag: `--postProcessors <modulePath>`
- Module contract: default export (or named `postProcessors`) resolving to Array<PostProcessor | PostProcessorConfig>.
- Execution: Module loaded once; processors injected into parsing pipeline same as programmatic usage.
- Errors: Missing module, non-array export, or invalid entries fail fast with descriptive CLI error.

## Path Pattern Matching
- Supported patterns: `$`, `$.properties.*`, `$.properties.**`, `$..field`, exact segment chains.
- Matching semantics: `*` matches one segment; `**` matches zero or more segments; `$..field` matches field anywhere.
- Performance: Patterns compiled and cached; context.matchPath uses cached matcher.

## Presets
- strictObjects(): returns processor adding `.strict()` to object builders.
- nonemptyArrays(): returns processor adding `.nonempty()` to array builders.
- brandIds(brand?: string): brands string builders on `$..id` (default brand: `ID`).
- makeOptional(pattern): adds `.optional()` to builders at matching paths.
- makeRequired(pattern): removes `.optional()` at matching paths where supported.
- matchPath(pattern, transform): wrapper applying transform only when path matches.
