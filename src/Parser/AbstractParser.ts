import type {
	Context,
	PreProcessor,
	PostProcessor,
	PostProcessorConfig,
	ProcessorConfig,
} from '../Types.js';
import { matchPath as matchPattern } from '../PostProcessing/pathMatcher.js';
import type { Builder } from '../Builder/index.js';
import type { Parser } from './index.js';

// Forward declaration to avoid circular dependency
let _parseSchema:
	| ((schema: unknown, refs: Context, blockMeta?: boolean) => Builder)
	| undefined;

/**
 * Abstract base class implementing the template method for schema parsing.
 *
 * Generic and not specific to any schema format — the concrete schema type
 * is parameterised via `S`. JSON Schema parsers use `S = JSONSchemaObject`,
 * but any other object-based schema format can extend this class directly.
 */
export abstract class AbstractParser<
	TypeKind extends string = string,
	S extends object = object,
> implements Parser
{
	abstract readonly typeKind: TypeKind;

	protected readonly preProcessors: PreProcessor[];
	protected readonly postProcessors: PostProcessor[];

	constructor(
		protected readonly schema: S,
		protected readonly refs: Context,
	) {
		// Note: this.typeKind is not yet initialized when parent constructor runs
		// We filter in the parse() method instead
		this.preProcessors = [];
		this.postProcessors = [];
	}

	/**
	 * Set the parseSchema function reference to avoid circular imports.
	 * This should be called once during module initialization.
	 */
	static setParseSchema(
		fn: (schema: unknown, refs: Context, blockMeta?: boolean) => Builder,
	): void {
		_parseSchema = fn;
	}

	/**
	 * Parse a child schema. This delegates to the registered parseSchema function.
	 * Used by parser classes to recursively parse nested schemas.
	 */
	static parseSchema(
		schema: unknown,
		refs: Context,
		blockMeta?: boolean,
	): Builder {
		if (!_parseSchema) {
			throw new Error(
				'AbstractParser.setParseSchema() must be called before using AbstractParser.parseSchema()',
			);
		}
		return _parseSchema(schema, refs, blockMeta);
	}

	parse(): Builder {
		// Filter processors now that typeKind is initialized
		if (!this.preProcessors.length && this.refs.preProcessors) {
			(this as any).preProcessors = this.filterPreProcessors(
				this.refs.preProcessors,
			);
		}
		if (!this.postProcessors.length && this.refs.postProcessors) {
			(this as any).postProcessors = this.filterPostProcessors(
				this.refs.postProcessors,
			);
		}

		const processedSchema = this.applyPreProcessors(this.schema);
		let builder = this.parseImpl(processedSchema as S);
		builder = this.applyPostProcessors(builder, processedSchema);
		return this.applyMetadata(builder, processedSchema);
	}

	protected abstract parseImpl(schema: S): Builder;

	protected applyPreProcessors(schema: unknown): unknown {
		let current = schema;
		for (const processor of this.preProcessors) {
			const output = processor(current as any, this.refs) as any;
			if (output !== undefined) {
				current = output;
			}
		}
		return current;
	}

	protected applyPostProcessors(builder: Builder, schema: unknown): Builder {
		let current = builder;
		for (const processor of this.postProcessors) {
			const path = this.refs.path || [];
			const pathString =
				this.refs.pathString || (path.length ? `$.${path.join('.')}` : '$');
			const matchPath =
				this.refs.matchPath ||
				((pattern: string) => matchPattern(path, pattern));
			const output = processor(current, {
				path,
				pathString,
				schema: schema as any,
				build: this.refs.build,
				matchPath,
			});
			if (output !== undefined) {
				current = output;
			}
		}
		return current;
	}

	protected applyMetadata(builder: Builder, schema: unknown): Builder {
		if (schema && typeof schema === 'object') {
			let current = builder;
			const s = schema as Record<string, unknown>;
			const description = s.description;
			if (
				!this.refs.withoutDescribes &&
				typeof description === 'string' &&
				description.length > 0
			) {
				current = current.describe(description);
			}

			if (
				!this.refs.withoutDefaults &&
				Object.prototype.hasOwnProperty.call(schema, 'default') &&
				s.default !== undefined
			) {
				current = current.default(s.default);
			}

			return current;
		}

		return builder;
	}

	protected filterPreProcessors(
		processors: (PreProcessor & Partial<ProcessorConfig>)[] = [],
		path: (string | number)[] = this.refs.path,
	): PreProcessor[] {
		return processors.filter((processor) =>
			this.isProcessorApplicable(processor as ProcessorConfig, path),
		);
	}

	protected filterPostProcessors(
		configs: (PostProcessor | PostProcessorConfig)[] = [],
		path: (string | number)[] = this.refs.path,
	): PostProcessor[] {
		return configs
			.filter((config) => this.isPostProcessorApplicable(config, path))
			.map((config) =>
				typeof config === 'function' ? config : config.processor,
			);
	}

	private filterPostProcessorConfigsForPath(
		configs: PostProcessorConfig[] = [],
		path: (string | number)[],
	): PostProcessorConfig[] {
		return configs.filter((config) =>
			this.isPostProcessorApplicable(config, path),
		) as PostProcessorConfig[];
	}

	protected isProcessorApplicable(
		processor: ProcessorConfig,
		path: (string | number)[] = this.refs.path,
	): boolean {
		if (!processor.pathPattern) return true;
		const patterns = Array.isArray(processor.pathPattern)
			? processor.pathPattern
			: [processor.pathPattern];
		// Special case: '*' matches all paths
		if (patterns.includes('*')) return true;
		return patterns.some((pattern: string) => this.matchesPath(pattern, path));
	}

	private isPostProcessorApplicable(
		config: PostProcessor | PostProcessorConfig,
		path: (string | number)[] = this.refs.path,
	): boolean {
		const candidate = typeof config === 'function' ? undefined : config;
		if (
			candidate?.pathPattern &&
			!this.isProcessorApplicable(candidate, path)
		) {
			return false;
		}

		const filter = candidate?.typeFilter;
		if (!filter) return true;
		const filters = Array.isArray(filter) ? filter : [filter];
		return filters.some((type) => type === this.typeKind);
	}

	protected matchesPath(
		pattern: string,
		path: (string | number)[] = this.refs.path,
	): boolean {
		const matcher = this.refs.matchPath
			? this.refs.matchPath
			: (candidate: string) => matchPattern(path || [], candidate);
		return matcher(pattern);
	}

	protected createChildContext(...pathSegments: (string | number)[]): Context {
		const childPath = [...(this.refs.path || []), ...pathSegments];
		const childPathString = childPath.length ? `$.${childPath.join('.')}` : '$';
		return {
			...this.refs,
			path: childPath,
			pathString: childPathString,
			matchPath: (pattern: string) => matchPattern(childPath, pattern),
			preProcessors: this.refs.preProcessors
				? this.filterPreProcessors(this.refs.preProcessors, childPath)
				: undefined,
			postProcessors: this.refs.postProcessors
				? this.filterPostProcessorConfigsForPath(
						this.refs.postProcessors,
						childPath,
					)
				: undefined,
		};
	}

	protected parseChild(
		schema: unknown,
		...pathSegments: (string | number)[]
	): Builder {
		if (!_parseSchema) {
			throw new Error(
				'AbstractParser.setParseSchema() must be called before using parseChild()',
			);
		}
		return _parseSchema(schema, this.createChildContext(...pathSegments));
	}
}
