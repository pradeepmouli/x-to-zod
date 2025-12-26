# Zod v3 vs v4 Behavioral Differences

This document outlines key behavioral differences between Zod v3 and v4 that affect code generation in json-schema-to-zod.

## Optional Field Defaults

### Zod v3 Behavior
In Zod v3, when a field is marked as `.optional()`, the `default()` value is **NOT automatically applied**. You must explicitly call `.default()` after `.optional()` to get default value behavior:

```typescript
// Zod v3
const schema = z.object({
  name: z.string().optional(),           // undefined allowed, no default
  age: z.string().optional().default(0), // undefined replaced with 0
});

schema.parse({ name: undefined });      // { name: undefined }
schema.parse({ name: undefined, age: undefined }); // { name: undefined, age: 0 }
```

### Zod v4 Behavior
In Zod v4, when a field is marked as `.optional()`, the default value **IS automatically applied**. The `.optional()` modifier now implies a default of `undefined`:

```typescript
// Zod v4
const schema = z.object({
  name: z.string().optional(),           // undefined allowed AND defaulted to undefined
  age: z.string().optional().default(0), // undefined replaced with 0
});

schema.parse({});                      // { name: undefined }
schema.parse({ name: undefined });     // { name: undefined }
schema.parse({ age: undefined });      // { name: undefined, age: 0 }
```

**Key Difference**: In v4, `.optional()` adds the field to the output even when not provided, setting it to `undefined`. In v3, optional fields that aren't provided are simply omitted from the output.

### Impact on json-schema-to-zod

When generating code from JSON Schema:

1. **For v3 mode** (`zodVersion: 'v3'`):
   - Optional properties without defaults generate: `z.string().optional()`
   - Optional properties with defaults generate: `z.string().optional().default(value)`
   - Missing optional fields are **omitted** from parsed output

2. **For v4 mode** (`zodVersion: 'v4'`):
   - Optional properties without defaults generate: `z.string().optional()`
   - Optional properties with defaults generate: `z.string().optional().default(value)`
   - Missing optional fields are **included** in parsed output as `undefined`

### JSON Schema Example

Given this JSON Schema:

```json
{
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "age": { "type": "number", "default": 18 }
  },
  "required": ["name"]
}
```

**Generated Zod v3 code**:
```typescript
z.object({
  name: z.string(),
  age: z.number().optional().default(18)
})
```

**Generated Zod v4 code** (same):
```typescript
z.object({
  name: z.string(),
  age: z.number().optional().default(18)
})
```

**Behavioral difference**:
- v3: `{ name: "Alice" }` → `{ name: "Alice" }` (age omitted)
- v4: `{ name: "Alice" }` → `{ name: "Alice", age: undefined }` (age present as undefined, then defaulted to 18)

### Migration Recommendation

When migrating from v3 to v4:

1. **If you rely on optional fields being omitted** from output when not provided, you may need to adjust your validation or parsing logic.

2. **If you explicitly check for missing properties** (e.g., `'age' in obj`), be aware that in v4 this will always be `true` for optional fields.

3. **Use `.nullish()` instead of `.optional()`** if you want v3-like behavior where the field can be truly absent:
   ```typescript
   // Similar to v3 optional behavior
   z.object({
     name: z.string().nullish()  // Can be undefined, null, or omitted
   })
   ```

### Code Generation Configuration

json-schema-to-zod respects the `zodVersion` configuration option. Set `zodVersion: 'v3'` to generate code compatible with Zod v3 behavior, or `zodVersion: 'v4'` (default) for v4 behavior.

```typescript
import { jsonSchemaToZod } from 'json-schema-to-zod';

const zodCode = jsonSchemaToZod(schema, {
  zodVersion: 'v3', // Generate v3-compatible code
});
```

## Other Behavioral Differences

### Number: Infinity Handling
- **v3**: Numbers accept `Infinity` and `-Infinity` by default
- **v4**: Numbers reject `Infinity` and `-Infinity` by default (use `.allowInfinity()` to permit)

### Record: Key Schema Requirement
- **v3**: `z.record(valueSchema)` (key defaults to string)
- **v4**: `z.record(keySchema, valueSchema)` (key schema required)

### Enum: Unified API
- **v3**: `z.nativeEnum(MyEnum)` for TypeScript enums
- **v4**: `z.enum(MyEnum)` unified API for all enums

For complete details on v4 changes, see: https://zod.dev/v4/changelog
