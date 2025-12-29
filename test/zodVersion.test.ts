import { describe, it, expect } from 'vitest';
import { jsonSchemaToZod } from '../src/index.js';
import { buildV3, buildV4 } from '../src/ZodBuilder/index.js';

describe('Zod Version Support', () => {
	describe('Configuration', () => {
		it('should accept zodVersion option', () => {
			const schema = { type: 'string' as const };

			// Should not throw
			const v4Result = jsonSchemaToZod(schema, { zodVersion: 'v4' });
			const v3Result = jsonSchemaToZod(schema, { zodVersion: 'v3' });

			expect(v4Result).toBeTruthy();
			expect(v3Result).toBeTruthy();
		});

		it('should default to v4 for new code', () => {
			const schema = { type: 'string' as const };
			const result = jsonSchemaToZod(schema);

			// Default behavior should be v4
			expect(result).toBe('z.string()');
		});
	});

	describe('ObjectBuilder - strict mode', () => {
		it('should generate z.strictObject() in v4 mode when building fresh', () => {
			const builder = buildV4.object({ name: buildV4.string() }).strict();
			expect(builder.text()).toBe('z.strictObject({ "name": z.string() })');
		});

		it('should generate .strict() method in v3 mode', () => {
			const schema = {
				type: 'object' as const,
				properties: {
					name: { type: 'string' as const },
				},
				additionalProperties: false,
			};

			const result = jsonSchemaToZod(schema, { zodVersion: 'v3' });
			expect(result).toBe(
				'z.object({ "name": z.string().optional() }).strict()',
			);
		});

		it('should handle additionalProperties: false in v4 mode', () => {
			const schema = {
				type: 'object' as const,
				properties: {
					name: { type: 'string' as const },
				},
				additionalProperties: false,
			};

			const result = jsonSchemaToZod(schema, { zodVersion: 'v4' });
			// When using fromCode path, still uses .strict() method
			expect(result).toBe(
				'z.object({ "name": z.string().optional() }).strict()',
			);
		});
	});

	describe('ObjectBuilder - loose/passthrough mode', () => {
		it('should use loose in builder API for v4', () => {
			const builder = buildV4.object({ name: buildV4.string() }).loose();
			expect(builder.text()).toBe('z.looseObject({ "name": z.string() })');
		});

		it('should generate z.strictObject() for strict mode in v4', () => {
			const builder = buildV4.object({ name: buildV4.string() }).strict();
			expect(builder.text()).toBe('z.strictObject({ "name": z.string() })');
		});
	});

	describe('ObjectBuilder - merge method', () => {
		it('should use .extend() in v4 mode', () => {
			const builder = buildV4
				.object({ name: buildV4.string() })
				.merge('otherSchema');
			expect(builder.text()).toContain('.extend(otherSchema)');
		});

		it('should use .merge() in v3 mode', () => {
			const builder = buildV3
				.object({ name: buildV3.string() })
				.merge('otherSchema');
			expect(builder.text()).toContain('.merge(otherSchema)');
		});
	});

	describe('Error Message Parameters (Future)', () => {
		// TODO: Implement once error message handling is version-aware
		it.skip('should use error parameter in v4 mode', () => {
			const schema = {
				type: 'string' as const,
				errorMessage: { type: 'Must be a string' },
			};

			const result = jsonSchemaToZod(schema, { zodVersion: 'v4' });
			expect(result).toContain('error:');
			expect(result).not.toContain('message:');
		});

		it.skip('should use message parameter in v3 mode', () => {
			const schema = {
				type: 'string' as const,
				errorMessage: { type: 'Must be a string' },
			};

			const result = jsonSchemaToZod(schema, { zodVersion: 'v3' });
			expect(result).toContain('message:');
			expect(result).not.toContain('error:');
		});
	});
});
