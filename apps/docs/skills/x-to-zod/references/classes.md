# Classes

## SchemaProject

### `SchemaProject`
SchemaProject: Main API for multi-schema projects.
Manages schema registration, validation, dependency analysis, and code generation.
```ts
constructor(options: SchemaProjectOptions): SchemaProject
```
**Methods:**
- `addSchema(id: string, schema: JSONSchemaAny, options?: SchemaOptions): void` — Add a schema to the project.
- `addSchemaFromFile(filePath: string, id?: string, options?: SchemaFileOptions): void` — Add a schema from a file.
- `validate(): ValidationResult` — Validate the project configuration and schema relationships.
- `build(): Promise<BuildResult>` — Build the project: parse schemas, apply post-processors, generate code.
- `getDependencyGraph(): DependencyGraphBuilder` — Get the dependency graph for schemas.
- `resolveRef(ref: string, fromSchemaId: string): RefResolution | null` — Resolve a $ref using the configured resolver.
- `getRegistry(): SchemaRegistry` — Get schema registry for direct access.
- `getBuilderRegistry(): BuilderRegistry` — Get builder registry for direct access.

## BaseBuilder

### `BaseBuilder`
BaseBuilder: Abstract base class for all Zod schema builders.
Provides shared modifier methods that apply to all schema types.

Template Method Pattern:
- base(): Computes the type-specific schema string (must be overridden)
- modify(): Applies shared modifiers to the base schema
- text(): Orchestrates base() and modify() to produce final output
*implements `Builder<Z, T>`*
```ts
constructor<Z, T, P>(version: "v3" | "v4", params: P): BaseBuilder<Z, T, P>
```
**Properties:**
- `typeKind: T` — Parser type discriminator (e.g. `'string'`, `'object'`, `'anyOf'`).
Set by the parser that creates this builder.
- `_params: P` (optional)
- `_optional: boolean`
- `_nullable: boolean`
- `_readonly: boolean`
- `_defaultValue: unknown` (optional)
- `_describeText: string` (optional)
- `_brandText: string` (optional)
- `_fallbackText: unknown` (optional)
- `_refineFn: string` (optional)
- `_refineMessage: string` (optional)
- `_superRefineFns: string[]`
- `_metaData: Record<string, unknown>` (optional)
- `_transformFn: string` (optional)
- `_version: "v3" | "v4"` (optional)
**Methods:**
- `isV4(): boolean` — Check if targeting Zod v4.
- `isV3(): boolean` — Check if targeting Zod v3.
- `serializeParams(): string` — Serialize params to a string representation for code generation.
Handles objects, strings, primitives, and undefined.
- `optional(): this` — Apply optional constraint.
- `required(): this`
- `nullable(): this` — Apply nullable constraint.
- `default(value: unknown): this` — Apply default value.
- `describe(description: string): this` — Apply describe modifier.
- `brand(brand: string): this` — Apply brand modifier.
- `readonly(): this` — Apply readonly modifier.
- `catch(fallback: unknown): this` — Apply catch modifier.
- `refine(refineFn: string, message?: string): this` — Apply refine modifier.

Note: function is provided as raw code string e.g. `(val) => val > 0`.
- `superRefine(superRefineFn: string): this` — Apply superRefine modifier.

Note: function is provided as raw code string e.g. `(val, ctx) => { ... }`.
- `meta(metadata: Record<string, unknown>): this` — Apply meta modifier.
- `transform(transformFn: string): this` — Apply transform modifier.

Note: function is provided as raw code string e.g. `(val) => transformedVal`.
- `base(): string` — Compute the type-specific base schema string.

This is the core abstract method in the template method pattern.
Subclasses must implement this to provide their type-specific schema string
(e.g., "z.string()", "z.number()", "z.object({...})").

The base schema string returned by this method will then have shared modifiers
applied via the `modify()` method when `text()` is called.
- `is<K>(type: K): this is TypeKindOf<K>`
- `modify(baseText: string): string` — Apply all shared modifiers to the base schema string.
This method is called by text() and applies modifiers in a stable order.
- `text(): string` — Unwrap and return the final Zod code string.
This orchestrates the template method pattern: text() = modify(base())
- `toString(): string` — Returns a string representation of an object.

