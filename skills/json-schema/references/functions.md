# Functions

## `select`
```ts
select<S>(schema: JSONSchema<S, any, TypeValue>): ((schema: JSONSchemaAny<Version>, refs: Context, blockMeta?: boolean) => Builder) | ((schema: SchemaNode & { type?: string }, refs: Context) => Builder)
```
**Parameters:**
- `schema: JSONSchema<S, any, TypeValue>` — 
**Returns:** `((schema: JSONSchemaAny<Version>, refs: Context, blockMeta?: boolean) => Builder) | ((schema: SchemaNode & { type?: string }, refs: Context) => Builder)`
