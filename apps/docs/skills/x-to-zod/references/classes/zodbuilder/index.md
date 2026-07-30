# ZodBuilder

| Class | Description |
|-------|-------------|
| [BaseBuilder](base-builder.md) | BaseBuilder: Abstract base class for all Zod schema builders.
Provides shared modifier methods that apply to all schema types.

Template Method Pattern:
- base(): Computes the type-specific schema string (must be overridden)
- modify(): Applies shared modifiers to the base schema
- text(): Orchestrates base() and modify() to produce final output |
| [BooleanBuilder](boolean-builder.md) | Fluent BooleanBuilder: wraps a Zod boolean schema string and provides chainable methods. |
| [NullBuilder](null-builder.md) | Fluent NullBuilder: wraps a Zod null schema string and provides chainable methods. |
| [ConstBuilder](const-builder.md) | Fluent ConstBuilder: wraps a Zod literal schema string and provides chainable methods. |
| [EnumBuilder](enum-builder.md) | Fluent EnumBuilder: wraps a Zod enum schema string and provides chainable methods. |
| [NumberBuilder](number-builder.md) | Fluent NumberBuilder: wraps a Zod number schema string and provides chainable methods
that delegate to the existing apply* functions.

INFINITY HANDLING - Version Differences:
- Zod v3: z.number() accepts Infinity and -Infinity by default
- Zod v4: z.number() REJECTS Infinity and -Infinity by default (built-in behavior)
  Use z.number().allowInfinity() to permit infinite values in v4

This difference is INHERENT to Zod and not controlled by json-schema-to-zod.
See NUMBER-INFINITY-NOTES.md for migration guidance. |
| [StringBuilder](string-builder.md) | Fluent StringBuilder: wraps a Zod string schema string and provides chainable methods.
Extends StringBuilderBase for shared string methods; adds format-dispatch methods
that return format-specific builders in v4 mode (e.g. email() → EmailBuilder). |
| [ArrayBuilder](array-builder.md) | Fluent ArrayBuilder: wraps a Zod array schema string and provides chainable methods.

NONEMPTY() TYPE INFERENCE - Version Notes:
Both Zod v3 and v4 support .nonempty() with identical validation behavior.
However, type inference differs:
- .nonempty() infers [T, ...T[]] (tuple-like with at least one element)
- .min(1) infers T[] (regular array)

