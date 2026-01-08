import { describe, it, expect } from 'vitest';
import jsonSchemaToZod from '../../src/index.js';
import { is } from '../../src/utils/is.js';

const schema = {
	type: 'object',
	properties: {
		name: { type: 'string' },
		metadata: {
			type: 'object',
			properties: {
				tag: { type: 'string' },
				id: { type: 'string' },
			},
		},
	},
};

describe('postProcessors integration', () => {
	it('applies processors during parsing for strict objects, optional paths, and branded ids', () => {
		const code = jsonSchemaToZod(schema, {
			module: 'esm',
			postProcessors: [
				(builder) => (is.objectBuilder(builder) ? builder.strict() : undefined),
				(builder, ctx) =>
					ctx.matchPath('$.properties.metadata.**')
						? builder.optional()
						: undefined,
				(builder, ctx) =>
					ctx.matchPath('$..id') && is.stringBuilder(builder)
						? builder.brand('ID')
						: undefined,
			],
		});

		expect(code).toContain('.strict()');
		expect(code).toContain('.optional()');
		expect(code).toContain('metadata:');
		expect(code).toContain('.brand("ID")');
	});
});