## boolean

### `BooleanBuilder`
Fluent BooleanBuilder: wraps a Zod boolean schema string and provides chainable methods.
*extends `BaseBuilder<z.ZodBoolean>`*
*implements `BuilderFor<z.ZodBoolean>`*
```ts
constructor(version: "v3" | "v4", params: [params?: string | { error?: string | ((args: [issue: { input: unknown; code: "invalid_type"; expected: "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function" | "array" | "null" | "map" | "int" | "void" | "never" | "date" | "record" | "file" | "tuple" | "set" | "nonoptional" | "nan" | { toString: any; charAt: any; charCodeAt: any; concat: any; indexOf: any; lastIndexOf: any; localeCompare: any; match: any; replace: any; search: any; slice: any; split: any; substring: any; toLowerCase: any; toLocaleLowerCase: any; toUpperCase: any; toLocaleUpperCase: any; trim: any; length: number; substr: any; valueOf: any; codePointAt: any; includes: any; endsWith: any; normalize: any; repeat: any; startsWith: any; anchor: any; big: any; blink: any; bold: any; fixed: any; fontcolor: any; fontsize: any; italics: any; link: any; small: any; strike: any; sub: any; sup: any; padStart: any; padEnd: any; trimEnd: any; trimStart: any; trimLeft: any; trimRight: any; matchAll: any; replaceAll: any; at: any; isWellFormed: any; toWellFormed: any; [iterator]: any; [key: number]: string }; path?: PropertyKey[]; message?: string; inst?: { _zod: { version: { major: ...; minor: ...; patch: ... }; def: { type: ...; error?: ...; checks?: ... }; run: any; parse: any; toJSONSchema?: (...) | (...) }; ~standard: { validate: (args: ...) => ...; version: 1; vendor: string; types?: (...) | (...) } } | { _zod: { def: { check: ...; error?: ...; abort?: ...; when?: ... }; issc?: (...) | (...); check: any; onattach: (...)[] } }; continue?: boolean; [key: string]: unknown }]) => string | { message: string } | null | undefined); message?: string }]): BooleanBuilder
```
**Properties:**
- `typeKind: "boolean"` — Parser type discriminator (e.g. `'string'`, `'object'`, `'anyOf'`).
Set by the parser that creates this builder.
- `_params: [params?: string | { error?: string | ((args: [issue: { input: unknown; code: "invalid_type"; expected: "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function" | "array" | "null" | "map" | "int" | "void" | "never" | "date" | "record" | "file" | "tuple" | "set" | "nonoptional" | "nan" | { toString: any; charAt: any; charCodeAt: any; concat: any; indexOf: any; lastIndexOf: any; localeCompare: any; match: any; replace: any; search: any; slice: any; split: any; substring: any; toLowerCase: any; toLocaleLowerCase: any; toUpperCase: any; toLocaleUpperCase: any; trim: any; length: number; substr: any; valueOf: any; codePointAt: any; includes: any; endsWith: any; normalize: any; repeat: any; startsWith: any; anchor: any; big: any; blink: any; bold: any; fixed: any; fontcolor: any; fontsize: any; italics: any; link: any; small: any; strike: any; sub: any; sup: any; padStart: any; padEnd: any; trimEnd: any; trimStart: any; trimLeft: any; trimRight: any; matchAll: any; replaceAll: any; at: any; isWellFormed: any; toWellFormed: any; [iterator]: any; [key: number]: string }; path?: PropertyKey[]; message?: string; inst?: { _zod: { version: ...; def: ...; run: any; parse: any; toJSONSchema?: ... }; ~standard: { validate: ...; version: ...; vendor: ...; types?: ... } } | { _zod: { def: ...; issc?: ...; check: any; onattach: ... } }; continue?: boolean; [key: string]: unknown }]) => string | { message: string } | null | undefined); message?: string }]` (optional)
- `_optional: boolean`
- `_nullable: boolean`
- `_readonly: boolean`
- `_defaultValue: unknown` (optional)
- `_describeText: string` (optional)
- `_brandText: string` (optional)
- `_fallbackText: unknown` (optional)
- `_refineFn: string` (optional)
- `_refineMessage: string` (optional)
- `_superRefineFns: string[]`
- `_metaData: Record<string, unknown>` (optional)
- `_transformFn: string` (optional)
- `_version: "v3" | "v4"` (optional)
**Methods:**
- `isV4(): boolean` — Check if targeting Zod v4.
- `isV3(): boolean` — Check if targeting Zod v3.
- `serializeParams(): string` — Serialize params to a string representation for code generation.
Handles objects, strings, primitives, and undefined.
- `optional(): this` — Apply optional constraint.
- `required(): this`
- `nullable(): this` — Apply nullable constraint.
- `default(value: unknown): this` — Apply default value.
- `describe(description: string): this` — Apply describe modifier.
- `brand(brand: string): this` — Apply brand modifier.
- `readonly(): this` — Apply readonly modifier.
- `catch(fallback: unknown): this` — Apply catch modifier.
- `refine(refineFn: string, message?: string): this` — Apply refine modifier.

