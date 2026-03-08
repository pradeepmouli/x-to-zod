import type { Context } from '../context.js';
import type {
	SchemaTransformer,
	PostProcessor,
	PostProcessorConfig,
	ProcessorConfig,
} from '../PostProcessing/types.js';
import { matchPath as matchPattern } from '../PostProcessing/pathMatcher.js';
import type { Builder } from '../Builder/index.js';
import type { Parser } from './index.js';
import type { InferTypeKind } from './SchemaTypes.js';

// Forward declaration to avoid circular dependency
let _parseSchema:
	| ((schema: unknown, refs: Context, blockMeta?: boolean) => Builder)
	| undefined;

/**
 * Abstract base class implementing the template method for schema parsing.
 *
 * Generic and not specific to any schema format — the concrete schema type
 * is parameterised via `S`. JSON Schema parsers use `S = SchemaNode`,
 * but any other object-based schema format can extend this class directly.
 *
 * The generic parameter order mirrors `ZodBuilder<Z, T = Z['def']['type']>`:
 * the primary schema type comes first and the `TypeKind` discriminator is
 * inferred from it when `S` has a string `type` property.
 */
export abstract class AbstractParser<
	S extends object = object,
	TypeKind extends string = InferTypeKind<S>,
> implements Parser {
	abstract readonly typeKind: TypeKind;

	protected transformers: SchemaTransformer[];
	protected postProcessors: PostProcessor[];

	constructor(
		protected readonly schema: S,
		protected readonly refs: Context,
	) {
		// Note: this.typeKind is not yet initialized when parent constructor runs
		// We filter in the parse() method instead
		this.transformers = [];
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
		if (!this.transformers.length && this.refs.transformers) {
			this.transformers = this.filterTransformers(this.refs.transformers);
		}
		if (!this.postProcessors.length && this.refs.postProcessors) {
			this.postProcessors = this.filterPostProcessors(this.refs.postProcessors);
		}

		const processedSchema = this.applyTransformers(this.schema);
		let builder = this.parseImpl(processedSchema as S);
		builder = this.applyPostProcessors(builder, processedSchema);
		return this.applyMetadata(builder, processedSchema);
	}

	protected abstract parseImpl(schema: S): Builder;

	protected applyTransformers(schema: unknown): unknown {
		let current = schema;
		for (const transformer of this.transformers) {
			const output = transformer(current as any, this.refs) as any;
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

	protected applyMetadata(builder: Builder, _schema: unknown): Builder {
		const adapter = this.refs.adapter;
		if (adapter) {
			const meta = adapter.getMetadata(this.schema);
			let current = builder;
			if (
				!this.refs.withoutDescribes &&
				typeof meta.description === 'string' &&
				meta.description.length > 0
			) {
				current = current.describe(meta.description);
			}
			if (!this.refs.withoutDefaults && meta.default !== undefined) {
				current = current.default(meta.default);
			}
			return current;
		}

		// Legacy field-access for when no adapter is set (use the processed schema)
		if (_schema && typeof _schema === 'object') {
			const schema = _schema;
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

	protected filterTransformers(
		transformers: (SchemaTransformer & Partial<ProcessorConfig>)[] = [],
		path: (string | number)[] = this.refs.path,
	): SchemaTransformer[] {
		return transformers.filter((t) =>
			this.isProcessorApplicable(t as ProcessorConfig, path),
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
			transformers: this.refs.transformers
				? this.filterTransformers(this.refs.transformers, childPath)
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
