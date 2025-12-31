# Refactor 008: Design Decisions

**Date**: December 30, 2025
**Status**: ✅ All Open Questions Resolved

---

## Design Decisions Summary

### 1. Path-Based Filtering ✅ RESOLVED

**Decision**: Always use filtering with hierarchical/cascading behavior

**Details**:
- Type-based filtering: Always active using `canProduceType()` checks
- Path-based filtering: Hierarchical cascading - if parent path doesn't match, processor is NOT passed to children
- This ensures efficient filtering without redundant checks at every level

**Implementation**:
```typescript
protected createChildContext(path: string): Context {
  // Only pass processors that:
  // 1. Match parent path (hierarchical)
  // 2. Could apply to child types
  const childProcessors = this.processors.filter(p => {
    const config = this.getProcessorConfig(p);
    if (config.pathPattern && !matchesPath(parentPath, config.pathPattern)) {
      return false; // Parent didn't match - don't pass to child
    }
    return true;
  });

  return { ...this.refs, processors: childProcessors };
}
```

**Rationale**:
- Efficient: No need to check path patterns repeatedly in children if parent failed
- Intuitive: `properties.**` naturally cascades down the tree
- Performance: Reduces processor checking overhead in deep schemas

---

### 2. Brand Checks / Type Verification ✅ RESOLVED

**Decision**: Use generic type parameters to enforce brand = expected type at compile time

**Details**:
- No runtime brand checks needed
- TypeScript generics enforce type safety
- Compile-time verification prevents type mismatches

**Implementation**:
```typescript
type PostProcessor<TBuilder extends ZodBuilder> = (
  builder: TBuilder,
  context: PostProcessorContext
) => TBuilder | undefined;

type PostProcessorConfig<TBuilder extends ZodBuilder> = {
  processor: PostProcessor<TBuilder>;
  typeFilter?: BuilderType | BuilderType[];
  pathPattern?: string;
};

// Usage:
const objectProcessor: PostProcessor<ObjectBuilder> = (builder, ctx) => {
  return builder.strict(); // TypeScript enforces return type matches input
};

const config: PostProcessorConfig<ObjectBuilder> = {
  processor: objectProcessor,
  typeFilter: 'ObjectBuilder', // Must match generic parameter
};
```

**Rationale**:
- Type safety at compile time (no runtime overhead)
- Prevents accidental type mismatches
- Clear developer intent through generics
- No dependency on Zod internals (no `._def.typeName` checks)

---

### 3. Backward Compatibility ✅ RESOLVED

**Decision**: No backward compatibility except for `zodToJsonSchema` and `parserOverride`

**Breaking Changes**:
```typescript
// ❌ OLD API (removed)
parseString(schema);
parseNumber(schema);
parseObject(schema);
parseArray(schema);
parseBoolean(schema);
parseNull(schema);
parseAnyOf(schema);
parseAllOf(schema);
parseOneOf(schema);
```

**Preserved APIs**:
```typescript
// ✅ PRESERVED - main entry point
jsonSchemaToZod(schema, options);

// ✅ PRESERVED - custom parser logic
jsonSchemaToZod(schema, {
  parserOverride: (schema) => customLogic(schema)
});

// ✅ PRESERVED - reverse conversion (if exists)
zodToJsonSchema(zodSchema);
```

**Migration Path**:
```typescript
// Old way (removed):
const builder = parseString(schema);

// New way - Option 1 (class-based):
const builder = new StringParser(schema, refs).parse();

// New way - Option 2 (symmetric API):
const builder = parse.string(schema, refs);
```

**Rationale**:
- Clean break allows better architecture
- Main entry point unchanged = minimal user impact
- `parserOverride` preserves extensibility
- `zodToJsonSchema` is separate tool (must remain compatible)
- Migration is straightforward (1:1 mapping)

---

### 4. Parser Extensibility ⏸️ DEFERRED

**Decision**: Not in initial implementation, can be added later

**Rationale**:
- Focus on internal refactor first
- Can expose `BaseParser` as public API in future if needed
- No user requests for custom parsers yet
- Refactor architecture supports this if needed later

---

## Implementation Notes

### Hierarchical Path Filtering Example

```typescript
// Processor config:
{
  processor: addBrand,
  pathPattern: 'properties.user.**'
}

// Schema tree:
root
└── properties
    ├── user         ← Matches! Pass processor to children
    │   ├── name     ← Inherits processor (parent matched)
    │   └── email    ← Inherits processor (parent matched)
    └── admin        ← Doesn't match, processor NOT passed to children
        └── role     ← No processor (parent didn't match)
```

### Type Safety with Generics

```typescript
// ✅ Compile-time type safety
const strictObjects: PostProcessor<ObjectBuilder> = (builder) => {
  return builder.strict(); // OK - returns ObjectBuilder
};

// ❌ Compile error - type mismatch
const badProcessor: PostProcessor<ObjectBuilder> = (builder) => {
  return builder.nonempty(); // ERROR - nonempty() doesn't exist on ObjectBuilder
};

// ✅ Type filter must match generic
const config: PostProcessorConfig<ObjectBuilder> = {
  processor: strictObjects,
  typeFilter: 'ObjectBuilder', // Must match or compile error
};
```

---

## Sign-Off

| Decision | Status | Date | Approver |
|----------|--------|------|----------|
| Path Filtering | ✅ Resolved | 2025-12-30 | User |
| Brand Checks | ✅ Resolved | 2025-12-30 | User |
| Backward Compat | ✅ Resolved | 2025-12-30 | User |
| Parser Extensibility | ⏸️ Deferred | 2025-12-30 | User |

**All critical design decisions finalized. Ready for implementation.** ✅
