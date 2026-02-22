/**
 * T012: Builder interface type-level + chain test (Gap 4).
 *
 * These tests MUST fail before `src/Builder/index.ts` exists.
 * After T014 creates the interface and T015 adds `implements Builder` to ZodBuilder,
 * all tests here should pass.
 */
import { describe, it, expect } from 'vitest';
import type { Builder } from '../../src/Builder/index.js';
import { buildV4 } from '../../src/ZodBuilder/index.js';
import type { ZodBuilder } from '../../src/ZodBuilder/BaseBuilder.js';

describe('Builder interface — Gap 4', () => {
	it('ZodBuilder satisfies the Builder interface structurally', () => {
		// If ZodBuilder doesn't satisfy Builder, this assignment will be a TypeScript error.
		const builder = buildV4.string();
		const b: Builder = builder;
		expect(b).toBeDefined();
	});

	it('Builder supports the full method chain', () => {
		const b: Builder = buildV4.string();
		// Chain all interface methods — TypeScript ensures they exist on Builder
		const result = b.optional().nullable().describe('a test field').readonly();
		expect(result.text()).toContain('z.string()');
	});

	it('Builder.text() returns a non-empty TypeScript code string', () => {
		const b: Builder = buildV4.number();
		expect(b.text()).toBeTypeOf('string');
		expect(b.text().length).toBeGreaterThan(0);
	});

	it('Builder.typeKind is accessible', () => {
		const b: Builder = buildV4.string();
		expect(b.typeKind).toBeTypeOf('string');
	});

	it('Builder.default() applies a default value', () => {
		const b: Builder = buildV4.string();
		expect(b.default('hello').text()).toContain('default');
	});

	it('Builder.describe() applies a description', () => {
		const b: Builder = buildV4.string();
		expect(b.describe('My field').text()).toContain('describe');
	});
});
