import { describe, it, expect } from 'vitest';
import { postProcessors } from '../../src/PostProcessing/presets.js';
import { buildV4 } from '../../src/ZodBuilder/v4.js';

const ctx = (pathString: string = '$.properties.field') => ({
	path: pathString.split('.').filter(Boolean),
	pathString,
	schema: {},
	build: buildV4,
	matchPath: (pattern: string): boolean => pattern === pathString || pattern === '$..id',
});

describe('postProcessors presets', () => {
	it('strictObjects makes objects strict', () => {
		const processor = postProcessors.strictObjects();
		const builder = buildV4.object({ name: buildV4.string() });
		const result = processor(builder, ctx());
		const strictBuilder = result ?? builder;
		expect(strictBuilder.text()).toContain('strictObject');
	});

	it('nonemptyArrays makes arrays nonempty', () => {
		const processor = postProcessors.nonemptyArrays();
		const builder = buildV4.array(buildV4.string());
		const result = processor(builder, ctx());
		const arrayBuilder = result ?? builder;
		expect(arrayBuilder.text()).toContain('.min(1)');
	});

	it('brandIds brands string id fields with default brand', () => {
		const processor = postProcessors.brandIds();
		const builder = buildV4.string();
		const result = processor(builder, ctx('$..id'));
		const branded = result ?? builder;
		expect(branded.text()).toContain('.brand("ID")');
	});

	it('makeOptional adds optional when pattern matches', () => {
		const processor = postProcessors.makeOptional('$.properties.field');
		const builder = buildV4.number();
		const result = processor(builder, ctx('$.properties.field'));
		const optional = result ?? builder;
		expect(optional.text()).toContain('.optional()');
	});

	it('makeRequired removes optional when pattern matches', () => {
		const processor = postProcessors.makeRequired('$.properties.field');
		const builder = buildV4.number().optional();
		const result = processor(builder, ctx('$.properties.field'));
		const required = result ?? builder;
		expect(required.text()).not.toContain('.optional()');
	});

	it('matchPath wrapper only applies transform when pattern matches', () => {
		const builder = buildV4.string();
		const transform = (b: any): any => b.email();
		const processor = postProcessors.matchPath(
			'$.properties.email',
			(b, context) => {
				const localCtx = context as ReturnType<typeof ctx>;
				if (localCtx.matchPath('$.properties.email')) {
					return transform(b);
				}
				return undefined;
			},
		);
		const unmatched = processor(builder, ctx('$.properties.name')) ?? builder;
		expect(unmatched.text()).not.toContain('.email(');
		const matched = processor(builder, ctx('$.properties.email')) ?? builder;
		expect(matched.text()).toContain('.email(');
	});
});