Implementation: ArrayBuilder uses .min(1) instead of .nonempty() for:
1. Consistency across versions
2. Clarity in error messages
3. Alignment with JSON Schema constraints (which don't express tuple constraints)

The validation is functionally identical in both v3 and v4.
See ARRAY-NONEMPTY-NOTES.md for details. |
| [ObjectBuilder](object-builder.md) | Fluent ObjectBuilder: wraps a Zod object schema string and provides chainable methods. |
| [AnyBuilder](any-builder.md) | Fluent AnyBuilder: represents z.any() schema. |
| [NeverBuilder](never-builder.md) | Fluent NeverBuilder: represents z.never() schema. |
| [UnknownBuilder](unknown-builder.md) | Fluent UnknownBuilder: represents z.unknown() schema. |
| [LiteralBuilder](literal-builder.md) | Fluent LiteralBuilder: represents z.literal() schema. |
| [UnionBuilder](union-builder.md) | Fluent UnionBuilder: represents z.union() schema.
Accepts multiple schemas and creates a union type. |
| [IntersectionBuilder](intersection-builder.md) | Fluent IntersectionBuilder: represents z.intersection() schema.
Accepts two schemas and creates an intersection type. |
| [DiscriminatedUnionBuilder](discriminated-union-builder.md) | Fluent DiscriminatedUnionBuilder: represents z.discriminatedUnion() schema.
Accepts a discriminator key and an array of object schemas. |
| [TupleBuilder](tuple-builder.md) | Fluent TupleBuilder: represents z.tuple() schema.
Accepts an array of schemas representing tuple items. |
| [RecordBuilder](record-builder.md) | Fluent RecordBuilder: represents z.record() schema.
Accepts key and value schemas.

KEY SCHEMA REQUIREMENT - Version Differences:
- Zod v3: z.record(valueSchema) with implicit string keys, or z.record(keySchema, valueSchema)
- Zod v4: z.record(keySchema, valueSchema) REQUIRED - single argument form not allowed

Implementation: RecordBuilder ALWAYS uses the two-argument form z.record(keySchema, valueSchema)
for v3/v4 compatibility. This is the safest and most explicit approach.

Typically keySchema is z.string() since JSON object keys are strings.
See RECORD-KEY-SCHEMA-NOTES.md for detailed discussion. |
| [ReferenceBuilder](reference-builder.md) | ReferenceBuilder represents a reference to an external schema in a multi-schema project.
It is used when a $ref points to another schema file and generates the appropriate
import and reference code.

This is a standalone class (not a ZodBuilder subclass) because references are
structural pointers, not Zod schema constructors — they don't map to a z.xxx() call. |
| [VoidBuilder](void-builder.md) | VoidBuilder: represents z.void() |
| [UndefinedBuilder](undefined-builder.md) | UndefinedBuilder: represents z.undefined() |
| [DateBuilder](date-builder.md) | DateBuilder: represents z.date() with optional constraints |
| [BigIntBuilder](big-int-builder.md) | BigIntBuilder: represents z.bigint() with optional constraints |
| [SymbolBuilder](symbol-builder.md) | SymbolBuilder: represents z.symbol() |
| [NaNBuilder](na-n-builder.md) | NaNBuilder: represents z.nan() |
| [SetBuilder](set-builder.md) | SetBuilder: represents z.set() with optional constraints |
| [MapBuilder](map-builder.md) | MapBuilder: represents z.map() with optional constraints |
| [CustomBuilder](custom-builder.md) | CustomBuilder: represents z.custom() for custom validation |
| [PromiseBuilder](promise-builder.md) | PromiseBuilder: represents z.promise(innerType)
Wraps an inner schema for async value validation |
| [LazyBuilder](lazy-builder.md) | LazyBuilder: represents z.lazy(() => schema)
Enables recursive schema definitions |
| [FunctionBuilder](function-builder.md) | FunctionBuilder: represents z.function()
Supports function signature validation with args and returns |
| [CodecBuilder](codec-builder.md) | CodecBuilder: represents z.codec(inSchema, outSchema)
Enables bidirectional data transformations |
| [PreprocessBuilder](preprocess-builder.md) | PreprocessBuilder: represents z.preprocess(transformFn, schema)
Transforms data before validation |
| [PipeBuilder](pipe-builder.md) | PipeBuilder: represents schema.pipe(targetSchema)
This is implemented as a modifier on the base schema rather than a standalone builder
since pipe is called on an existing schema |
| [JsonBuilder](json-builder.md) | JsonBuilder: represents z.json()
Validates JSON-encoded strings |
| [FileBuilder](file-builder.md) | FileBuilder: represents z.file()
Validates file uploads |
| [NativeEnumBuilder](native-enum-builder.md) | NativeEnumBuilder: represents z.enum() in v4 or z.nativeEnum() in v3
Validates against TypeScript native enum values.

In Zod v4, the enum API is unified - both native TypeScript enums and
string literal enums use z.enum(). In v3, native enums use z.nativeEnum(). |
| [TemplateLiteralBuilder](template-literal-builder.md) | TemplateLiteralBuilder: represents z.templateLiteral(parts)
Validates template literal string types |
| [XorBuilder](xor-builder.md) | XorBuilder: represents z.xor(schemas)
Validates exclusive OR - exactly one schema must match |
| [KeyofBuilder](keyof-builder.md) | KeyofBuilder: represents z.keyof(objectSchema)
Extracts keys from an object schema as an enum |
| [EmailBuilder](email-builder.md) | EmailBuilder: represents z.email() in Zod v4.

In v4, email validation is a top-level function that provides better type inference
and tree-shaking compared to v3's z.string().email() method chain. |
| [UrlBuilder](url-builder.md) | UrlBuilder: represents z.url() in Zod v4.

In v4, URL validation is a top-level function that provides better type inference
and tree-shaking compared to v3's z.string().url() method chain. |
| [UuidBuilder](uuid-builder.md) | UuidBuilder: represents z.uuid() or z.guid() in Zod v4.

In v4, UUID/GUID validation is a top-level function that provides better type inference
and tree-shaking compared to v3's z.string().uuid() method chain. |
| [DatetimeBuilder](datetime-builder.md) | DatetimeBuilder: represents z.datetime() in Zod v4.

In v4, datetime validation is a top-level function that provides better type inference
and tree-shaking compared to v3's z.string().datetime() method chain. |
| [TimeBuilder](time-builder.md) | TimeBuilder: represents z.time() in Zod v4.

In v4, time validation is a top-level function that provides better type inference
and tree-shaking compared to v3's z.string().time() method chain. |
| [DurationBuilder](duration-builder.md) | DurationBuilder: represents z.duration() in Zod v4.

In v4, duration validation is a top-level function that provides better type inference
and tree-shaking compared to v3's z.string().duration() method chain. |
| [IpBuilder](ip-builder.md) | IpBuilder: represents z.ip(), z.ipv4(), z.ipv6() in Zod v4.

In v4, IP validation is a top-level function that provides better type inference
and tree-shaking compared to v3's z.string().ip() method chain.

Supports variants: ip (any), ipv4, ipv6, cidrv4, cidrv6 |
| [Base64Builder](base64builder.md) | Base64Builder: represents z.base64() in Zod v4.

In v4, base64 validation is a top-level function that provides better type inference
and tree-shaking compared to v3's z.string().base64() method chain. |
| [EmojiBuilder](emoji-builder.md) | EmojiBuilder: represents z.emoji() in Zod v4.

In v4, emoji validation is a top-level function that provides better type inference
and tree-shaking compared to v3's z.string().emoji() method chain. |
| [CuidBuilder](cuid-builder.md) | CuidBuilder: represents z.cuid() or z.cuid2() in Zod v4.

In v4, CUID validation is a top-level function that provides better type inference
and tree-shaking compared to v3's z.string().cuid() method chain.

Supports both cuid (v1) and cuid2 (v2) variants. |
| [UlidBuilder](ulid-builder.md) | UlidBuilder: represents z.ulid() in Zod v4.

In v4, ULID validation is a top-level function that provides better type inference
and tree-shaking compared to v3's z.string().ulid() method chain. |
| [NanoidBuilder](nanoid-builder.md) | NanoidBuilder: represents z.nanoid() in Zod v4.

In v4, Nano ID validation is a top-level function that provides better type inference
and tree-shaking compared to v3's z.string().nanoid() method chain. |