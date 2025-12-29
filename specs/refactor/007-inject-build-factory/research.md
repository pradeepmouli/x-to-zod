# Phase 0 Research: Dependency Injection for Build Factory

## Problem Statement

Current architecture uses runtime detection to distinguish between Options and params in factory functions. This creates complexity and fragility:

```typescript
const isOptions = paramsOrOptions && typeof paramsOrOptions === 'object' &&
  ('zodVersion' in paramsOrOptions || 'seen' in paramsOrOptions || 'path' in paramsOrOptions);
```

**Issues**:
- Complex runtime checks prone to edge cases
- Mixed concerns (version selection + param handling)
- Difficult to test and maintain
- Version decision made repeatedly in every factory call

## Unknowns and Resolutions

### Unknown: Where to inject the build factory?

**Decision**: Inject build factory into Context type at entry point
**Rationale**:
- Context is already passed through all parsers
- Natural place for shared dependencies
- Minimal changes to parser signatures
- Aligns with dependency injection patterns

**Alternatives Considered**:
1. Global variable: Rejected - not testable, causes coupling
2. Module-level injection: Rejected - complex initialization
3. Parser-level parameter: Rejected - requires signature changes everywhere
4. Context property: **SELECTED** - clean, testable, minimal changes

### Unknown: How to structure v3/v4 factories?

**Decision**: Create separate v3.ts and v4.ts files with buildV3 and buildV4 objects
**Rationale**:
- Clear separation of version-specific logic
- Easy to add new versions (just create new file)
- No conditional logic in factory implementations
- Each factory file is self-contained

**Alternatives Considered**:
1. Single factory with version parameter: Rejected - still mixed logic
2. Factory generator function: Rejected - over-engineering
3. Separate files: **SELECTED** - cleanest separation

**Structure**:
```typescript
// v3.ts
export const buildV3 = {
  string: (params?) => new StringBuilder(params, 'v3'),
  number: (params?) => new NumberBuilder(params, 'v3'),
  // ... all other builders
};

// v4.ts
export const buildV4 = {
  string: (params?) => new StringBuilder(params, 'v4'),
  number: (params?) => new NumberBuilder(params, 'v4'),
  // ... all other builders
};
```

### Unknown: How to update builder constructors?

**Decision**: Change from `(params?, options?: Options)` to `(params?, version?: 'v3' | 'v4')`
**Rationale**:
- Simpler signature - only two parameters
- Version string is explicit and type-safe
- Removes dependency on Options type
- Builders don't need full Options object, only version

**Alternatives Considered**:
1. Keep Options parameter: Rejected - unnecessary dependency
2. Version enum: Rejected - string literal is simpler
3. Version string: **SELECTED** - explicit, simple, type-safe

**Impact**:
- 8+ builder files need constructor updates
- Mechanical change, low risk
- Better separation of concerns

### Unknown: How to handle version-specific behavior?

**Decision**: Store version in builder if needed; delegate to version-specific methods
**Rationale**:
- Most builders don't need version-specific logic
- Builders that do can store version and branch internally
- Keeps version logic contained within builders

**Example**:
```typescript
class StringBuilder extends ZodBuilder<'string', ...> {
  private _version?: 'v3' | 'v4';

  constructor(params?, version?) {
    super();
    this._params = params;
    this._version = version;
  }

  base(): string {
    // Version-specific logic if needed
    if (this._version === 'v3') {
      return 'z.string()'; // v3-specific
    }
    return 'z.string()'; // v4-specific
  }
}
```

### Unknown: How to update parsers?

**Decision**: Change from `import { build }` to using `refs.build`
**Rationale**:
- Parsers already receive refs/context parameter
- No signature changes needed
- Makes parsers version-agnostic
- Testable via mock context

**Pattern**:
```typescript
// Before
import { build } from '../ZodBuilder';
const code = build.string().min(5).text();

// After
const code = refs.build.string().min(5).text();
```

**Impact**:
- 15+ parser files need updates
- Mechanical change, can use multi_replace
- Low risk, high value

### Unknown: How to select factory at entry point?

**Decision**: Simple ternary based on options.zodVersion
**Rationale**:
- Version decision made once, not repeatedly
- Clear and explicit selection logic
- Easy to extend for future versions

**Implementation**:
```typescript
const jsonSchemaToZod = (schema: JsonSchema, options: Options): string => {
  // Select factory based on version
  const build = options.zodVersion === 'v3' ? buildV3 : buildV4;

  // Create context with injected factory
  const context: Context = {
    build,
    path: [],
    seen: new Map()
  };

  // Parse schema with injected context
  return parseSchema(schema, context);
};
```

### Unknown: How to maintain backward compatibility?

**Decision**: No backward compatibility needed - internal refactor only
**Rationale**:
- All changes are internal implementation
- Public API unchanged
- No breaking changes for users
- Existing tests validate behavior preservation

**Public API** (unchanged):
- jsonSchemaToZod() function signature
- Options type
- Generated output format
- CLI interface

### Unknown: Testing strategy?

**Decision**: Rely on existing test suite; no new tests needed
**Rationale**:
- 263 existing tests validate behavior
- Internal refactor shouldn't change outputs
- Tests act as regression safety net
- Focus on preserving test passage

**Test Checkpoints**:
- After Phase 1: Tests should compile
- After Phase 3: Tests should pass (263)
- After Phase 4: Tests should pass (263)
- After Phase 5: Tests should pass (263)
- After Phase 6: Tests should pass, builds succeed

## Best Practices

**Dependency Injection**:
- Inject at highest level (entry point)
- Pass through context/refs parameter
- Avoid global state
- Make dependencies explicit

**Factory Pattern**:
- One factory per version
- Factories create builders with correct configuration
- Keep factory logic simple
- Export factory objects, not classes

**Builder Pattern**:
- Builders remain stateless wrappers
- Store only necessary state (params, version)
- Lazy evaluation for code generation
- Fluent interface preserved

**Version Management**:
- Version selection at entry point only
- Version passed to builders via constructor
- Builders handle version-specific logic internally
- Easy to add new versions

## Decision Summary

**Core Architecture**:
- **Factory Separation**: buildV3 in v3.ts, buildV4 in v4.ts
- **Dependency Injection**: Inject build factory into Context at entry point
- **Builder Constructors**: Accept (params?, version?) instead of (params?, options?)
- **Parser Updates**: Use refs.build instead of importing build
- **Version Selection**: Once at entry point, not in every factory call

**Key Benefits**:
- Eliminates runtime detection complexity
- Makes parsers version-agnostic
- Cleaner separation of concerns
- Easier to test and extend
- Better type safety

**Implementation Risk**: Low
- Mechanical changes to parsers and builders
- Existing tests validate behavior
- Can be done incrementally
- Easy to rollback per phase

**Alternatives Rejected**:
- Keep runtime detection: Too complex and fragile
- Global factory: Not testable
- Mixed v3/v4 logic: Violates separation of concerns
- Options in constructors: Unnecessary dependency

---
*Research follows project discovery patterns - Architecture decisions documented before implementation*