Note: function is provided as raw code string e.g. `(val) => val > 0`.
- `superRefine(superRefineFn: string): this` — Apply superRefine modifier.

Note: function is provided as raw code string e.g. `(val, ctx) => { ... }`.
- `meta(metadata: Record<string, unknown>): this` — Apply meta modifier.
- `transform(transformFn: string): this` — Apply transform modifier.

Note: function is provided as raw code string e.g. `(val) => transformedVal`.
- `base(): string` — Compute the type-specific base schema string.

This is the core abstract method in the template method pattern.
Subclasses must implement this to provide their type-specific schema string
(e.g., "z.string()", "z.number()", "z.object({...})").

The base schema string returned by this method will then have shared modifiers
applied via the `modify()` method when `text()` is called.
- `is<K>(type: K): this is TypeKindOf<K>`
- `modify(baseText: string): string` — Apply all shared modifiers to the base schema string.
This method is called by text() and applies modifiers in a stable order.
- `text(): string` — Unwrap and return the final Zod code string.
This orchestrates the template method pattern: text() = modify(base())
- `toString(): string` — Returns a string representation of an object.

## null

### `NullBuilder`
Fluent NullBuilder: wraps a Zod null schema string and provides chainable methods.
*extends `BaseBuilder<ZodNull>`*
```ts
constructor(version?: "v3" | "v4"): NullBuilder
```
**Properties:**
- `typeKind: "null"` — Parser type discriminator (e.g. `'string'`, `'object'`, `'anyOf'`).
Set by the parser that creates this builder.
- `_params: [params?: string | { error?: string | ((args: [issue: { input: unknown; code: "invalid_type"; expected: "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function" | "array" | "null" | "map" | "int" | "void" | "never" | "date" | "record" | "file" | "tuple" | "set" | "nonoptional" | "nan" | { toString: any; charAt: any; charCodeAt: any; concat: any; indexOf: any; lastIndexOf: any; localeCompare: any; match: any; replace: any; search: any; slice: any; split: any; substring: any; toLowerCase: any; toLocaleLowerCase: any; toUpperCase: any; toLocaleUpperCase: any; trim: any; length: number; substr: any; valueOf: any; codePointAt: any; includes: any; endsWith: any; normalize: any; repeat: any; startsWith: any; anchor: any; big: any; blink: any; bold: any; fixed: any; fontcolor: any; fontsize: any; italics: any; link: any; small: any; strike: any; sub: any; sup: any; padStart: any; padEnd: any; trimEnd: any; trimStart: any; trimLeft: any; trimRight: any; matchAll: any; replaceAll: any; at: any; isWellFormed: any; toWellFormed: any; [iterator]: any; [key: number]: string }; path?: PropertyKey[]; message?: string; inst?: { _zod: { version: ...; def: ...; run: any; parse: any; toJSONSchema?: ... }; ~standard: { validate: ...; version: ...; vendor: ...; types?: ... } } | { _zod: { def: ...; issc?: ...; check: any; onattach: ... } }; continue?: boolean; [key: string]: unknown }]) => string | { message: string } | null | undefined); message?: string }]` (optional)
- `_optional: boolean`
- `_nullable: boolean`
- `_readonly: boolean`
- `_defaultValue: unknown` (optional)
- `_describeText: string` (optional)
- `_brandText: string` (optional)
- `_fallbackText: unknown` (optional)
- `_refineFn: string` (optional)
- `_refineMessage: string` (optional)
- `_superRefineFns: string[]`
- `_metaData: Record<string, unknown>` (optional)
- `_transformFn: string` (optional)
- `_version: "v3" | "v4"` (optional)
**Methods:**
- `isV4(): boolean` — Check if targeting Zod v4.
- `isV3(): boolean` — Check if targeting Zod v3.
- `serializeParams(): string` — Serialize params to a string representation for code generation.
Handles objects, strings, primitives, and undefined.
- `optional(): this` — Apply optional constraint.
- `required(): this`
- `nullable(): this` — Apply nullable constraint.
- `default(value: unknown): this` — Apply default value.
- `describe(description: string): this` — Apply describe modifier.
- `brand(brand: string): this` — Apply brand modifier.
- `readonly(): this` — Apply readonly modifier.
- `catch(fallback: unknown): this` — Apply catch modifier.
- `refine(refineFn: string, message?: string): this` — Apply refine modifier.

