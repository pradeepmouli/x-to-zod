# Post-Processing Guide

Post-processors are powerful hooks that allow you to transform Zod builders after schema parsing. They enable custom validations, constraints, and modifications without altering the original JSON Schema.

## Concept

A post-processor is a function that receives a `ZodBuilder` and returns a modified `ZodBuilder` (or `undefined` to preserve the original).

```typescript
type PostProcessor = (
  builder: BaseBuilder,
  context: PostProcessorContext
) => BaseBuilder | undefined;
```

## Use Cases

Post-processors are ideal for:

- **Organization-wide standards**: Apply company-specific validation rules
- **Security hardening**: Add strict mode to all objects, non-empty arrays
- **Consistency enforcement**: Lowercase emails, trim strings, etc.
- **Custom constraints**: Add validation rules not expressible in JSON Schema
- **Metadata enhancement**: Add custom error messages, brands, transforms

## PostProcessorContext Interface

Each post-processor receives context about the current parsing state:

```typescript
interface PostProcessorContext {
  path: (string | number)[];  // Current path in schema (e.g., ['user', 'address', 'street'])
  schema: JsonSchema;          // The JSON Schema being parsed
  build: BuildFunctions;       // Builder factory (buildV3 or buildV4)
}
```

### Context Fields

- **`path`**: Array representing the current location in the schema tree
  - Root: `[]`
  - Property: `['user', 'email']`
  - Array item: `['items', 0]`
  
- **`schema`**: The original JSON Schema for this node
  - Use to inspect schema properties
  - Make decisions based on schema metadata
  
- **`build`**: Builder factory for creating new builders
  - Use `context.build.string()` instead of hardcoding `z.string()`
  - Ensures compatibility with target Zod version

## Basic Usage

### Simple Post-Processor

```typescript
import { jsonSchemaToZod } from 'x-to-zod';

const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' }
  }
};

const result = jsonSchemaToZod(schema, {
  postProcessors: [
    (builder) => {
      // Return modified builder or undefined to preserve original
      return builder;
    }
  ]
});
```

### With Type Guards

```typescript
import { is } from 'x-to-zod/utils';

const result = jsonSchemaToZod(schema, {
  postProcessors: [
    (builder) => {
      if (is.objectBuilder(builder)) {
        return builder.strict();  // TypeScript knows builder is ObjectBuilder
      }
      return builder;
    }
  ]
});
```

## Type Filtering

Post-processors can target specific builder types using the `typeFilter` option:

```typescript
import type { PostProcessorConfig } from 'x-to-zod';
import { is } from 'x-to-zod/utils';

const result = jsonSchemaToZod(schema, {
  postProcessors: [
    {
      processor: (builder) => {
        // Only called for ObjectBuilder instances
        return builder.strict();
      },
      typeFilter: 'object'
    }
  ]
});
```

### Available Type Filters

- `'object'`: ObjectBuilder instances
- `'array'`: ArrayBuilder instances
- `'string'`: StringBuilder instances
- `'number'`: NumberBuilder instances
- `'boolean'`: BooleanBuilder instances
- Array of types: `['object', 'array']`

### Type Filter Matching

Type filters match against:
1. Parser's `typeKind` (e.g., `'object'`)
2. Builder class name (e.g., `'ObjectBuilder'`)

```typescript
class ObjectParser extends BaseParser<'object'> {
  canProduceType(type: string): boolean {
    return type === 'object' || type === 'ObjectBuilder';
  }
}
```

## Path Filtering

Filter processors by schema path using `pathPattern`:

```typescript
const result = jsonSchemaToZod(schema, {
  postProcessors: [
    {
      processor: (builder) => builder.strict(),
      pathPattern: 'user.address'  // Only applies to user.address
    },
    {
      processor: (builder) => builder,
      pathPattern: '*'  // Applies to all paths
    },
    {
      processor: (builder) => builder,
      pathPattern: ['user', 'order']  // Multiple patterns
    }
  ]
});
```

**Note**: Path pattern matching is an exact match. Wildcards and regex patterns are not currently supported beyond the `'*'` pattern.

## Practical Examples

### Example 1: Make All Objects Strict

Prevent additional properties on all objects:

