# Behavioral Snapshot: Parser Class Architecture Refactor

**Refactor ID**: refactor-008
**Captured**: 2025-12-30
**Purpose**: Document key behaviors that must be preserved before and after refactoring

## Key Behaviors to Preserve

### 1. Basic Type Parsing
- `{ type: "string" }` → `z.string()`
- `{ type: "number" }` → `z.number()`
- `{ type: "boolean" }` → `z.boolean()`
- `{ type: "null" }` → `z.null()`

### 2. Object Schema Parsing
- Required properties remain non-optional
- Optional properties get `.optional()`
- `additionalProperties: false` applies `.strict()`

### 3. Array Schema Parsing
- Simple arrays: `z.array(itemType)`
- Tuple arrays: `z.tuple([type1, type2, ...])`
- `minItems`, `maxItems` applied correctly

### 4. Circular References
- Self-references detected and wrapped with `.lazy()`
- Mutual references handled correctly
- No infinite recursion

### 5. Metadata Application
- Descriptions: `.describe("...")`
- Defaults: `.default(value)`
- Examples preserved
- All metadata in correct order

### 6. Combinator Operators
- `anyOf` → `z.union([...])`
- `allOf` → `z.intersection([...])`
- `oneOf` → discriminator or union behavior

### 7. String Formats
- `format: "email"` → `.email()`
- `format: "uuid"` → `.uuid()`
- `format: "date-time"` → `.datetime()`

### 8. Enum/Const
- `enum` → `z.enum([...])`
- `const` → `z.literal(...)`

### 9. String Constraints
- `minLength` → `.min(n)`
- `maxLength` → `.max(n)`
- `pattern` → `.regex(...)`

### 10. Number Constraints
- `minimum` → `.min(n)`
- `maximum` → `.max(n)`
- `multipleOf` → `.multipleOf(n)`

## Verification Checklist

- [ ] Pre-refactoring baseline generated
- [ ] All test cases documented
- [ ] Post-refactoring output verified identical
- [ ] All observable behaviors preserved
- [ ] Test suite 100% pass rate maintained

---

*This document ensures behavior preservation throughout the refactoring process.*
