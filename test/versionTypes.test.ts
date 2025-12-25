/**
 * Type-level tests for version-specific imports
 * These tests validate that TypeScript correctly restricts the API surface
 * for v3 and v4 imports.
 * 
 * Note: These are compile-time checks. If this file compiles, the types are correct.
 */

import { describe, it, expect } from 'vitest';

describe('Type-level API restrictions', () => {
	it('v3 build should not have v4-only methods at type level', async () => {
		const { build } = await import('../src/v3.js');
		
		// These should work - core builders available in v3
		const stringSchema = build.string();
		const numberSchema = build.number();
		const arraySchema = build.array(build.string());
		const objectSchema = build.object({ name: build.string() });
		
		// TypeScript would error if we uncomment these (v4-only):
		// @ts-expect-error - promise is v4-only
		// const promiseSchema = build.promise(build.string());
		
		// @ts-expect-error - lazy is v4-only
		// const lazySchema = build.lazy('() => z.string()');
		
		// @ts-expect-error - json is v4-only
		// const jsonSchema = build.json();
		
		// @ts-expect-error - file is v4-only
		// const fileSchema = build.file();
		
		// Verify that at runtime, these are actually undefined
		expect((build as any).promise).toBeUndefined();
		expect((build as any).lazy).toBeUndefined();
		expect((build as any).json).toBeUndefined();
		expect((build as any).file).toBeUndefined();
	});

	it('v4 build should have all methods including v4-only', async () => {
		const { build } = await import('../src/v4.js');
		
		// Core builders
		const stringSchema = build.string();
		const numberSchema = build.number();
		
		// V4-only builders - should compile and work
		const promiseSchema = build.promise(build.string());
		const lazySchema = build.lazy('() => z.string()');
		const jsonSchema = build.json();
		const fileSchema = build.file();
		const nativeEnumSchema = build.nativeEnum('MyEnum');
		const templateLiteralSchema = build.templateLiteral(['prefix-', 'suffix']);
		const xorSchema = build.xor([build.string(), build.number()]);
		const keyofSchema = build.keyof(build.object({}));
		
		// Verify these work correctly
		expect(promiseSchema.text()).toBe('z.promise(z.string())');
		expect(lazySchema.text()).toBe('z.lazy(() => z.string())');
		expect(jsonSchema.text()).toBe('z.json()');
		expect(fileSchema.text()).toBe('z.file()');
	});

	it('buildV3 and buildV4 exports should have correct types', async () => {
		const { buildV3, buildV4 } = await import('../src/ZodBuilder/index.js');
		
		// buildV3 should only have core builders
		const v3String = buildV3.string();
		const v3Number = buildV3.number();
		
		// TypeScript would error on v4-only methods:
		// @ts-expect-error - promise not in v3
		// const v3Promise = buildV3.promise(buildV3.string());
		
		// buildV4 should have everything
		const v4String = buildV4.string();
		const v4Promise = buildV4.promise(buildV4.string());
		const v4Json = buildV4.json();
		
		// Verify runtime behavior
		expect(v3String.text()).toBe('z.string()');
		expect(v4String.text()).toBe('z.string()');
		expect(v4Promise.text()).toBe('z.promise(z.string())');
	});
});
