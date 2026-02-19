import { describe, expect, it } from 'vitest';
import {
	is,
	isObjectSchema,
	isPrimitiveSchema,
	isAnyOfSchema,
} from '../../src/JsonSchema/its.js';

describe('JSONSchema is guards', () => {
	it('supports flat guard API on is', () => {
		expect(is.object({ type: 'object' })).toBe(true);
		expect(is.array({ type: 'array' })).toBe(true);
		expect(is.primitive({ type: 'string' }, 'string')).toBe(true);
		expect(is.anyOf({ anyOf: [{ type: 'string' }] })).toBe(true);
	});

	it('supports named guard exports', () => {
		expect(isObjectSchema({ type: 'object' })).toBe(true);
		expect(isPrimitiveSchema({ type: 'number' }, 'number')).toBe(true);
		expect(isAnyOfSchema({ anyOf: [{ type: 'string' }] })).toBe(true);
	});

	it('returns false for non-object and null inputs', () => {
		expect(is.object(null)).toBe(false);
		expect(is.array(undefined)).toBe(false);
		expect(is.primitive('x', 'string')).toBe(false);
		expect(is.anyOf(1)).toBe(false);
		expect(is.const(false)).toBe(false);
	});
});
