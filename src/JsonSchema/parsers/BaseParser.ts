import type {
	Context,
	JsonSchema,
	PreProcessor,
	PostProcessor,
	PostProcessorConfig,
	ProcessorConfig,
} from '../../Types.js';
import { parseSchema } from './parseSchema.js';
import type { ZodBuilder } from '../../ZodBuilder/BaseBuilder.js';

/**
 * Abstract base class implementing the template method for schema parsing.
 */
export abstract class BaseParser {
	protected readonly preProcessors: PreProcessor[];
	protected readonly postProcessors: PostProcessor[];

	protected constructor(
		protected readonly schema: JsonSchema,
		protected readonly refs: Context,
	) {
		this.preProcessors = this.filterPreProcessors(refs.preProcessors);
		this.postProcessors = this.filterPostProcessors(refs.postProcessors);
	}

	parse(): ZodBuilder {
		const processedSchema = this.applyPreProcessors(this.schema);
		let builder = this.parseImpl(processedSchema);
		builder = this.applyPostProcessors(builder, processedSchema);
		return this.applyMetadata(builder, processedSchema);
	}

	protected abstract parseImpl(schema: JsonSchema): ZodBuilder;
	protected abstract canProduceType(type: string): boolean;

	protected applyPreProcessors(schema: JsonSchema): JsonSchema {
		let current = schema;
		for (const processor of this.preProcessors) {
			const output = processor(current, this.refs);
			if (output !== undefined) {
				current = output;
			}
		}
		return current;
	}

	protected applyPostProcessors(
		builder: ZodBuilder,
		schema: JsonSchema,
	): ZodBuilder {
		let current = builder;
		for (const processor of this.postProcessors) {
			const output = processor(current, {
				path: this.refs.path,
				schema,
				build: this.refs.build,
			});
			if (output !== undefined) {
				current = output;
			}
		}
		return current;
	}

	protected applyMetadata(
		builder: ZodBuilder,
		schema: JsonSchema,
	): ZodBuilder {
		if (schema && typeof schema === 'object') {
			let current = builder;
			const description = (schema as Record<string, unknown>).description;
			if (!this.refs.withoutDescribes && typeof description === 'string' && description.length > 0) {
				current = current.describe(description);
			}

			if (
				!this.refs.withoutDefaults &&
				Object.prototype.hasOwnProperty.call(schema, 'default') &&
				(schema as Record<string, unknown>).default !== undefined
			) {
				current = current.default((schema as Record<string, unknown>).default);
			}

			return current;
		}

		return builder;
	}

	protected filterPreProcessors(processors: PreProcessor[] = []): PreProcessor[] {
		return processors.filter((processor) => this.isProcessorApplicable(processor));
	}

	protected filterPostProcessors(
		configs: (PostProcessor | PostProcessorConfig)[] = [],
	): PostProcessor[] {
		return configs
			.filter((config) => this.isPostProcessorMatch(config))
			.map((config) => (typeof config === 'function' ? config : config.processor));
	}

	protected isProcessorApplicable(processor: ProcessorConfig): boolean {
		if (!processor.pathPattern) return true;
		const patterns = Array.isArray(processor.pathPattern)
			? processor.pathPattern
			: [processor.pathPattern];
		return patterns.some((pattern) => this.matchesPath(pattern));
	}

	private isPostProcessorMatch(config: PostProcessor | PostProcessorConfig): boolean {
		const candidate = typeof config === 'function' ? undefined : config;
		if (candidate?.pathPattern && !this.isProcessorApplicable(candidate)) {
			return false;
		}

		const filter = candidate?.typeFilter;
		if (!filter) return true;
		const filters = Array.isArray(filter) ? filter : [filter];
		return filters.some((type) => this.canProduceType(type));
	}

	protected matchesPath(pattern: string): boolean {
		const currentPath = (this.refs.path || []).join('.');
		if (pattern === '*') return true;
		return currentPath === pattern;
	}

	protected createChildContext(pathSegment: string | number): Context {
		return {
			...this.refs,
			path: [...(this.refs.path || []), pathSegment],
		};
	}

	protected parseChild(schema: JsonSchema, pathSegment: string | number): ZodBuilder {
		return parseSchema(schema, this.createChildContext(pathSegment));
	}
}
