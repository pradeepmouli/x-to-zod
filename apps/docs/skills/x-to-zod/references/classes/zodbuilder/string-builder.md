# Classes

## ZodBuilder

### `StringBuilder`
Fluent StringBuilder: wraps a Zod string schema string and provides chainable methods.
Extends StringBuilderBase for shared string methods; adds format-dispatch methods
that return format-specific builders in v4 mode (e.g. email() → EmailBuilder).
*extends `StringBuilderBase<ZodString, "string", ParamsFor<"string">>`*
*implements `BuilderFor<ZodString>`*
```ts
constructor(version: "v3" | "v4", params: [params?: string | { error?: string | ((args: [issue: { input: unknown; code: "invalid_type"; expected: "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function" | "array" | "null" | "map" | "int" | "void" | "never" | "date" | "record" | "file" | "tuple" | "set" | "nonoptional" | "nan" | { toString: any; charAt: any; charCodeAt: any; concat: any; indexOf: any; lastIndexOf: any; localeCompare: any; match: any; replace: any; search: any; slice: any; split: any; substring: any; toLowerCase: any; toLocaleLowerCase: any; toUpperCase: any; toLocaleUpperCase: any; trim: any; length: number; substr: any; valueOf: any; codePointAt: any; includes: any; endsWith: any; normalize: any; repeat: any; startsWith: any; anchor: any; big: any; blink: any; bold: any; fixed: any; fontcolor: any; fontsize: any; italics: any; link: any; small: any; strike: any; sub: any; sup: any; padStart: any; padEnd: any; trimEnd: any; trimStart: any; trimLeft: any; trimRight: any; matchAll: any; replaceAll: any; at: any; isWellFormed: any; toWellFormed: any; [iterator]: any; [key: number]: string }; path?: PropertyKey[]; message?: string; inst?: { _zod: { version: { major: ...; minor: ...; patch: ... }; def: { type: ...; error?: ...; checks?: ... }; run: any; parse: any; toJSONSchema?: (...) | (...) }; ~standard: { validate: (args: ...) => ...; version: 1; vendor: string; types?: (...) | (...) } } | { _zod: { def: { check: ...; error?: ...; abort?: ...; when?: ... }; issc?: (...) | (...); check: any; onattach: (...)[] } }; continue?: boolean; [key: string]: unknown }]) => string | { message: string } | null | undefined); message?: string }]): StringBuilder
```
**Properties:**
- `typeKind: "string"`
- `_format: { format: string; params?: unknown }` (optional)
- `_pattern: { pattern: string; params?: unknown }` (optional)
- `_minLength: { value: number; params?: unknown }` (optional)
- `_maxLength: { value: number; params?: unknown }` (optional)
- `_base64: { params?: unknown }` (optional)
- `_json: { params?: unknown }` (optional)
- `_pipe: { contentSchema: Builder; params?: unknown }` (optional)
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
- `email(params?: string | { pattern?: RegExp; abort?: boolean; error?: string | $ZodErrorMap<$ZodIssueInvalidStringFormat>; message?: string }): this` — Apply email format.
In v4 mode without constraints, returns EmailBuilder for top-level z.email().
In v3 mode or with constraints, stays in StringBuilder chain.
- `uuid(params?: string | { abort?: boolean; version?: "v3" | "v4" | "v6" | "v1" | "v2" | "v5" | "v7" | "v8"; error?: string | $ZodErrorMap<$ZodIssueInvalidStringFormat>; message?: string }): this` — Apply uuid format.
In v4 mode without constraints, returns UuidBuilder for top-level z.uuid().
In v3 mode or with constraints, stays in StringBuilder chain.
- `url(params?: string | { normalize?: boolean; pattern?: RegExp; abort?: boolean; hostname?: RegExp; protocol?: RegExp; error?: string | $ZodErrorMap<$ZodIssueInvalidStringFormat>; message?: string }): this` — Apply url format.
In v4 mode without constraints, returns UrlBuilder for top-level z.url().
In v3 mode or with constraints, stays in StringBuilder chain.
- `httpUrl(params?: unknown): this` — Apply http/https URL format.
- `hostname(params?: unknown): this` — Apply hostname format.
- `emoji(params?: string | { pattern?: RegExp; abort?: boolean; error?: string | $ZodErrorMap<$ZodIssueInvalidStringFormat>; message?: string }): this` — Apply emoji format (single emoji character).
In v4 mode without constraints, returns EmojiBuilder for top-level z.emoji().
In v3 mode or with constraints, stays in StringBuilder chain.
- `base64url(params?: string | { abort?: boolean; error?: string | $ZodErrorMap<$ZodIssueInvalidStringFormat>; message?: string }): this` — Apply base64url format.
- `hex(params?: unknown): this` — Apply hex format.
- `jwt(params?: string | { abort?: boolean; alg?: JWTAlgorithm; error?: string | $ZodErrorMap<$ZodIssueInvalidStringFormat>; message?: string }): this` — Apply JWT format.
- `nanoid(params?: string | { pattern?: RegExp; abort?: boolean; error?: string | $ZodErrorMap<$ZodIssueInvalidStringFormat>; message?: string }): this` — Apply nanoid format.
In v4 mode without constraints, returns NanoidBuilder for top-level z.nanoid().
In v3 mode or with constraints, stays in StringBuilder chain.
- `cuid(params?: string | { pattern?: RegExp; abort?: boolean; error?: string | $ZodErrorMap<$ZodIssueInvalidStringFormat>; message?: string }): this` — Apply cuid format.
In v4 mode without constraints, returns CuidBuilder for top-level z.cuid().
In v3 mode or with constraints, stays in StringBuilder chain.
- `cuid2(params?: string | { pattern?: RegExp; abort?: boolean; error?: string | $ZodErrorMap<$ZodIssueInvalidStringFormat>; message?: string }): this` — Apply cuid2 format.
In v4 mode without constraints, returns CuidBuilder for top-level z.cuid2().
In v3 mode or with constraints, stays in StringBuilder chain.
- `ulid(params?: string | { pattern?: RegExp; abort?: boolean; error?: string | $ZodErrorMap<$ZodIssueInvalidStringFormat>; message?: string }): this` — Apply ulid format.
In v4 mode without constraints, returns UlidBuilder for top-level z.ulid().
In v3 mode or with constraints, stays in StringBuilder chain.
- `ipv4(params?: unknown): this` — Apply IPv4 format.
In v4 mode without constraints, returns IpBuilder for top-level z.ipv4().
In v3 mode or with constraints, stays in StringBuilder chain.
- `ipv6(params?: unknown): this` — Apply IPv6 format.
In v4 mode without constraints, returns IpBuilder for top-level z.ipv6().
In v3 mode or with constraints, stays in StringBuilder chain.
- `mac(params?: unknown): this` — Apply MAC address format.
- `cidrv4(params?: string | { abort?: boolean; version?: "v4"; error?: string | $ZodErrorMap<$ZodIssueInvalidStringFormat>; message?: string }): this` — Apply IPv4 CIDR block format.
- `cidrv6(params?: string | { abort?: boolean; version?: "v6"; error?: string | $ZodErrorMap<$ZodIssueInvalidStringFormat>; message?: string }): this` — Apply IPv6 CIDR block format.
- `hash(algorithm: "md5" | "sha1" | "sha256" | "sha384" | "sha512", params?: unknown): this` — Apply hash format with algorithm.
- `isoDate(params?: string | { abort?: boolean; error?: string | $ZodErrorMap<$ZodIssueInvalidStringFormat>; message?: string }): this` — Apply ISO date format.
Note: In Zod v4, maps to z.date() for ISO 8601 date strings.
- `isoTime(params?: string | { abort?: boolean; precision?: number | null; error?: string | $ZodErrorMap<$ZodIssueInvalidStringFormat>; message?: string }): this` — Apply ISO time format.
Note: In Zod v4, maps to z.time() for ISO 8601 time strings.
- `isoDatetime(params?: string | { abort?: boolean; precision?: number | null; offset?: boolean; local?: boolean; error?: string | $ZodErrorMap<$ZodIssueInvalidStringFormat>; message?: string }): this` — Apply ISO datetime format.
Note: In Zod v4, maps to z.datetime() for ISO 8601 datetime strings.
- `isoDuration(params?: string | { pattern?: RegExp; abort?: boolean; error?: string | $ZodErrorMap<$ZodIssueInvalidStringFormat>; message?: string }): this` — Apply ISO duration format.
Note: In Zod v4, maps to z.duration() for ISO 8601 duration strings.
- `uuidv4(params?: string | { abort?: boolean; version?: "v3" | "v4" | "v6" | "v1" | "v2" | "v5" | "v7" | "v8"; error?: string | $ZodErrorMap<$ZodIssueInvalidStringFormat>; message?: string }): this` — Apply UUIDv4 format.
- `uuidv6(params?: string | { abort?: boolean; version?: "v3" | "v4" | "v6" | "v1" | "v2" | "v5" | "v7" | "v8"; error?: string | $ZodErrorMap<$ZodIssueInvalidStringFormat>; message?: string }): this` — Apply UUIDv6 format.
- `uuidv7(params?: string | { abort?: boolean; version?: "v3" | "v4" | "v6" | "v1" | "v2" | "v5" | "v7" | "v8"; error?: string | $ZodErrorMap<$ZodIssueInvalidStringFormat>; message?: string }): this` — Apply UUIDv7 format.
- `base64(params?: string | { abort?: boolean; error?: string | $ZodErrorMap<$ZodIssueInvalidStringFormat>; message?: string }): this` — Apply base64 encoding constraint.
In v4 mode without other constraints, returns Base64Builder for top-level z.base64().
In v3 mode or with other constraints, stays in StringBuilder chain.
- `base(): string` — Compute the base string schema.
- `modify(baseText: string): string` — Apply all shared modifiers to the base schema string.
This method is called by text() and applies modifiers in a stable order.
- `hasConstraints(): boolean` — Check if this builder has any constraints applied.
- `format(format: string, params?: unknown): this` — Apply format constraint.
- `regex(pattern: string | RegExp, params?: unknown): this` — Apply regex pattern constraint.
- `min(value: number, params?: unknown): this` — Apply minLength constraint.
- `max(value: number, params?: unknown): this` — Apply maxLength constraint.
- `json(params?: unknown): this` — Apply JSON transform.
- `pipe(contentSchema: Builder, params?: unknown): this` — Apply pipe with parsed content schema.
- `includes(_value: string, _params?: unknown): this`
- `startsWith(_value: string, _params?: unknown): this`
- `endsWith(_value: string, _params?: unknown): this`
- `length(_len: number, _params?: unknown): this`
- `nonempty(_params?: unknown): this`
- `lowercase(_params?: unknown): this`
- `uppercase(_params?: unknown): this`
- `trim(): this`
- `normalize(_form?: string): this`
- `toLowerCase(): this`
- `toUpperCase(): this`
- `slugify(): this`
- `ip(_params?: unknown): this`
- `safe(_params?: unknown): this`
- `datetime(_params?: unknown): this`
- `time(_params?: unknown): this`
- `date(_params?: unknown): this`
- `duration(_params?: unknown): this`
- `guid(_params?: unknown): this`
- `xid(_params?: unknown): this`
- `ksuid(_params?: unknown): this`
- `e164(_params?: unknown): this`
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
