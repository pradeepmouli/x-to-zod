import { describe, expect, it } from 'vitest';
import {
	its,
	isObjectSchema,
	isPrimitiveSchema,
	isAnyOfSchema,
} from '../../src/JsonSchema/its.js';

describe('JSONSchema its guards', () => {
	it('supports flat guard API on its', () => {
		expect(its.object({ type: 'object' })).toBe(true);
		expect(its.array({ type: 'array' })).toBe(true);
		expect(its.primitive({ type: 'string' }, 'string')).toBe(true);
		expect(its.anyOf({ anyOf: [{ type: 'string' }] })).toBe(true);
	});

	it('supports named guard exports', () => {
		expect(isObjectSchema({ type: 'object' })).toBe(true);
		expect(isPrimitiveSchema({ type: 'number' }, 'number')).toBe(true);
		expect(isAnyOfSchema({ anyOf: [{ type: 'string' }] })).toBe(true);
	});

	it('returns false for non-object and null inputs', () => {
		expect(its.object(null)).toBe(false);
		expect(its.array(undefined)).toBe(false);
		expect(its.primitive('x', 'string')).toBe(false);
		expect(its.anyOf(1)).toBe(false);
		expect(its.const(false)).toBe(false);
	});
});
