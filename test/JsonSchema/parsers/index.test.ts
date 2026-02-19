import { describe, it, expect } from 'vitest';
import { parse } from '../../../src/JsonSchema/parsers/index.js';
import { parseSchema } from '../../../src/JsonSchema/parsers/parseSchema.js';
import { buildV4 } from '../../../src/ZodBuilder/v4.js';
import type { Context } from '../../../src/Types.js';

describe('parse API', () => {
	const defaultContext: Context = {
		seen: new Map(),
		path: [],
		build: buildV4,
	};

	describe('parse.schema()', () => {
		it('should parse a simple object schema', () => {
			const schema = {
				type: 'object' as const,
				properties: {
					name: { type: 'string' as const },
					age: { type: 'number' as const },
				},
			};

			const result = parse.schema(schema, defaultContext);
			const code = result.text();

			expect(code).toContain('z.object');
			expect(code).toContain('name');
			expect(code).toContain('age');
		});

		it('should parse a simple string schema', () => {
			const schema = { type: 'string' as const };
			const result = parse.schema(schema, defaultContext);
			const code = result.text();

			expect(code).toBe('z.string()');
		});

		it('should parse a schema with anyOf', () => {
			const schema = {
				anyOf: [{ type: 'string' as const }, { type: 'number' as const }],
			};

			const result = parse.schema(schema, defaultContext);
			const code = result.text();

			expect(code).toContain('z.union');
		});
	});

	describe('parse.object()', () => {
		it('should produce a builder for object schema', () => {
			const schema = {
				type: 'object' as const,
				properties: {
					name: { type: 'string' as const },
				},
			};

			const result = parse.object(schema, defaultContext);
			const code = result.text();

			expect(code).toContain('z.object');
			expect(code).toContain('name');
			expect(code).toContain('z.string()');
		});

		it('should handle empty object schema', () => {
			const schema = { type: 'object' as const };
			const result = parse.object(schema, defaultContext);
			const code = result.text();

			// Empty object with no properties becomes z.record
			expect(code).toContain('z.record');
		});

		it('should handle required and optional properties', () => {
			const schema = {
				type: 'object' as const,
				properties: {
					required: { type: 'string' as const },
					optional: { type: 'number' as const },
				},
				required: ['required'],
			};

			const result = parse.object(schema, defaultContext);
			const code = result.text();

			expect(code).toContain('z.object');
			expect(code).toContain('required');
			expect(code).toContain('optional');
		});
	});

	describe('parse.array()', () => {
		it('should produce a builder for array schema', () => {
			const schema = {
				type: 'array' as const,
				items: { type: 'string' as const },
			};

			const result = parse.array(schema, defaultContext);
			const code = result.text();

			expect(code).toContain('z.array');
			expect(code).toContain('z.string()');
		});

		it('should handle tuple arrays', () => {
			const schema = {
				type: 'array' as const,
				items: [{ type: 'string' as const }, { type: 'number' as const }],
			};

			const result = parse.array(schema, defaultContext);
			const code = result.text();

			expect(code).toContain('z.tuple');
		});

		it('should handle array constraints', () => {
			const schema = {
				type: 'array' as const,
				items: { type: 'string' as const },
				minItems: 1,
				maxItems: 10,
			};

			const result = parse.array(schema, defaultContext);
			const code = result.text();

			expect(code).toContain('z.array');
			expect(code).toContain('min(1)');
			expect(code).toContain('max(10)');
		});
	});

	describe('parse.string()', () => {
		it('should produce a builder for string schema', () => {
			const schema = { type: 'string' as const };
			const result = parse.string(schema, defaultContext);
			const code = result.text();

			expect(code).toBe('z.string()');
		});

		it('should handle string constraints', () => {
			const schema = {
				type: 'string' as const,
				minLength: 5,
				maxLength: 50,
			};

			const result = parse.string(schema, defaultContext);
			const code = result.text();

			expect(code).toContain('z.string()');
			expect(code).toContain('min(5)');
			expect(code).toContain('max(50)');
		});
	});

	describe('parse.number()', () => {
		it('should produce a builder for number schema', () => {
			const schema = { type: 'number' as const };
			const result = parse.number(schema, defaultContext);
			const code = result.text();

			expect(code).toBe('z.number()');
		});

		it('should handle integer type', () => {
			const schema = { type: 'integer' as const };
			const result = parse.number(schema, defaultContext);
			const code = result.text();

			expect(code).toContain('z.number()');
			expect(code).toContain('int()');
		});
	});

	describe('parse.boolean()', () => {
		it('should produce a builder for boolean schema', () => {
			const schema = { type: 'boolean' as const };
			const result = parse.boolean(schema, defaultContext);
			const code = result.text();

			expect(code).toBe('z.boolean()');
		});
	});

	describe('parse.null()', () => {
		it('should produce a builder for null schema', () => {
			const schema = { type: 'null' as const };
			const result = parse.null(schema, defaultContext);
			const code = result.text();

			expect(code).toBe('z.null()');
		});
	});

	describe('parse.anyOf()', () => {
		it('should produce a union builder', () => {
			const schema = {
				anyOf: [{ type: 'string' as const }, { type: 'number' as const }],
			};

			const result = parse.anyOf(schema, defaultContext);
			const code = result.text();

			expect(code).toContain('z.union');
			expect(code).toContain('z.string()');
			expect(code).toContain('z.number()');
		});

		it('should handle single option', () => {
			const schema = {
				anyOf: [{ type: 'string' as const }],
			};

			const result = parse.anyOf(schema, defaultContext);
			const code = result.text();

			// Single option should still create union or simplify to single type
			expect(code).toBeTruthy();
		});
	});

	describe('parse.allOf()', () => {
		it('should produce an intersection builder', () => {
			const schema = {
				allOf: [
					{
						type: 'object' as const,
						properties: { a: { type: 'string' as const } },
					},
					{
						type: 'object' as const,
						properties: { b: { type: 'number' as const } },
					},
				],
			};

			const result = parse.allOf(schema, defaultContext);
			const code = result.text();

			expect(code).toContain('z.intersection');
		});
	});

	describe('parse.oneOf()', () => {
		it('should handle oneOf schemas', () => {
			const schema = {
				oneOf: [{ type: 'string' as const }, { type: 'number' as const }],
			};

			const result = parse.oneOf(schema, defaultContext);
			const code = result.text();

			// oneOf behavior depends on implementation
			expect(code).toBeTruthy();
		});
	});

	describe('new parser methods', () => {
		it('should parse enum schemas with parse.enum()', () => {
			const schema = { enum: ['a', 'b'] };
			const result = parse.enum(schema as any, defaultContext);
			expect(result.text()).toBe('z.enum(["a","b"])');
		});

		it('should parse const schemas with parse.const()', () => {
			const schema = { const: 'x' };
			const result = parse.const(schema as any, defaultContext);
			expect(result.text()).toBe('z.literal("x")');
		});

		it('should parse tuple schemas with parse.tuple()', () => {
			const schema = {
				type: 'array' as const,
				prefixItems: [{ type: 'string' as const }, { type: 'number' as const }],
			};
			const result = parse.tuple(schema as any, defaultContext);
			expect(result.text()).toBe('z.tuple([z.string(),z.number()])');
		});

		it('should support convenience aliases', () => {
			const anyOfSchema = {
				anyOf: [{ type: 'string' as const }, { type: 'number' as const }],
			};
			expect(parse.union(anyOfSchema as any, defaultContext).text()).toBe(
				parse.anyOf(anyOfSchema as any, defaultContext).text(),
			);

			const allOfSchema = {
				allOf: [
					{
						type: 'object' as const,
						properties: { a: { type: 'string' as const } },
					},
					{
						type: 'object' as const,
						properties: { b: { type: 'number' as const } },
					},
				],
			};
			expect(
				parse.intersection(allOfSchema as any, defaultContext).text(),
			).toBe(parse.allOf(allOfSchema as any, defaultContext).text());

			const oneOfSchema = {
				oneOf: [{ type: 'string' as const }, { type: 'number' as const }],
			};
			expect(
				parse.discriminatedUnion(oneOfSchema as any, defaultContext).text(),
			).toBe(parse.oneOf(oneOfSchema as any, defaultContext).text());
		});

		it('should support special type methods', () => {
			expect(parse.any(undefined as any, defaultContext).text()).toBe(
				'z.any()',
			);
			expect(parse.unknown(undefined as any, defaultContext).text()).toBe(
				'z.unknown()',
			);
			expect(parse.never(undefined as any, defaultContext).text()).toBe(
				'z.never()',
			);
		});

		it('should parse record schemas with parse.record()', () => {
			const schema = {
				type: 'object' as const,
				additionalProperties: { type: 'string' as const },
			};
			const result = parse.record(schema as any, defaultContext);
			expect(result.text()).toContain('z.record(z.string(), z.string())');
		});
	});

	describe('parse.* vs parseSchema() consistency', () => {
		it('should produce identical output for object schemas', () => {
			const schema = {
				type: 'object' as const,
				properties: {
					name: { type: 'string' as const },
					age: { type: 'number' as const },
				},
			};

			const parseResult = parse.object(schema, defaultContext);
			const parseSchemaResult = parseSchema(schema, defaultContext);

			expect(parseResult.text()).toBe(parseSchemaResult.text());
		});

		it('should produce identical output for array schemas', () => {
			const schema = {
				type: 'array' as const,
				items: { type: 'string' as const },
			};

			const parseResult = parse.array(schema, defaultContext);
			const parseSchemaResult = parseSchema(schema, defaultContext);

			expect(parseResult.text()).toBe(parseSchemaResult.text());
		});

		it('should produce identical output for string schemas', () => {
			const schema = { type: 'string' as const };

			const parseResult = parse.string(schema, defaultContext);
			const parseSchemaResult = parseSchema(schema, defaultContext);

			expect(parseResult.text()).toBe(parseSchemaResult.text());
		});

		it('should produce identical output for number schemas', () => {
			const schema = { type: 'number' as const };

			const parseResult = parse.number(schema, defaultContext);
			const parseSchemaResult = parseSchema(schema, defaultContext);

			expect(parseResult.text()).toBe(parseSchemaResult.text());
		});

		it('should produce identical output for boolean schemas', () => {
			const schema = { type: 'boolean' as const };

			const parseResult = parse.boolean(schema, defaultContext);
			const parseSchemaResult = parseSchema(schema, defaultContext);

			expect(parseResult.text()).toBe(parseSchemaResult.text());
		});

		it('should produce identical output for null schemas', () => {
			const schema = { type: 'null' as const };

			const parseResult = parse.null(schema, defaultContext);
			const parseSchemaResult = parseSchema(schema, defaultContext);

			expect(parseResult.text()).toBe(parseSchemaResult.text());
		});

		it('should produce identical output for anyOf schemas', () => {
			const schema = {
				anyOf: [{ type: 'string' as const }, { type: 'number' as const }],
			};

			const parseResult = parse.anyOf(schema, defaultContext);
			const parseSchemaResult = parseSchema(schema, defaultContext);

			expect(parseResult.text()).toBe(parseSchemaResult.text());
		});

		it('should produce identical output for allOf schemas', () => {
			const schema = {
				allOf: [
					{
						type: 'object' as const,
						properties: { a: { type: 'string' as const } },
					},
					{
						type: 'object' as const,
						properties: { b: { type: 'number' as const } },
					},
				],
			};

			const parseResult = parse.allOf(schema, defaultContext);
			const parseSchemaResult = parseSchema(schema, defaultContext);

			expect(parseResult.text()).toBe(parseSchemaResult.text());
		});
	});
});
