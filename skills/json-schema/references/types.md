# Types & Enums

## Types

### `JSONSchema`
```ts
JSONSchemaMap<T, V>[Version]
```

### `SchemaVersion`
```ts
"2020-12" | "2019-09" | "07" | "OpenAPI3.0" | "OpenAPI3.1"
```

### `TypeValue`
```ts
"object" | "array" | "string" | "number" | "integer" | "boolean" | "null" | "any"
```

### `transformer`
```ts
(schema: JSONSchema<Version, T, V>, refs: any) => JSONSchema<Version, T, TypeValue> | undefined
```