```typescript
import { is } from 'x-to-zod/utils';
import type { PostProcessorConfig } from 'x-to-zod';

const strictObjects: PostProcessorConfig = {
  processor: (builder) => {
    if (is.objectBuilder(builder)) {
      return builder.strict();
    }
    return builder;
  },
  typeFilter: 'object'
};

const result = jsonSchemaToZod(schema, {
  postProcessors: [strictObjects]
});

// Generated code:
// z.object({ ... }).strict()
```

### Example 2: Lowercase Email Fields

Automatically lowercase email strings:

```typescript
const lowercaseEmails: PostProcessorConfig = {
  processor: (builder, context) => {
    // Check if schema has email format
    if (
      typeof context.schema === 'object' &&
      context.schema.format === 'email' &&
      is.stringBuilder(builder)
    ) {
      // Add transform to lowercase
      return builder.transform('(email) => email.toLowerCase()');
    }
    return builder;
  },
  typeFilter: 'string'
};

const schema = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email' }
  }
};

const result = jsonSchemaToZod(schema, {
  postProcessors: [lowercaseEmails]
});

// Generated code:
// z.object({
//   "email": z.string().email().transform((email) => email.toLowerCase())
// })
```

### Example 3: Require Non-Empty Arrays

Ensure all arrays have at least one element:

```typescript
const nonemptyArrays: PostProcessorConfig = {
  processor: (builder) => {
    if (is.arrayBuilder(builder)) {
      return builder.min(1);
    }
    return builder;
  },
  typeFilter: 'array'
};

const schema = {
  type: 'object',
  properties: {
    tags: { type: 'array', items: { type: 'string' } },
    ids: { type: 'array', items: { type: 'number' } }
  }
};

const result = jsonSchemaToZod(schema, {
  postProcessors: [nonemptyArrays]
});

// Generated code:
// z.object({
//   "tags": z.array(z.string()).min(1).optional(),
//   "ids": z.array(z.number()).min(1).optional()
// })
```

### Example 4: Custom Validation Messages

Add custom error messages based on schema context:

```typescript
const customMessages: PostProcessorConfig = {
  processor: (builder, context) => {
    const schema = context.schema;
    const path = context.path.join('.');
    
    // Add custom message for required fields
    if (is.stringBuilder(builder) && path === 'user.email') {
      return builder.min(1, { message: 'Email is required' });
    }
    
    if (is.numberBuilder(builder) && path === 'order.amount') {
      return builder.positive({ message: 'Amount must be positive' });
    }
    
    return builder;
  }
};

const result = jsonSchemaToZod(schema, {
  postProcessors: [customMessages]
});
```

### Example 5: Brand Types

Add branding to specific types for nominal typing:

```typescript
const brandTypes: PostProcessorConfig = {
  processor: (builder, context) => {
    const path = context.path.join('.');
    
    // Brand user IDs
    if (is.stringBuilder(builder) && path.endsWith('.userId')) {
      return builder.brand('UserId');
    }
    
    // Brand order IDs
    if (is.stringBuilder(builder) && path.endsWith('.orderId')) {
      return builder.brand('OrderId');
    }
    
    return builder;
  },
  typeFilter: 'string'
};

// Generated code:
// z.string().brand<'UserId'>()
```

### Example 6: Conditional Constraints

Apply constraints based on schema properties:

```typescript
const conditionalConstraints: PostProcessorConfig = {
  processor: (builder, context) => {
    const schema = context.schema;
    
    if (typeof schema === 'object' && schema.description) {
      // If description mentions "password", add min length
      if (schema.description.toLowerCase().includes('password')) {
        if (is.stringBuilder(builder)) {
          return builder.min(8);
        }
      }
      
      // If description mentions "positive", add constraint
      if (schema.description.toLowerCase().includes('positive')) {
        if (is.numberBuilder(builder)) {
          return builder.positive();
        }
      }
    }
    
    return builder;
  }
};

const schema = {
  type: 'object',
  properties: {
    password: {
      type: 'string',
      description: 'User password (must be strong)'
    },
    amount: {
      type: 'number',
      description: 'Must be a positive number'
    }
  }
};

const result = jsonSchemaToZod(schema, {
  postProcessors: [conditionalConstraints]
});

// Generated code:
// z.object({
//   "password": z.string().min(8).optional(),
//   "amount": z.number().positive().optional()
// })
```

## Multiple Processors

Process builders in sequence:

