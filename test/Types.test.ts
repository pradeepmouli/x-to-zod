// @ts-nocheck
import { describe, it, expect } from 'vitest';
import type {
	PreProcessor,
	PostProcessor,
	PostProcessorConfig,
	PostProcessorContext,
	ProcessorConfig,
	ProcessorPathPattern,
	JSONSchema,
	Context,
} from '../src/Types.js';
import { buildV4 } from '../src/ZodBuilder/index.js';

describe('Processor Types', () => {
	describe('ProcessorPathPattern', () => {
		it('accepts string pattern', () => {
			const pattern: ProcessorPathPattern = 'properties.name';
			expect(typeof pattern).toBe('string');
		});

		it('accepts array of string patterns', () => {
			const pattern: ProcessorPathPattern = [
				'properties.name',
				'properties.email',
			];
			expect(Array.isArray(pattern)).toBe(true);
		});
	});

	describe('ProcessorConfig', () => {
		it('can have pathPattern as string', () => {
			const config: ProcessorConfig = {
				pathPattern: 'properties.name',
			};
			expect(config.pathPattern).toBe('properties.name');
		});

		it('can have pathPattern as array', () => {
			const config: ProcessorConfig = {
				pathPattern: ['properties.name', 'properties.email'],
			};
			expect(Array.isArray(config.pathPattern)).toBe(true);
		});

		it('can have no pathPattern (optional)', () => {
			const config: ProcessorConfig = {};
			expect(config.pathPattern).toBeUndefined();
		});
	});

	describe('PreProcessor', () => {
		it('is a function that transforms schema', () => {
			const processor: PreProcessor = (schema: JSONSchema) => {
				if (typeof schema === 'object' && schema !== null) {
					return {
						...schema,
						description: 'processed',
					};
				}
				return schema;
			};

			const input: JSONSchema = { type: 'string' };
			const output = processor(input, {} as Context);

			expect(output).toEqual(
				expect.objectContaining({ description: 'processed' }),
			);
		});

		it('can return undefined to skip transformation', () => {
			const processor: PreProcessor = () => undefined;

			const input: JSONSchema = { type: 'string' };
			const output = processor(input, {} as Context);

			expect(output).toBeUndefined();
		});

		it('can have pathPattern configuration', () => {
			const processor: PreProcessor = function (schema: JSONSchema) {
				return schema;
			};
			processor.pathPattern = 'properties.name';

			expect(processor.pathPattern).toBe('properties.name');
		});

		it('receives context with path information', () => {
			const processor: PreProcessor = (schema: JSONSchema, refs: Context) => {
				expect(refs.path).toBeDefined();
				return schema;
			};

			processor({ type: 'string' }, {
				path: ['properties', 'name'],
				build: buildV4,
				seen: new Map(),
			} as Context);
		});
	});

	describe('PostProcessorContext', () => {
		it('has path property (array of string and numbers)', () => {
			const context: PostProcessorContext = {
				path: ['properties', 'name', 0],
				schema: { type: 'string' },
				build: buildV4,
			};

			expect(context.path).toEqual(['properties', 'name', 0]);
		});

		it('has schema property', () => {
			const context: PostProcessorContext = {
				path: [],
				schema: { type: 'string', description: 'Name field' },
				build: buildV4,
			};

			expect(context.schema).toEqual(
				expect.objectContaining({ description: 'Name field' }),
			);
		});

		it('has build property (v3 or v4)', () => {
			const context: PostProcessorContext = {
				path: [],
				schema: { type: 'string' },
				build: buildV4,
			};

			expect(context.build).toBeDefined();
			expect(typeof context.build).toBe('object');
			expect(context.build.string).toBeDefined();
		});
	});

	describe('PostProcessor', () => {
		it('is a function that transforms a builder', () => {
			const processor: PostProcessor = (builder) => {
				return builder.min(1);
			};

			const builder = buildV4.string();
			const result = processor(builder, {
				path: [],
				schema: { type: 'string' },
				build: buildV4,
			});

			expect(result).toBeDefined();
			expect(result?.text()).toContain('.min(1)');
		});

		it('can return undefined to skip transformation', () => {
			const processor: PostProcessor = () => undefined;

			const builder = buildV4.string();
			const result = processor(builder, {
				path: [],
				schema: { type: 'string' },
				build: buildV4,
			});

			expect(result).toBeUndefined();
		});

		it('receives PostProcessorContext with schema and path', () => {
			const processor: PostProcessor = (builder, context) => {
				expect(context.schema).toBeDefined();
				expect(context.path).toBeDefined();
				expect(context.build).toBeDefined();
				return builder;
			};

			const builder = buildV4.string();
			processor(builder, {
				path: ['properties', 'email'],
				schema: { type: 'string', format: 'email' },
				build: buildV4,
			});
		});
	});

	describe('PostProcessorConfig', () => {
		it('has processor function property', () => {
			const processor: PostProcessor = (builder) => builder.min(1);
			const config: PostProcessorConfig = { processor };

			expect(config.processor).toBe(processor);
		});

		it('can have typeFilter as string', () => {
			const config: PostProcessorConfig = {
				processor: (builder) => builder,
				typeFilter: 'string',
			};

			expect(config.typeFilter).toBe('string');
		});

		it('can have typeFilter as array of strings', () => {
			const config: PostProcessorConfig = {
				processor: (builder) => builder,
				typeFilter: ['string', 'StringBuilder'],
			};

			expect(Array.isArray(config.typeFilter)).toBe(true);
		});

		it('can have pathPattern (inherited from ProcessorConfig)', () => {
			const config: PostProcessorConfig = {
				processor: (builder) => builder,
				pathPattern: 'properties.name',
			};

			expect(config.pathPattern).toBe('properties.name');
		});

		it('can have both pathPattern and typeFilter', () => {
			const config: PostProcessorConfig = {
				processor: (builder) => builder.min(1),
				pathPattern: ['properties.name', 'properties.email'],
				typeFilter: ['string', 'StringBuilder'],
			};

			expect(config.pathPattern).toEqual([
				'properties.name',
				'properties.email',
			]);
			expect(config.typeFilter).toEqual(['string', 'StringBuilder']);
		});

		it('is compatible with plain function (PostProcessor)', () => {
			const processor: PostProcessor = (builder) => builder.max(100);
			const configs: (PostProcessor | PostProcessorConfig)[] = [
				processor,
				{
					processor: (builder) => builder.min(1),
					typeFilter: 'string',
				},
			];

			expect(configs).toHaveLength(2);
			expect(typeof configs[0]).toBe('function');
			expect(typeof configs[1]).toBe('object');
		});
	});

	describe('Processor Integration', () => {
		it('can create a pre-processor with pathPattern and use in Context', () => {
			const preProc: PreProcessor = (schema) => {
				if (typeof schema === 'object' && schema !== null) {
					return { ...schema, minLength: 5 };
				}
				return schema;
			};
			preProc.pathPattern = 'properties.username';

			const context: Context = {
				build: buildV4,
				path: ['properties', 'username'],
				seen: new Map(),
				preProcessors: [preProc],
			};

			expect(context.preProcessors).toHaveLength(1);
			expect(context.preProcessors?.[0].pathPattern).toBe(
				'properties.username',
			);
		});

		it('can create post-processors with different typeFilters', () => {
			const stringProcessor: PostProcessorConfig = {
				processor: (builder) => builder.min(1),
				typeFilter: 'string',
			};

			const numberProcessor: PostProcessorConfig = {
				processor: (builder) => builder.min(0),
				typeFilter: 'number',
			};

			const context: Context = {
				build: buildV4,
				path: [],
				seen: new Map(),
				postProcessors: [stringProcessor, numberProcessor],
			};

			expect(context.postProcessors).toHaveLength(2);
			expect(context.postProcessors?.[0].typeFilter).toBe('string');
			expect(context.postProcessors?.[1].typeFilter).toBe('number');
		});

		it('can mix processor functions and configs in postProcessors array', () => {
			const plainProcessor: PostProcessor = (builder) => builder.optional();
			const configProcessor: PostProcessorConfig = {
				processor: (builder) => builder.nullable(),
				typeFilter: 'string',
			};

			const context: Context = {
				build: buildV4,
				path: [],
				seen: new Map(),
				postProcessors: [plainProcessor, configProcessor],
			};

			expect(context.postProcessors).toHaveLength(2);
		});
	});
});
