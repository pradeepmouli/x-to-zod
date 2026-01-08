import { describe, it, expect, beforeEach } from 'vitest';
import { matchPath, clearPathPatternCache } from '../../src/PostProcessing/pathMatcher.js';

const root = (): (string | number)[] => [];

describe('matchPath', () => {
	beforeEach(() => {
		clearPathPatternCache();
	});

	it('matches root with $', () => {
		expect(matchPath(root(), '$')).toBe(true);
		expect(matchPath(['properties'], '$')).toBe(false);
	});

	it('matches exact segments', () => {
		expect(matchPath(['properties', 'user'], '$.properties.user')).toBe(true);
		expect(matchPath(['properties', 'account'], '$.properties.user')).toBe(false);
	});

	it('supports single-level wildcard *', () => {
		expect(matchPath(['properties', 'user'], '$.properties.*')).toBe(true);
		expect(matchPath(['properties', 'user', 'properties', 'name'], '$.properties.*')).toBe(false);
	});

	it('supports deep wildcard **', () => {
		expect(
			matchPath(
				['properties', 'metadata', 'properties', 'version'],
				'$.properties.**',
			),
		).toBe(true);
		expect(matchPath(['definitions', 'thing'], '$.properties.**')).toBe(false);
	});

	it('supports recursive descent $..field', () => {
		expect(
			matchPath(
				['properties', 'contact', 'properties', 'email'],
				'$..email',
			),
		).toBe(true);
		expect(matchPath(['properties', 'contact'], '$..email')).toBe(false);
	});

	it('reuses compiled patterns from cache across calls', () => {
		const path = ['properties', 'user'];
		expect(matchPath(path, '$.properties.*')).toBe(true);
		expect(matchPath(path, '$.properties.*')).toBe(true);
		clearPathPatternCache();
		expect(matchPath(path, '$.properties.*')).toBe(true);
	});
});