```typescript
const result = jsonSchemaToZod(schema, {
  postProcessors: [
    // 1. Make objects strict
    {
      processor: (builder) => is.objectBuilder(builder) ? builder.strict() : builder,
      typeFilter: 'object'
    },
    
    // 2. Require non-empty arrays
    {
      processor: (builder) => is.arrayBuilder(builder) ? builder.min(1) : builder,
      typeFilter: 'array'
    },
    
    // 3. Add custom validation
    (builder, context) => {
      // Custom logic here
      return builder;
    }
  ]
});
```

### Execution Order

Processors execute in array order:
1. First processor receives original builder
2. Second processor receives result of first
3. Third processor receives result of second
4. etc.

## Returning Undefined

Return `undefined` to preserve the original builder:

```typescript
const conditionalProcessor: PostProcessor = (builder, context) => {
  // Only modify if condition is met
  if (someCondition) {
    return builder.optional();
  }
  
  // Preserve original
  return undefined;
};
```

## Function vs Config Form

Post-processors can be plain functions or config objects:

```typescript
// Function form (no filtering)
const processor1: PostProcessor = (builder) => builder;

// Config form (with filtering)
const processor2: PostProcessorConfig = {
  processor: (builder) => builder,
  typeFilter: 'object',
  pathPattern: 'user'
};

// Mixed usage
const result = jsonSchemaToZod(schema, {
  postProcessors: [
    processor1,  // Applied to all
    processor2,  // Filtered by type and path
  ]
});
```

## Best Practices

### 1. Use Type Guards

Always use type guards for type-safe builder access:

```typescript
// ✅ Good
if (is.objectBuilder(builder)) {
  return builder.strict();
}

// ❌ Bad - no type safety
return (builder as any).strict();
```

### 2. Return Undefined for No-Op

Return `undefined` when not modifying:

```typescript
// ✅ Good
if (!shouldModify) {
  return undefined;  // Preserves original
}

// ❌ Bad - creates unnecessary chaining
if (!shouldModify) {
  return builder;  // Still applies chain
}
```

### 3. Use Type Filters for Performance

Filter by type to avoid unnecessary checks:

```typescript
// ✅ Good - only runs for objects
{
  processor: (builder) => builder.strict(),
  typeFilter: 'object'
}

// ❌ Bad - runs for all types
(builder) => {
  if (is.objectBuilder(builder)) {
    return builder.strict();
  }
  return builder;
}
```

### 4. Check Schema Properties Safely

Always check schema type before accessing properties:

```typescript
// ✅ Good
if (typeof context.schema === 'object' && context.schema.format === 'email') {
  // Safe to access format
}

// ❌ Bad - may throw if schema is boolean
if (context.schema.format === 'email') {
  // Error if schema is true/false
}
```

### 5. Document Processor Purpose

Add comments explaining processor intent:

```typescript
const processors = [
  // Security: Prevent additional properties on all objects
  {
    processor: (builder) => is.objectBuilder(builder) ? builder.strict() : builder,
    typeFilter: 'object'
  },
  
  // Data Quality: Ensure arrays are non-empty
  {
    processor: (builder) => is.arrayBuilder(builder) ? builder.min(1) : builder,
    typeFilter: 'array'
  }
];
```

## Debugging Tips

### Log Context Information

```typescript
const debugProcessor: PostProcessor = (builder, context) => {
  console.log('Path:', context.path.join('.'));
  console.log('Schema:', context.schema);
  console.log('Builder type:', builder.constructor.name);
  return builder;
};
```

### Check Processor Execution

```typescript
let executionCount = 0;

const countingProcessor: PostProcessor = (builder) => {
  executionCount++;
  console.log(`Processor called ${executionCount} times`);
  return builder;
};
```

## Limitations

1. **Path Pattern Matching**: Currently supports exact match and `'*'` wildcard only
2. **Builder Type Detection**: Relies on `canProduceType()` method implementation
3. **Circular References**: Processors run on already-visited nodes
4. **Performance**: Many processors can impact parsing performance

## Related Documentation

- [Parser Architecture](./parser-architecture.md) - Understanding the class-based parser system
- [API Reference](./API.md) - Complete API documentation
- [Migration Guide](./migration-parser-classes.md) - Contributor migration guide

## Examples Repository

For more examples, see:
- `test/postProcessors.test.ts` - Comprehensive test suite
- `examples/` - Additional usage examples (if available)
