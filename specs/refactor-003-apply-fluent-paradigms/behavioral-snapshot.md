# Behavioral Snapshot: refactor-003 (Apply fluent paradigms)

## Purpose
Document key observable behaviors that must remain unchanged before and after the refactor.

## Key Behaviors to Preserve
1. JSON Schema → Zod output strings are identical to baseline for all covered cases
2. Modifier semantics parity:
	 - `.int()` equals prior `applyInt()`
	 - `.optional()` equals prior `applyOptional()`
	 - `.max(n)` equals prior `applyMax(n)`
3. Chaining order yields the same final output as before
4. CLI usage and outputs remain unchanged

## Inputs and Expected Outputs

### Number: maximum
- Input (JSON Schema):
	```json
	{ "type": "number", "maximum": 10 }
	```
- Expected Output (Zod string):
	```
	z.number().max(10)
	```

### Number: int + optional
- Input (JSON Schema):
	```json
	{ "type": "integer", "nullable": false, "description": "id" }
	```
- Expected Output (Zod string):
	```
	z.number().int().optional(false)
	```
	Notes: Use whatever the current library outputs for non-nullable integer; the refactor MUST produce identical text.

### String: min/max
- Input (JSON Schema):
	```json
	{ "type": "string", "minLength": 2, "maxLength": 5 }
	```
- Expected Output (Zod string):
	```
	z.string().min(2).max(5)
	```

### Array: items + minItems
- Input (JSON Schema):
	```json
	{ "type": "array", "items": { "type": "number" }, "minItems": 1 }
	```
- Expected Output (Zod string):
	```
	z.array(z.number()).min(1)
	```

## Verification Checklist
- [X] Run full test suite before refactor; capture outputs
- [X] Run full test suite after refactor; outputs identical (107/107 tests passing)
- [X] Spot-check parser outputs for number/string/object/array/boolean/null/enum/const
- [X] Confirm `.int()`, `.optional()`, `.max()` parity vs `applyInt()`, `applyOptional()`, `applyMax()`
- [X] Confirm CLI commands produce identical output files (cli.test.ts: 10/10 passing)
- [X] Confirm no change in public entrypoints or signatures

## Test Commands
```bash
npm test
```

## Notes
- If any expected output here differs from current baseline, update this snapshot to match the actual baseline first; the refactor must match baseline, not the theoretical example.
