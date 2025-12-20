# Zod v4 Builders Implementation

This document summarizes the implementation of missing Zod v4 builders.

## Implemented Builders

### 1. PromiseBuilder (`z.promise()`)
**File**: `src/ZodBuilder/promise.ts`  
**Purpose**: Validates async values by wrapping an inner type schema  
**Usage**:
```typescript
build.promise(build.string())  // z.promise(z.string())
build.promise(build.number()).optional()  // z.promise(z.number()).optional()
```

### 2. LazyBuilder (`z.lazy()`)
**File**: `src/ZodBuilder/lazy.ts`  
**Purpose**: Enables recursive schema definitions  
**Usage**:
```typescript
build.lazy('() => z.string()')  // z.lazy(() => z.string())
build.lazy('() => nodeSchema')  // z.lazy(() => nodeSchema)
```

### 3. FunctionBuilder (`z.function()`)
**File**: `src/ZodBuilder/function.ts`  
**Purpose**: Validates function signatures with typed args and return values  
**Usage**:
```typescript
build.function()  // z.function()
build.function().returns(build.string())  // z.function().returns(z.string())
build.function()
  .args(build.string(), build.number())
  .returns(build.boolean())  // z.function().args(z.string(),z.number()).returns(z.boolean())
```

### 4. CodecBuilder (`z.codec()`)
**File**: `src/ZodBuilder/codec.ts`  
**Purpose**: Bidirectional data transformations between input and output types  
**Usage**:
```typescript
build.codec(build.string(), build.number())  // z.codec(z.string(),z.number())
```

### 5. PreprocessBuilder (`z.preprocess()`)
**File**: `src/ZodBuilder/preprocess.ts`  
**Purpose**: Transforms data before validation  
**Usage**:
```typescript
build.preprocess('(val) => val.trim()', build.string())  
// z.preprocess((val) => val.trim(),z.string())
```

### 6. PipeBuilder (`.pipe()`)
**File**: `src/ZodBuilder/pipe.ts`  
**Purpose**: Chains schemas for multi-step validation  
**Usage**:
```typescript
build.pipe(build.string(), build.number())  // z.string().pipe(z.number())
```

### 7. JsonBuilder (`z.json()`)
**File**: `src/ZodBuilder/json.ts`  
**Purpose**: Validates JSON-encoded strings  
**Usage**:
```typescript
build.json()  // z.json()
build.json().optional()  // z.json().optional()
```

### 8. FileBuilder (`z.file()`)
**File**: `src/ZodBuilder/file.ts`  
**Purpose**: Validates file uploads  
**Usage**:
```typescript
build.file()  // z.file()
build.file().nullable()  // z.file().nullable()
```

## Architecture

All builders:
- Extend `BaseBuilder` class for consistent modifier support (optional, nullable, describe, brand, readonly, catch, etc.)
- Follow the fluent API pattern allowing method chaining
- Implement the `base()` method to generate type-specific Zod code
- Generate syntactically valid Zod v4 code strings

## Factory Methods

All builders are accessible through the `build` factory object:
```typescript
import { build } from './src/ZodBuilder';

const schema = build.promise(build.string());
const fn = build.function().args(build.number()).returns(build.boolean());
const lazy = build.lazy('() => mySchema');
// ... etc
```

## Test Coverage

All builders have comprehensive test coverage in `test/newBuilders.test.ts`:
- Basic functionality tests
- Tests with modifiers (optional, nullable, etc.)
- Tests with complex nested types
- Tests with method chaining

**Total tests**: 65 tests (all passing)

## Integration

The builders are fully integrated into the existing codebase:
- Exported from `src/ZodBuilder/index.ts`
- Added to the `build` factory object
- Compatible with all existing builders through composition
- Support all BaseBuilder modifiers

## Compliance

✅ All tests passing (65/65)  
✅ Linter passing (0 errors, pre-existing warnings only)  
✅ Follows existing code patterns and conventions  
✅ Complete Zod v4 type coverage for mentioned types