Note: function is provided as raw code string e.g. `(val) => val > 0`.
- `superRefine(superRefineFn: string): this` — Apply superRefine modifier.

Note: function is provided as raw code string e.g. `(val, ctx) => { ... }`.
- `meta(metadata: Record<string, unknown>): this` — Apply meta modifier.
- `transform(transformFn: string): this` — Apply transform modifier.

Note: function is provided as raw code string e.g. `(val) => transformedVal`.
- `base(): string` — Compute the type-specific base schema string.

This is the core abstract method in the template method pattern.
Subclasses must implement this to provide their type-specific schema string
(e.g., "z.string()", "z.number()", "z.object({...})").

The base schema string returned by this method will then have shared modifiers
applied via the `modify()` method when `text()` is called.
- `is<K>(type: K): this is TypeKindOf<K>`
- `modify(baseText: string): string` — Apply all shared modifiers to the base schema string.
This method is called by text() and applies modifiers in a stable order.
- `text(): string` — Unwrap and return the final Zod code string.
This orchestrates the template method pattern: text() = modify(base())
- `toString(): string` — Returns a string representation of an object.

## const

### `ConstBuilder`
Fluent ConstBuilder: wraps a Zod literal schema string and provides chainable methods.
*extends `BaseBuilder<ZodTemplateLiteral, "template_literal", [value: Serializable]>`*
```ts
constructor(version: "v3" | "v4", value: Serializable): ConstBuilder
```
**Properties:**
- `typeKind: "template_literal"` — Parser type discriminator (e.g. `'string'`, `'object'`, `'anyOf'`).
Set by the parser that creates this builder.
- `_params: [value: Serializable]` (optional)
- `_optional: boolean`
- `_nullable: boolean`
- `_readonly: boolean`
- `_defaultValue: unknown` (optional)
- `_describeText: string` (optional)
- `_brandText: string` (optional)
- `_fallbackText: unknown` (optional)
- `_refineFn: string` (optional)
- `_refineMessage: string` (optional)
- `_superRefineFns: string[]`
- `_metaData: Record<string, unknown>` (optional)
- `_transformFn: string` (optional)
- `_version: "v3" | "v4"` (optional)
**Methods:**
- `base(): string` — Compute the type-specific base schema string.

This is the core abstract method in the template method pattern.
Subclasses must implement this to provide their type-specific schema string
(e.g., "z.string()", "z.number()", "z.object({...})").

The base schema string returned by this method will then have shared modifiers
applied via the `modify()` method when `text()` is called.
- `isV4(): boolean` — Check if targeting Zod v4.

<!-- truncated -->
