# Data Model

## Core Types
- PostProcessor: (builder, context) => ZodBuilder | undefined; runs after a parser creates a builder.
- PostProcessorContext: { path: (string | number)[]; pathString: string; schema: JsonSchema; build: typeof buildV3 | typeof buildV4; matchPath(pattern: string): boolean }.
- PostProcessorConfig: { processor: PostProcessor; pathPattern?: string | string[]; typeFilter?: string | string[] } for early filtering.
- PathPattern: JSONPath-like string supporting segments, `*`, `**`, `$..field`, compiled for matching.
- PresetFactory: functions returning PostProcessor (strictObjects, nonemptyArrays, brandIds, makeOptional, makeRequired, matchPath wrapper).
- Builder Type Guards: is.objectBuilder, is.stringBuilder, is.arrayBuilder, is.numberBuilder, is.unionBuilder, etc., narrowing ZodBuilder variants.

## Relationships and Flow
- Parser classes construct builders and pass them through applyPostProcessors with context.
- Context.matchPath uses compiled PathPattern to decide applicability per processor.
- PostProcessorConfig enables short-circuiting before invocation (path/type filters).
- PresetFactory outputs are added to the postProcessors list; they rely on type guards.
- CLI/programmatic option supplies the postProcessors array into parsing context.
