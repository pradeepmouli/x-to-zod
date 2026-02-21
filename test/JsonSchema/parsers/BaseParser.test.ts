// @ts-nocheck
import { describe, it, expect, vi } from 'vitest';
import type {
	JSONSchema,
	JSONSchemaObject,
	Context,
	PostProcessorConfig,
	PreProcessor,
} from '../../../src/Types';
import { buildV4 } from '../../../src/ZodBuilder/index.js';
import { AbstractParser } from '../../../src/Parser/AbstractParser.js';

const ctx = (overrides: Partial<Context> = {}): Context => ({
	build: buildV4,
	path: [],
	seen: new Map(),
	zodVersion: 'v4',
	...overrides,
});

class StringTestParser extends AbstractParser<'string'> {
	readonly typeKind = 'string' as const;

	constructor(
		schema: JSONSchema,
		refs: Context,
		private stepsTracker?: string[],
	) {
		super(schema, refs);
	}

	protected parseImpl(): any {
		if (this.stepsTracker) {
			this.stepsTracker.push('parseImpl');
		}
		return this.refs.build.string();
	}
}

describe('AbstractParser', () => {
	it('instantiates with schema and refs', () => {
		const parser = new StringTestParser(
			{ type: 'string' } as JSONSchema,
			ctx(),
		);
		expect(parser).toBeInstanceOf(AbstractParser);
	});

	it('executes template order: pre -> parseImpl -> post -> metadata', () => {
		const steps: string[] = [];
		const pre: PreProcessor = (schema) => {
			steps.push('pre');
			return {
				...(schema as JSONSchemaObject),
				description: 'from-pre',
			} as JSONSchema;
		};
		const post: PostProcessorConfig = {
			processor: (builder: any) => {
				steps.push('post');
				return builder.min(1);
			},
			typeFilter: 'string',
		};

		const parser = new StringTestParser(
			{ type: 'string', description: 'orig', default: 'abc' } as JSONSchema,
			ctx({ preProcessors: [pre], postProcessors: [post] }),
			steps,
		);

		const builder = parser.parse();
		const text = builder.text();

		expect(steps).toEqual(['pre', 'parseImpl', 'post']);
		expect(text).toContain('.min(1)');
		expect(text).toContain('.describe("from-pre")');
		expect(text).toContain('.default("abc")');
	});

	it('applies metadata for description and default', () => {
		const parser = new StringTestParser(
			{ type: 'string', description: 'desc', default: 'x' } as JSONSchema,
			ctx(),
		);

		const text = parser.parse().text();

		expect(text).toContain('.describe("desc")');
		expect(text).toContain('.default("x")');
	});

	it('filters post-processors by typeFilter', () => {
		const postHit = vi.fn((builder) => builder.min(1));
		const postSkip = vi.fn((builder) => builder.max(2));

		const parser = new StringTestParser(
			{ type: 'string' } as JSONSchema,
			ctx({
				postProcessors: [
					{ processor: postHit, typeFilter: 'string' },
					{ processor: postSkip, typeFilter: 'object' },
				],
			}),
		);

		const text = parser.parse().text();

		expect(text).toContain('.min(1)');
		expect(text).not.toContain('.max(2)');
		expect(postHit).toHaveBeenCalled();
		expect(postSkip).not.toHaveBeenCalled();
	});
});
