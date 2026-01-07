import { describe, it, expect } from 'vitest';
import { buildV4 } from '../../src/ZodBuilder/v4.js';
import type { Context } from '../../src/Types.js';
import { BooleanParser } from '../../src/JsonSchema/parsers/BooleanParser.js';
import {
	is,
	isObjectBuilder,
	isArrayBuilder,
	isStringBuilder,
	isNumberBuilder,
	isBooleanBuilder,
	isNullBuilder,
	isUnionBuilder,
	isIntersectionBuilder,
	isLazyBuilder,
} from '../../src/utils/is.js';

describe('Type Guards', () => {
	describe('isObjectBuilder', () => {
		it('returns true for ObjectBuilder', () => {
			const builder = buildV4.object({ name: buildV4.string() });
			expect(isObjectBuilder(builder)).toBe(true);
		});

		it('returns false for non-ObjectBuilder', () => {
			expect(isObjectBuilder(buildV4.string())).toBe(false);
			expect(isObjectBuilder(buildV4.number())).toBe(false);
			expect(isObjectBuilder(null)).toBe(false);
			expect(isObjectBuilder(undefined)).toBe(false);
		});
	});

	describe('isArrayBuilder', () => {
		it('returns true for ArrayBuilder', () => {
			const builder = buildV4.array(buildV4.string());
			expect(isArrayBuilder(builder)).toBe(true);
		});

		it('returns false for non-ArrayBuilder', () => {
			expect(isArrayBuilder(buildV4.string())).toBe(false);
			expect(isArrayBuilder(buildV4.object({}))).toBe(false);
		});
	});

	describe('isStringBuilder', () => {
		it('returns true for StringBuilder', () => {
			const builder = buildV4.string();
			expect(isStringBuilder(builder)).toBe(true);
		});

		it('returns false for non-StringBuilder', () => {
			expect(isStringBuilder(buildV4.number())).toBe(false);
			expect(isStringBuilder(buildV4.boolean())).toBe(false);
		});
	});

	describe('isNumberBuilder', () => {
		it('returns true for NumberBuilder', () => {
			const builder = buildV4.number();
			expect(isNumberBuilder(builder)).toBe(true);
		});

		it('returns false for non-NumberBuilder', () => {
			expect(isNumberBuilder(buildV4.string())).toBe(false);
			expect(isNumberBuilder(buildV4.boolean())).toBe(false);
		});
	});

	describe('isBooleanBuilder', () => {
		it('returns true for BooleanBuilder', () => {
			const builder = buildV4.boolean();
			expect(isBooleanBuilder(builder)).toBe(true);
		});

		it('returns false for non-BooleanBuilder', () => {
			expect(isBooleanBuilder(buildV4.string())).toBe(false);
			expect(isBooleanBuilder(buildV4.number())).toBe(false);
		});
	});

	describe('isNullBuilder', () => {
		it('returns true for NullBuilder', () => {
			const builder = buildV4.null();
			expect(isNullBuilder(builder)).toBe(true);
		});

		it('returns false for non-NullBuilder', () => {
			expect(isNullBuilder(buildV4.string())).toBe(false);
			expect(isNullBuilder(buildV4.boolean())).toBe(false);
		});
	});

	describe('isUnionBuilder', () => {
		it('returns true for UnionBuilder', () => {
			const builder = buildV4.union([buildV4.string(), buildV4.number()]);
			expect(isUnionBuilder(builder)).toBe(true);
		});

		it('returns false for non-UnionBuilder', () => {
			expect(isUnionBuilder(buildV4.string())).toBe(false);
			expect(isUnionBuilder(buildV4.object({}))).toBe(false);
		});
	});

	describe('isIntersectionBuilder', () => {
		it('returns true for IntersectionBuilder', () => {
			const builder = buildV4.intersection(
				buildV4.object({ a: buildV4.string() }),
				buildV4.object({ b: buildV4.number() }),
			);
			expect(isIntersectionBuilder(builder)).toBe(true);
		});

		it('returns false for non-IntersectionBuilder', () => {
			expect(isIntersectionBuilder(buildV4.string())).toBe(false);
			expect(isIntersectionBuilder(buildV4.union([buildV4.string()]))).toBe(
				false,
			);
		});
	});

	describe('isLazyBuilder', () => {
		it('returns true for LazyBuilder', () => {
			const builder = buildV4.lazy(buildV4.string());
			expect(isLazyBuilder(builder)).toBe(true);
		});

		it('returns false for non-LazyBuilder', () => {
			expect(isLazyBuilder(buildV4.string())).toBe(false);
			expect(isLazyBuilder(buildV4.object({}))).toBe(false);
		});
	});

	describe('isParserOfKind', () => {
		const ctx = (): Context => ({
			build: buildV4,
			path: [],
			seen: new Map(),
			zodVersion: 'v4',
		});

		it('returns true when typeKind matches', () => {
			const parser = new BooleanParser({ type: 'boolean' }, ctx());
			expect(is.parserOfKind(parser, 'boolean')).toBe(true);
		});

		it('returns false when typeKind differs', () => {
			const parser = new BooleanParser({ type: 'boolean' }, ctx());
			expect(is.parserOfKind(parser, 'string')).toBe(false);
		});
	});

	describe('is namespace', () => {
		it('provides all type guards', () => {
			expect(is.objectBuilder).toBeDefined();
			expect(is.arrayBuilder).toBeDefined();
			expect(is.stringBuilder).toBeDefined();
			expect(is.numberBuilder).toBeDefined();
			expect(is.booleanBuilder).toBeDefined();
			expect(is.nullBuilder).toBeDefined();
			expect(is.unionBuilder).toBeDefined();
			expect(is.intersectionBuilder).toBeDefined();
			expect(is.lazyBuilder).toBeDefined();
			expect(is.parserOfKind).toBeDefined();
		});

		it('works with is namespace', () => {
			expect(is.stringBuilder(buildV4.string())).toBe(true);
			expect(is.objectBuilder(buildV4.object({}))).toBe(true);
		});
	});
});
