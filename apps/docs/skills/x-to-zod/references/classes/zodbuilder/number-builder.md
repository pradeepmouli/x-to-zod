# Classes

## ZodBuilder

### `NumberBuilder`
Fluent NumberBuilder: wraps a Zod number schema string and provides chainable methods
that delegate to the existing apply* functions.

INFINITY HANDLING - Version Differences:
- Zod v3: z.number() accepts Infinity and -Infinity by default
- Zod v4: z.number() REJECTS Infinity and -Infinity by default (built-in behavior)
  Use z.number().allowInfinity() to permit infinite values in v4

This difference is INHERENT to Zod and not controlled by json-schema-to-zod.
See NUMBER-INFINITY-NOTES.md for migration guidance.
*extends `BaseBuilder<ZodNumber>`*
*implements `BuilderFor<ZodNumber>`*
```ts
constructor(version: "v3" | "v4", params: [params?: string | { error?: string | ((args: [issue: { input: unknown; code: "invalid_type"; expected: "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function" | "array" | "null" | "map" | "int" | "void" | "never" | "date" | "record" | "file" | "tuple" | "set" | "nonoptional" | "nan" | { toString: any; charAt: any; charCodeAt: any; concat: any; indexOf: any; lastIndexOf: any; localeCompare: any; match: any; replace: any; search: any; slice: any; split: any; substring: any; toLowerCase: any; toLocaleLowerCase: any; toUpperCase: any; toLocaleUpperCase: any; trim: any; length: number; substr: any; valueOf: any; codePointAt: any; includes: any; endsWith: any; normalize: any; repeat: any; startsWith: any; anchor: any; big: any; blink: any; bold: any; fixed: any; fontcolor: any; fontsize: any; italics: any; link: any; small: any; strike: any; sub: any; sup: any; padStart: any; padEnd: any; trimEnd: any; trimStart: any; trimLeft: any; trimRight: any; matchAll: any; replaceAll: any; at: any; isWellFormed: any; toWellFormed: any; [iterator]: any; [key: number]: string }; path?: PropertyKey[]; message?: string; inst?: { _zod: { version: { major: ...; minor: ...; patch: ... }; def: { type: ...; error?: ...; checks?: ... }; run: any; parse: any; toJSONSchema?: (...) | (...) }; ~standard: { validate: (args: ...) => ...; version: 1; vendor: string; types?: (...) | (...) } } | { _zod: { def: { check: ...; error?: ...; abort?: ...; when?: ... }; issc?: (...) | (...); check: any; onattach: (...)[] } }; continue?: boolean; [key: string]: unknown }]) => string | { message: string } | null | undefined); message?: string }]): NumberBuilder
```
**Properties:**
- `typeKind: "number"` — Parser type discriminator (e.g. `'string'`, `'object'`, `'anyOf'`).
Set by the parser that creates this builder.
- `_int: boolean | { params?: unknown }`
- `_multipleOf: { value: number; params?: unknown } | undefined`
- `_min: { value: number; exclusive: boolean; params?: unknown } | undefined`
- `_max: { value: number; exclusive: boolean; params?: unknown } | undefined`
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
- `int(params?: unknown): this` — Apply integer constraint.
- `multipleOf(value: number, params?: unknown): this` — Apply multipleOf constraint.
- `min(value: number, params?: unknown): this` — Apply minimum constraint (gte by default).
- `max(value: number, params?: unknown): this` — Apply maximum constraint (lte by default).
- `gt(_value: number, _params?: unknown): this` — Number check stubs — satisfies BuilderFor&lt;ZodNumber&gt; for methods not directly used in code generation.
- `gte(_value: number, _params?: unknown): this` — Identical to .min()
- `lt(_value: number, _params?: unknown): this`
- `lte(_value: number, _params?: unknown): this` — Identical to .max()
- `safe(_params?: unknown): this`
- `positive(_params?: unknown): this`
- `negative(_params?: unknown): this`
- `nonnegative(_params?: unknown): this`
- `nonpositive(_params?: unknown): this`
- `step(_value: number, _params?: unknown): this`
- `finite(_params?: unknown): this`
- `base(): string` — Compute the base number schema.
- `modify(baseText: string): string` — Apply all shared modifiers to the base schema string.
This method is called by text() and applies modifiers in a stable order.
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

Note: function is provided as raw code string e.g. `(val) =&gt; val &gt; 0`.
- `superRefine(superRefineFn: string): this` — Apply superRefine modifier.

Note: function is provided as raw code string e.g. `(val, ctx) =&gt; { ... }`.
- `meta(metadata: Record<string, unknown>): this` — Apply meta modifier.
- `transform(transformFn: string): this` — Apply transform modifier.

Note: function is provided as raw code string e.g. `(val) =&gt; transformedVal`.
- `is<K>(type: K): this is TypeKindOf<K>`
- `text(): string` — Unwrap and return the final Zod code string.
This orchestrates the template method pattern: text() = modify(base())
- `toString(): string` — Returns a string representation of an object.
