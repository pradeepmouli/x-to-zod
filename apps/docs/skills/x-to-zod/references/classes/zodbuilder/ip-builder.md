# Classes

## ZodBuilder

### `IpBuilder`
IpBuilder: represents z.ip(), z.ipv4(), z.ipv6() in Zod v4.

In v4, IP validation is a top-level function that provides better type inference
and tree-shaking compared to v3's z.string().ip() method chain.

Supports variants: ip (any), ipv4, ipv6, cidrv4, cidrv6
*extends `StringFormatBuilder<ZodIPv4, [params?: IpParams]>`*
*implements `BuilderFor<ZodIPv4>`*
```ts
constructor(version: "v3" | "v4", variant: "ipv4" | "ipv6" | "cidrv4" | "cidrv6" | "ip", params?: IpParams): IpBuilder
```
**Properties:**
- `typeKind: "ipv4"`
- `_format: { format: string; params?: unknown }` (optional)
- `_pattern: { pattern: string; params?: unknown }` (optional)
- `_minLength: { value: number; params?: unknown }` (optional)
- `_maxLength: { value: number; params?: unknown }` (optional)
- `_base64: { params?: unknown }` (optional)
- `_json: { params?: unknown }` (optional)
- `_pipe: { contentSchema: Builder; params?: unknown }` (optional)
- `_params: [params?: IpParams]` (optional)
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
- `modify(baseText: string): string` — Apply all shared modifiers to the base schema string.
This method is called by text() and applies modifiers in a stable order.
- `text(): string` — Unwrap and return the final Zod code string.
This orchestrates the template method pattern: text() = modify(base())
- `toString(): string` — Returns a string representation of an object.
```typescript
// v4 mode - any IP
const ip = new IpBuilder('ip', { zodVersion: 'v4' });
ip.text(); // => 'z.ip()'

// v4 mode - IPv4 only
const ipv4 = new IpBuilder('ipv4', { zodVersion: 'v4' });
ipv4.text(); // => 'z.ipv4()'

// v4 mode - IPv6 only
const ipv6 = new IpBuilder('ipv6', { zodVersion: 'v4' });
ipv6.text(); // => 'z.ipv6()'
```
